import {
  saveEmpleado,
  saveEmpleadoManual,
  obtenerEmpleadosPaginados,
  eliminarEmpleado,
  buscarEmpleados as buscarEmpleadosService
} from "../services/empleados.service.js";
import { importarDesdeExcel } from "../services/excel.service.js";
import { generarQrParaEmpleado } from "../services/qr.service.js";
import pool from "../db.js";
import QRCode from "qrcode";
import dayjs from "dayjs";

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

export const getEmpleados = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { data, total } = await obtenerEmpleadosPaginados(Number(page), Number(limit));
    res.json({ empleados: data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener empleados", error: error.message });
  }
};

export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarEmpleado(id);
    res.json({ message: `Empleado con id ${id} eliminado` });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar empleado", error: error.message });
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

export const buscarEmpleadoQR = async (req, res) => {
  try {
    const { num_trab, nombre } = req.query;

    let query = `
      SELECT id, num_trab, nom_trab, num_imss, vencimiento_contrato
      FROM empleados
      WHERE 1=1
    `;
    const params = [];

    if (num_trab) {
      query += " AND num_trab = ?";
      params.push(Number(num_trab));
    }

    if (nombre) {
      query += " AND nom_trab LIKE ? COLLATE utf8_general_ci";
      params.push(`%${nombre}%`);
    }

    query += " LIMIT 1";

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleado = rows[0];

    const qrData = {
      id: empleado.id,
      num_trab: empleado.num_trab,
      nom_trab: empleado.nom_trab,
      num_imss: empleado.num_imss,
      vencimiento_contrato: empleado.vencimiento_contrato,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    res.json({ empleado, qrCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const actualizarEstadoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    await pool.query("UPDATE empleados SET estado_qr = ? WHERE id = ?", [estado, id]);
    res.json({ message: `QR actualizado a ${estado}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postGenerarQr = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await generarQrParaEmpleado(Number(id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBuscarEmpleados = async (req, res) => {
  try {
    let num_trab = req.query.num_trab;
    let nom_trab = req.query.nom_trab;

    console.log("Buscando empleado con:", { num_trab, nom_trab });

    if ((!num_trab || String(num_trab).trim() === "") && (!nom_trab || String(nom_trab).trim() === "")) {
      return res.json([]);
    }

    let query = `
      SELECT id, num_trab, nom_trab, vencimiento_contrato, num_imss
      FROM empleados
      WHERE 1=1
    `;
    const params = [];

    if (num_trab) {
      query += " AND num_trab = ?";
      params.push(num_trab);
    }

    if (nom_trab) {
      query += " AND nom_trab LIKE ?";
      params.push(`%${nom_trab}%`);
    }

    query += " LIMIT 20";

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.json([]);
    }

    rows.forEach(emp => {
      if (emp.vencimiento_contrato) {
        emp.vencimiento_contrato = dayjs(emp.vencimiento_contrato).format("DD/MM/YYYY");
      }
    });

    res.json(rows);
  } catch (err) {
    console.error(" Error en getBuscarEmpleados:", err);
    res.status(500).json({ message: err.message });
  }
};

