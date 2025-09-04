import { importarDesdeExcel, obtenerEmpleadosPaginados, eliminarEmpleado } from "../services/empleados.service.js";

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

// 📋 Obtener empleados con paginación
export const getEmpleados = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // valores por defecto
    const { data, total } = await obtenerEmpleadosPaginados(Number(page), Number(limit));
    res.json({ empleados: data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener empleados", error: error.message });
  }
};

// ❌ Eliminar empleado por id
export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarEmpleado(id);
    res.json({ message: `Empleado con id ${id} eliminado` });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar empleado", error: error.message });
  }
};
