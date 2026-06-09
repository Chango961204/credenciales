import { importarDesdeExcel } from "../services/excel.service.js";
import fs from "fs/promises";

export const uploadEmpleados = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    // Validar extensin  archivo
    const allowedExtensions = [".xlsx"];
    const fileExt = req.file.originalname?.substring(req.file.originalname.lastIndexOf(".")).toLowerCase() || "";
    if (!allowedExtensions.includes(fileExt)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: "El archivo debe ser .xlsx" });
    }

    const result = await importarDesdeExcel(req.file.path);

    // AUDITORIA: 
    if (req.audit) {
      await req.audit({
        event: "bulk_import",
        model: "empleados",
        modelId: null,
        oldValues: null,
        newValues: result || { file: req.file.originalname || req.file.path },
      });
    }

    res.json({ message: "Empleados importados correctamente", ...result });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    console.error("Error en uploadEmpleados:", error);
    res.status(500).json({ message: "Error al importar empleados", error: error.message });
  }
};
