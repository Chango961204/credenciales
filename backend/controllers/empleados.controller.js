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

if (payload.num_trab && isNaN(Number(payload.num_trab))) {
return res.status(400).json({ message: "num_trab debe ser numérico" });
}

const empleado = await Empleado.findByPk(id);
if (!empleado) return res.status(404).json({ message: "Empleado no encontrado" });

await empleado.update(payload);

res.json({ message: "Empleado actualizado correctamente", empleado });
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

const empleado = await Empleado.findByPk(id);
if (!empleado) return res.status(404).json({ message: "Empleado no encontrado" });

empleado.estado_qr = estado_qr;
await empleado.save();

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
    console
} catch (err) {
console.error("Error getEmpleadoById:", err);
res.status(500).json({ message: err.message });
}
};

export const deleteEmpleado = async (req, res) => {
try {
const { id } = req.params;
const deleted = await Empleado.destroy({ where: { id } });

if (!deleted) return res.status(404).json({ message: "Empleado no encontrado" });

res.json({ message: "Empleado eliminado correctamente" });
} catch (err) {
console.error("Error deleteEmpleado:", err);
res.status(500).json({ message: err.message });
}
};
