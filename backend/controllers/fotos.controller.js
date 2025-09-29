import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFotoEmpleado = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ninguna foto" });
    }

    const empleadoId = req.params.id;
    const uploadDir = path.join(__dirname, "../uploads/fotosEmpleados");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalFilename = `${empleadoId}.png`;
    const finalPath = path.join(uploadDir, finalFilename);

    // Convertir la imagen a PNG
    await sharp(req.file.path)
      .resize(500, 500, { fit: "cover" })
      .png()
      .toFile(finalPath);

    fs.unlinkSync(req.file.path); // eliminar archivo temporal

    // ✅ Guardar nombre en la BD en la columna correcta
    await pool.query("UPDATE empleados SET foto_path = ? WHERE id = ?", [
      finalFilename,
      empleadoId,
    ]);

    res.json({
      message: "Foto subida correctamente",
      filename: finalFilename,
    });
  } catch (error) {
    console.error("❌ Error en uploadFotoEmpleado:", error);
    res.status(500).json({ error: "Error interno al subir foto" });
  }
};

export const getEmpleadoFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT foto_path FROM empleados WHERE id = ?",
      [id]
    );

    if (rows.length === 0 || !rows[0].foto_path) {
      return res.status(404).send("Foto no encontrada");
    }

    const filePath = path.join(
      __dirname,
      "../uploads/fotosEmpleados",
      rows[0].foto_path
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Archivo de foto no encontrado en servidor");
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("Error en getEmpleadoFoto:", err);
    res.status(500).send("Error interno del servidor");
  }
};
