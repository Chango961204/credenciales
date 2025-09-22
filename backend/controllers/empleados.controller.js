import {
  saveEmpleado,
  saveEmpleadoManual,
  obtenerEmpleadosPaginados,
  eliminarEmpleado,
  buscarEmpleados as buscarEmpleadosService,
  actualizarEmpleado as actualizarEmpleadoService,
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
    const { qr } = req.params;
    const [rows] = await pool.query("SELECT * FROM empleados WHERE qr_code = ?", [qr]);
    if (!rows.length) return res.status(404).json({ message: "QR no encontrado" });

    const emp = rows[0];

    const hoy = dayjs().startOf('day');
    if (emp.vencimiento_contrato && dayjs(emp.vencimiento_contrato).isBefore(hoy, 'day')) {
      await pool.query("UPDATE empleados SET estado_qr = 'inactivo' WHERE id = ?", [emp.id]);
      emp.estado_qr = 'inactivo';
    }

    const venc = emp.vencimiento_contrato ? dayjs(emp.vencimiento_contrato).format("DD/MM/YYYY") : null;
    const fecha_ing = emp.fecha_ing ? dayjs(emp.fecha_ing).format("DD/MM/YYYY") : null;

    res.json({
      id: emp.id,
      num_trab: emp.num_trab,
      nom_trab: emp.nom_trab,
      num_imss: emp.num_imss,
      vencimiento_contrato: venc,
      fecha_ing,
      estado_qr: emp.estado_qr,
    });
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

    const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [id]);

    res.json({ 
      message: `Empleado actualizado a ${estado}`, 
      empleado: rows[0] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const postGenerarQr = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Empleado no encontrado" });

    const empleado = rows[0];

    const qrPayload = {
      id: empleado.id,
      num_trab: empleado.num_trab,
      nom_trab: empleado.nom_trab,
      rfc: empleado.rfc || "N/A",
      num_imss: empleado.num_imss || "N/A",
      nom_depto: empleado.nom_depto || "N/A",
      puesto: empleado.puesto || "N/A",
      vencimiento_contrato: empleado.vencimiento_contrato,
      estado_qr: empleado.estado_qr
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

    res.json({
      message: "QR generado",
      empleado: empleado, 
      qrCode
    });
  } catch (err) {
    console.error("Error postGenerarQr:", err);
    res.status(500).json({ message: "Error al generar QR" });
  }
};


export const getBuscarEmpleados = async (req, res) => {
  try {
    let num_trab = req.query.num_trab;
    let nombre = req.query.nombre;

    console.log("Buscando empleado con:", { num_trab, nombre });

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

    if (rows.length === 0) {
      return res.json([]);
    }

    rows.forEach(emp => {
      console.log(`Empleado ${emp.nom_trab}:`);
      console.log('vencimiento_contrato original:', emp.vencimiento_contrato);
      console.log('tipo:', typeof emp.vencimiento_contrato);
      console.log('es null:', emp.vencimiento_contrato === null);

      if (emp.vencimiento_contrato) {
        try {
          emp.vencimiento_contrato = dayjs(emp.vencimiento_contrato).format("DD/MM/YYYY");
          console.log('vencimiento_contrato formateado:', emp.vencimiento_contrato);
        } catch (error) {
          console.log('Error formateando vencimiento_contrato:', error);
          emp.vencimiento_contrato = null;
        }
      }

      if (emp.fecha_ing) {
        try {
          emp.fecha_ing = dayjs(emp.fecha_ing).format("DD/MM/YYYY");
        } catch (error) {
          console.log('Error formateando fecha_ing:', error);
        }
      }
    });

    console.log('Enviando resultados:', rows);
    res.json(rows);
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



