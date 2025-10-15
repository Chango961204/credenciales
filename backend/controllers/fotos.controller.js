import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Empleado from "../models/Empleados.js";

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

    // Redimensionar la imagen y guardarla
    await sharp(req.file.path)
      .resize(500, 500, { fit: "cover" })
      .png()
      .toFile(finalPath);

    // Eliminar el archivo temporal subido
    fs.unlinkSync(req.file.path);

    // 🔹 Actualizar el registro usando el modelo Sequelize
    await Empleado.update(
      { foto_path: finalFilename },
      { where: { id: empleadoId } }
    );

    res.json({
      message: "Foto subida correctamente",
      filename: finalFilename,
    });
  } catch (error) {
    console.error("Error en uploadFotoEmpleado:", error);
    res.status(500).json({ error: "Error interno al subir foto" });
  }
};

export const getEmpleadoFoto = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Obtener empleado por su ID, solo el campo foto_path
    const empleado = await Empleado.findByPk(id, {
      attributes: ["foto_path"],
    });

    if (!empleado || !empleado.foto_path) {
      return res.status(404).send("Foto no encontrada");
    }

    const filePath = path.join(
      __dirname,
      "../uploads/fotosEmpleados",
      empleado.foto_path
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Archivo de foto no encontrado en el servidor");
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("Error en getEmpleadoFoto:", err);
    res.status(500).send("Error interno del servidor");
  }
};
