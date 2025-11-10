import dayjs from "dayjs";
import { Op } from "sequelize";
import Empleado from "../models/Empleados.js";
import {
  actualizarEmpleado as actualizarEmpleadoService,
  saveEmpleadoManual,
  obtenerEmpleadosPaginados,
} from "../services/empleados.service.js";

export const getEmpleados = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await Empleado.findAndCountAll({
      offset,
      limit: Number(limit),
      order: [["id", "ASC"]],
    });

    res.json({ empleados: data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener empleados", error: error.message });
  }
};

export const registrarEmpleado = async (req, res) => {
  try {
    // Ideal: modifica saveEmpleadoManual para que devuelva { empleado, action: 'created'|'updated' }
    const { empleado, action } = await saveEmpleadoManual(req.body);

    await req.audit({
      event: action === "updated" ? "updated" : "created",
      model: "empleados",
      modelId: String(empleado.id),
      oldValues: null,     // si tu servicio trae before, ponlo aquí
      newValues: { ...empleado.get({ plain: true }) },
    });

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

    const where = {};
    if (num_trab) where.num_trab = num_trab;
    if (nombre) where.nom_trab = { [Op.like]: `%${nombre}%` };

    const empleados = await Empleado.findAll({
      where,
      limit: 20,
      order: [["nom_trab", "ASC"]],
    });

    const normalized = empleados.map(emp => ({
      ...emp.toJSON(),
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

    // Validación básica numérica (si viene num_trab y no es vacío)
    if (payload.num_trab && isNaN(Number(payload.num_trab))) {
      return res
        .status(400)
        .json({ message: "num_trab debe ser numérico" });
    }

    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res
        .status(404)
        .json({ message: "Empleado no encontrado" });
    }

    // 🧹 Limpiamos el payload: saltamos campos vacíos ("")
    const updates = {};

    for (const [key, value] of Object.entries(payload)) {
      // Si es string vacío, no lo mandamos al update
      if (value === "" || typeof value === "undefined") continue;

      // Normalizar valores según tipo de campo
      if (["num_trab", "num_depto"].includes(key)) {
        updates[key] = Number(value);
      } else if (["fecha_ing", "vencimiento_contrato"].includes(key)) {
        // Aceptamos null o fecha válida; si viene string tipo "2025-01-31", se lo pasamos tal cual
        updates[key] = value ? value : null;
      } else if (key === "estado_qr") {
        // Sólo aceptar valores válidos del enum
        if (value === "activo" || value === "inactivo") {
          updates[key] = value;
        }
      } else {
        updates[key] = value;
      }
    }

    // Si no hay cambios válidos, respondemos sin tocar la BD
    if (Object.keys(updates).length === 0) {
      return res.json({
        message: "No hay cambios para aplicar",
        empleado,
      });
    }

    await empleado.update(updates);

    res.json({
      message: "Empleado actualizado correctamente",
      empleado,
    });
  } catch (err) {
    console.error("Error actualizarEmpleado:", err);
    res
      .status(500)
      .json({ message: "Error al actualizar empleado", error: err.message });
  }
};

export const actualizarEstadoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_qr } = req.body;

    if (!["activo", "inactivo"].includes(estado_qr)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const empleado = await Empleado.findByPk(id);
    if (!empleado) return res.status(404).json({ message: "Empleado no encontrado" });

    const before = { estado_qr: empleado.estado_qr };
    empleado.estado_qr = estado_qr;
    await empleado.save();
    const after = { estado_qr: empleado.estado_qr };

    await req.audit({
      event: "updated",
      model: "empleados",
      modelId: String(empleado.id),
      oldValues: before,
      newValues: after,
    });

    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    console.error("Error actualizarEstadoEmpleado:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);

    if (!empleado) return res.status(404).json({ message: "Empleado no encontrado" });

    const fotoUrl = empleado.foto_path
      ? `${req.protocol}://${req.get("host")}/uploads/fotosEmpleados/${empleado.foto_path}`
      : `${req.protocol}://${req.get("host")}/plantillas/placeholder.png`;

    res.json({
      id: empleado.id,
      num_trab: empleado.num_trab,
      nom_trab: empleado.nom_trab,
      puesto: empleado.puesto,
      rfc: empleado.rfc,
      num_imss: empleado.num_imss,
      nom_depto: empleado.nom_depto,
      vencimiento_contrato: empleado.vencimiento_contrato,
      estado_qr: empleado.estado_qr,
      fotoUrl,
    });
  } catch (err) {
    console.error("Error getEmpleadoById:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Empleado.findByPk(id);
    if (!emp) return res.status(404).json({ message: "Empleado no encontrado" });

    const snapshot = emp.get({ plain: true });
    await emp.destroy();

    await req.audit({
      event: "deleted",
      model: "empleados",
      modelId: String(id),
      oldValues: snapshot,
      newValues: null,
    });

    res.json({ message: "Empleado eliminado correctamente" });
  } catch (err) {
    console.error("Error deleteEmpleado:", err);
    res.status(500).json({ message: err.message });
  }
};
