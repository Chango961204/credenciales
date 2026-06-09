import path from "path";
import { fileURLToPath } from "url";
import { generarCredencialFiles } from "../services/credenciales.service.js";
import fs from "fs";
import Empleado from "../models/Empleados.js";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verifyCredentialToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no definido");
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const isLegacyCredentialToken = !payload.purpose && payload.id && !payload.userId;

  if ((!isLegacyCredentialToken && payload.purpose !== "credential") || !payload.id) {
    throw new Error("Token de credencial invalido");
  }
  return payload;
};

const isCredentialActive = (empleado) => {
  if (empleado.estado_qr !== "activo") return false;
  if (!empleado.vencimiento_contrato) return true;
  return !dayjs(empleado.vencimiento_contrato).isBefore(dayjs(), "day");
};

const getFotoPath = (empleado) => {
  if (!empleado?.foto_path) return null;

  const filename = path.basename(String(empleado.foto_path));
  const fotosDir = path.resolve(__dirname, "../uploads/fotosEmpleados");
  const fotoPath = path.resolve(fotosDir, filename);

  if (!fotoPath.startsWith(`${fotosDir}${path.sep}`) || !fs.existsSync(fotoPath)) {
    return null;
  }

  return fotoPath;
};

export const generarCredencial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID del empleado requerido" });
    }

    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleadoData = empleado.toJSON();
    const result = await generarCredencialFiles(empleadoData);

    if (req.audit) {
      await req.audit({
        event: "credential_generated",
        model: "credenciales",
        modelId: String(empleado.id),
        oldValues: null,
        newValues: { frente: !!result.frenteDataUrl, reverso: !!result.reversoDataUrl },
      });
    }

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
    const payload = verifyCredentialToken(token);
    const empleadoId = payload.id;

    const empleado = await Empleado.findByPk(empleadoId);
    if (!empleado) {
      return res.status(404).json({ msg: "Empleado no encontrado" });
    }

    if (!isCredentialActive(empleado)) {
      return res.status(403).json({ msg: "Credencial inactiva o expirada" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fotoUrl = getFotoPath(empleado)
      ? `${baseUrl}/api/empleados/token/${encodeURIComponent(token)}/foto`
      : null;

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

    await req.audit?.({
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

export const getCredencialFotoByToken = async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ msg: "Token requerido" });

  try {
    const payload = verifyCredentialToken(token);
    const empleado = await Empleado.findByPk(payload.id, {
      attributes: ["id", "foto_path", "estado_qr", "vencimiento_contrato"],
    });

    if (!empleado) {
      return res.status(404).json({ msg: "Empleado no encontrado" });
    }

    if (!isCredentialActive(empleado)) {
      return res.status(403).json({ msg: "Credencial inactiva o expirada" });
    }

    const fotoPath = getFotoPath(empleado);
    if (!fotoPath) {
      return res.status(404).json({ msg: "Foto no disponible" });
    }

    res.setHeader("Cache-Control", "private, max-age=300");
    return res.sendFile(fotoPath);
  } catch (err) {
    console.error("Token de foto invalido:", err.message);
    return res.status(401).json({ msg: "Token invalido o expirado" });
  }
};



export const generarQrEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);

    if (!empleado) return res.status(404).json({ message: "Empleado no encontrado" });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET no definido" });
    }

    let base = (process.env.FRONT_URL || "").trim().replace(/\/+$/, "");
    if (!base) return res.status(500).json({ message: "FRONT_URL no definido" });

    if (!/^https?:\/\//i.test(base)) base = `https://${base}`;

    const token = jwt.sign(
      { id: empleado.id, purpose: "credential" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    //  token en query 
    const qrUrl = `${base}/credencial?token=${encodeURIComponent(token)}`;

    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });

    await req.audit?.({
      event: "qr_generated",
      model: "credenciales",
      modelId: String(empleado.id),
      oldValues: null,
      newValues: { credentialTokenCreated: true, expiresIn: process.env.JWT_EXPIRES_IN || "30d" },
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
    console.error("Error generando QR:", err);
    res.status(500).json({ message: "Error generando QR", detail: err.message });
  }
};

