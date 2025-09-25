import {
  saveEmpleadoManual,
  obtenerEmpleadosPaginados,
  eliminarEmpleado,
  buscarEmpleados as buscarEmpleadosService,
  actualizarEmpleado as actualizarEmpleadoService,
} from "../services/empleados.service.js";
import { importarDesdeExcel } from "../services/excel.service.js";
import pool from "../db.js";
import QRCode from "qrcode";
import dayjs from "dayjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    const empleado = await Empleado.findOne({ where: { codigo_qr: qr } });

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    let fotoUrl = null;
    if (empleado.foto) {
      fotoUrl = `http://localhost:4000/api/empleados/${empleado.id}/foto`;
    }

    res.json({
      ...empleado.toJSON(),
      fotoUrl,
    });
  } catch (error) {
    console.error("Error al buscar empleado por QR:", error);
    res.status(500).json({ message: "Error interno" });
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
    const { num_trab, nombre } = req.query;

    console.log("Buscando empleado con:", { num_trab, nombre });

    // Validación básica
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

    const normalized = rows.map(emp => ({
      ...emp,
      fecha_ing: emp.fecha_ing ? dayjs(emp.fecha_ing).format("YYYY-MM-DD") : null,
      vencimiento_contrato: emp.vencimiento_contrato
        ? dayjs(emp.vencimiento_contrato).format("YYYY-MM-DD")
        : null,
    }));

    console.log("Enviando resultados:", normalized);
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


export const uploadFotoEmpleado = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna foto" });
    }

    const empleadoId = req.params.id;
    const fotoPath = `/uploads/fotosEmpleados/${req.file.filename}`;

    await pool.query("UPDATE empleados SET foto_path = ? WHERE id = ?", [
      fotoPath,
      empleadoId,
    ]);

    res.json({
      message: "Foto subida correctamente",
      path: fotoPath,
    });
  } catch (error) {
    console.error("Error subiendo foto:", error);
    res.status(500).json({ message: "Error interno al subir foto" });
  }
};


export const getFotoEmpleado = (req, res) => {
  const { id } = req.params;
  const filePath = path.join(process.cwd(), "uploads/fotosEmpleados", `${id}.jpg`);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ message: "Foto no encontrada" });
  }
};


export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleado = rows[0];

    if (empleado.foto) {
      empleado.fotoUrl = `${req.protocol}://${req.get("host")}/api/empleados/${empleado.id}/foto`;
    }

    res.json(empleado);
  } catch (err) {
    console.error("Error en getEmpleadoById:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEmpleadoFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT foto FROM empleados WHERE id = ?", [id]);

    if (rows.length === 0 || !rows[0].foto) {
      return res.status(404).send("Foto no encontrada");
    }

    const filePath = path.join(__dirname, "../uploads", rows[0].foto);
    res.sendFile(filePath);
  } catch (err) {
    console.error("Error en getEmpleadoFoto:", err);
    res.status(500).send("Error interno del servidor");
  }
};




