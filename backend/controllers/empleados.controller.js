import pool from "../config/db.js";
import dayjs from "dayjs";
import { 
  actualizarEmpleado as actualizarEmpleadoService, 
  saveEmpleadoManual, 
  obtenerEmpleadosPaginados 
} from "../services/empleados.service.js";

export const getEmpleados = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { data, total } = await obtenerEmpleadosPaginados(Number(page), Number(limit));
    res.json({ empleados: data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener empleados", error: error.message });
  }
};

export const registrarEmpleado = async (req, res) => {
  try {
    await saveEmpleadoManual(req.body);
    res.json({ message: "Empleado registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar empleado", error: error.message });
  }
};

export const getBuscarEmpleados = async (req, res) => {
  try {
    const { num_trab, nombre } = req.query;

    if ((!num_trab || String(num_trab).trim() === "") && (!nombre || String(nombre).trim() === "")) {
      return res.json([]);
    }

    let query = `SELECT * FROM empleados WHERE 1=1`;
    const params = [];

    if (num_trab) {
      query += " AND num_trab = ?";
      params.push(num_trab);
    }

    if (nombre) {
      query += " AND nom_trab LIKE ?";
      params.push(`%${nombre}%`);
    }

    query += " LIMIT 20";

    const [rows] = await pool.query(query, params);

    const normalized = rows.map(emp => ({
      ...emp,
      fecha_ing: emp.fecha_ing ? dayjs(emp.fecha_ing).format("YYYY-MM-DD") : null,
      vencimiento_contrato: emp.vencimiento_contrato
        ? dayjs(emp.vencimiento_contrato).format("YYYY-MM-DD")
        : null,
    }));

    res.json(normalized);
  } catch (err) {
    console.error("Error en getBuscarEmpleados:", err);
    res.status(500).json({ message: err.message });
  }
};

export const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    if (payload.num_trab && isNaN(Number(payload.num_trab))) {
      return res.status(400).json({ message: "num_trab debe ser numérico" });
    }

    const updated = await actualizarEmpleadoService(Number(id), payload);

    if (!updated) return res.status(404).json({ message: "Empleado no encontrado" });

    res.json({ message: "Empleado actualizado", empleado: updated });
  } catch (err) {
    console.error("Error actualizarEmpleado:", err);
    res.status(500).json({ message: err.message });
  }
};

export const actualizarEstadoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_qr } = req.body;

    if (!["activo", "inactivo"].includes(estado_qr)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    await pool.query("UPDATE empleados SET estado_qr = ? WHERE id = ?", [estado_qr, id]);

    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    console.error("Error actualizarEstadoEmpleado:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Empleado no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error getEmpleadoById:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM empleados WHERE id = ?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Empleado no encontrado" });

    res.json({ message: "Empleado eliminado" });
  } catch (err) {
    console.error("Error deleteEmpleado:", err);
    res.status(500).json({ message: err.message });
  }
};
