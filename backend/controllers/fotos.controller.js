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

    const emp = await Empleado.findByPk(empleadoId);
    if (!emp) return res.status(404).json({ error: "Empleado no encontrado" });

    const uploadDir = path.join(__dirname, "../uploads/fotosEmpleados");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const finalFilename = `${Number(emp.num_trab)}.png`;
    const finalPath = path.join(uploadDir, finalFilename);

    await sharp(req.file.path)
      .rotate()
      .resize(500, 500, { fit: "cover" })
      .png()
      .toFile(finalPath);

    fs.unlinkSync(req.file.path);

    const before = { foto_path: emp?.foto_path || null };

    await Empleado.update({ foto_path: finalFilename }, { where: { id: empleadoId } });

    if (req.audit) {
      await req.audit({
        event: "updated",
        model: "empleados",
        modelId: String(empleadoId),
        oldValues: before,
        newValues: { foto_path: finalFilename },
      });
    }

    res.json({ message: "Foto subida correctamente", filename: finalFilename });
  } catch (error) {
    console.error("Error en uploadFotoEmpleado:", error);
    res.status(500).json({ error: "Error interno al subir foto" });
  }
};

export const getEmpleadoFoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de empleado no proporcionado" });
    }

    const empleado = await Empleado.findByPk(id, { attributes: ["foto_path"] });

    if (!empleado || !empleado.foto_path) {
      const defaultFoto = path.join(__dirname, "../plantillas/placeholder.jpg");
      if (fs.existsSync(defaultFoto)) {
        return res.sendFile(defaultFoto);
      }
      return res.status(404).json({ error: "No hay foto disponible" });
    }

    const filePath = path.join(__dirname, "../uploads/fotosEmpleados", empleado.foto_path);
    if (!fs.existsSync(filePath)) {
      const defaultFoto = path.join(__dirname, "../plantillas/placeholder.jpg");
      if (fs.existsSync(defaultFoto)) {
        return res.sendFile(defaultFoto);
      }
      return res.status(404).json({ error: "Archivo de foto no encontrado" });
    }

    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(filePath);
  } catch (err) {
    console.error("Error en getEmpleadoFoto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
