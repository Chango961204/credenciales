import { importarDesdeExcel } from "../services/excel.service.js";

export const uploadEmpleados = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    await importarDesdeExcel(req.file.path);
    res.json({ message: "Empleados importados correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al importar empleados", error: error.message });
  }
};
