import path from "path";
import { fileURLToPath } from "url";
import { generarCredencialFiles } from "../services/credenciales.service.js";
import fs from "fs";
import Empleado from "../models/Empleados.js";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generar credencial completa (frente y reverso)
export const generarCredencial = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleadoData = empleado.toJSON();
    const result = await generarCredencialFiles(empleadoData);

    res.json({
      frenteUrl: result.frenteDataUrl,
      reversoUrl: result.reversoDataUrl,
      empleado: empleadoData, // 🔹 Agregado para consistencia
    });
  } catch (err) {
    console.error("Error generarCredencialController:", err);
    res.status(500).json({ 
      message: "Error generando credencial", 
      detail: err.message 
    });
  }  
};

// Obtener información del empleado mediante token JWT
export const getCredencialByToken = async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ msg: "Token requerido" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const empleadoId = payload.id;

    const empleado = await Empleado.findByPk(empleadoId);
    if (!empleado) return res.status(404).json({ msg: "Empleado no encontrado" });

    // Verificar si existe la foto físicamente
    let fotoUrl = null;
    if (empleado.foto_path) {
      const fotoPath = path.join(__dirname, `../uploads/fotosEmpleados/${empleado.foto_path}`);
      if (fs.existsSync(fotoPath)) {
        fotoUrl = `${process.env.API_URL}/api/empleados/${empleado.id}/foto`;
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

    return res.json(empleadoSafe);
  } catch (err) {
    console.error("Token inválido:", err);
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

// 🔹 NUEVA FUNCIÓN: Generar solo el QR del empleado
export const generarQrEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: empleado.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    // Generar URL para el QR
    const qrUrl = `${process.env.FRONT_URL}/credencial/${token}`;

    // Generar imagen del QR en base64
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
    });

    // Retornar QR y datos del empleado
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
    res.status(500).json({ 
      message: "Error generando QR", 
      detail: err.message 
    });
  }
};