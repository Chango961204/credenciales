import { importarDesdeExcel } from "../services/excel.service.js";

export const uploadEmpleados = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    // Validar extensin  archivo
    const allowedExtensions = [".xlsx", ".xls"];
    const fileExt = req.file.originalname?.substring(req.file.originalname.lastIndexOf(".")).toLowerCase() || "";
    if (!allowedExtensions.includes(fileExt)) {
      return res.status(400).json({ message: "El archivo debe ser .xlsx o .xls" });
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
    console.error("Error en uploadEmpleados:", error);
    res.status(500).json({ message: "Error al importar empleados", error: error.message });
  }
};
