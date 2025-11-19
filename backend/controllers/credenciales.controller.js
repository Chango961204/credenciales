import path from "path";
import { fileURLToPath } from "url";
import { generarCredencialFiles } from "../services/credenciales.service.js";
import fs from "fs";
import Empleado from "../models/Empleados.js";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generarCredencial = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleadoData = empleado.toJSON();
    const result = await generarCredencialFiles(empleadoData);

    await req.audit({
      event: "credential_generated",
      model: "credenciales",
      modelId: String(empleado.id),
      oldValues: null,
      newValues: { frente: !!result.frenteDataUrl, reverso: !!result.reversoDataUrl },
    });

    res.json({
      frenteUrl: result.frenteDataUrl,
      reversoUrl: result.reversoDataUrl,
      frenteDataUrl: result.frenteDataUrl,
      reversoDataUrl: result.reversoDataUrl,
      empleado: empleadoData,
    });

  } catch (err) {
    console.error("Error generarCredencialController:", err);
    res.status(500).json({
      message: "Error generando credencial",
      detail: err.message,
    });
  }
};

export const getCredencialByToken = async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ msg: "Token requerido" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const empleadoId = payload.id;

    const empleado = await Empleado.findByPk(empleadoId);
    if (!empleado) {
      return res.status(404).json({ msg: "Empleado no encontrado" });
    }

    let fotoUrl = null;

    if (empleado.foto_path) {
      const fotoPath = path.join(
        __dirname,
        `../uploads/fotosEmpleados/${empleado.foto_path}`
      );

      if (fs.existsSync(fotoPath)) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        fotoUrl = `${baseUrl}/api/empleados/${empleado.id}/foto`;

/*         console.log("baseUrl:", baseUrl);
        console.log("foto enviada al front:", fotoUrl); */
      }
    }

    const empleadoSafe = {
      id: empleado.id,
      num_trab: empleado.num_trab,
      nom_trab: empleado.nom_trab,
      puesto: empleado.puesto,
      nom_depto: empleado.nom_depto,
      vencimiento_contrato: empleado.vencimiento_contrato,
      estado_qr: empleado.estado_qr,
      fotoUrl,
    };

    await req.audit({
      event: "credential_view",
      model: "credenciales",
      modelId: String(empleado.id),
      oldValues: null,
      newValues: { tokenView: true },
    });

    return res.json(empleadoSafe);
  } catch (err) {
    console.error(" Token inválido:", err);
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};



export const generarQrEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const token = jwt.sign(
      { id: empleado.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    const qrUrl = `${process.env.FRONT_URL}/credencial/${token}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });

    await req.audit({
      event: "qr_generated",
      model: "credenciales",
      modelId: String(empleado.id),
      oldValues: null,
      newValues: { qrUrl },
    });

    res.json({
      qrDataUrl,
      qrUrl,
      empleado: {
        id: empleado.id,
        num_trab: empleado.num_trab,
        nom_trab: empleado.nom_trab,
        puesto: empleado.puesto,
        estado_qr: empleado.estado_qr,
      },
    });
  } catch (err) {
    console.error(" Error generando QR:", err);
    res.status(500).json({
      message: "Error generando QR",
      detail: err.message,
    });
  }
};
