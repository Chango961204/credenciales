import { Op } from "sequelize";
import dayjs from "dayjs";
import Empleado from "../models/Empleados.js";
import { parseExcelDate } from "../utils/date.util.js";
import { mapRowToEmpleado } from "../utils/empleados.mapper.js";

const parseDateSafely = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === "number") {
    return parseExcelDate(dateValue);
  }

  if (typeof dateValue === "string") {
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateValue.match(dateRegex);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  console.warn("No se pudo parsear la fecha:", dateValue);
  return null;
};

   // GUARDAR EMPLEADO (desde Excel o import)

export const saveEmpleado = async (row) => {
  const empleado = mapRowToEmpleado(row);
  console.log("Guardando empleado:", empleado);

  if (!empleado.num_trab || !empleado.nom_trab) return;

  await Empleado.upsert({
    num_trab: empleado.num_trab,
    rfc: empleado.rfc || null,
    nom_trab: empleado.nom_trab,
    num_imss: empleado.num_imss || null,
    sexo: empleado.sexo || null,
    fecha_ing: empleado.fecha_ing ? parseDateSafely(empleado.fecha_ing) : null,
    num_depto: empleado.num_depto || null,
    nom_depto: empleado.nom_depto || null,
    categoria: empleado.categoria || null,
    puesto: empleado.puesto || null,
    sind: empleado.sind || null,
    conf: empleado.conf || null,
    nomina: empleado.nomina || null,
    vencimiento_contrato: empleado.vencimiento_contrato
      ? parseDateSafely(empleado.vencimiento_contrato)
      : null,
  });
};

  // GUARDAR EMPLEADO MANUALMENTE (desde formulario)
export const saveEmpleadoManual = async (data) => {
  const {
    num_trab,
    rfc,
    nom_trab,
    num_imss,
    sexo,
    fecha_ing,
    num_depto,
    nom_depto,
    categoria,
    puesto,
    sind,
    conf,
    nomina,
    vencimiento_contrato,
  } = data;

  if (!num_trab || !nom_trab) return;

  await Empleado.create({
    num_trab,
    rfc,
    nom_trab,
    num_imss,
    sexo,
    fecha_ing: parseExcelDate(fecha_ing),
    num_depto,
    nom_depto,
    categoria,
    puesto,
    sind,
    conf,
    nomina,
    vencimiento_contrato: parseExcelDate(vencimiento_contrato),
  });
};

   //PAGINACIÓN
export const obtenerEmpleadosPaginados = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { rows, count } = await Empleado.findAndCountAll({
    limit,
    offset,
    order: [["id", "ASC"]],
  });

  return { data: rows, total: count };
};

  // ELIMINAR EMPLEADO
export const eliminarEmpleado = async (id) => {
  await Empleado.destroy({ where: { id } });
};

   //BUSCAR EMPLEADOS
export const buscarEmpleados = async ({ num_trab, nombre }) => {
  if (num_trab) {
    return await Empleado.findAll({
      attributes: ["id", "num_trab", "nom_trab", "estado_qr"],
      where: { num_trab },
    });
  }

  if (nombre) {
    return await Empleado.findAll({
      attributes: ["id", "num_trab", "nom_trab", "estado_qr"],
      where: {
        nom_trab: { [Op.like]: `%${nombre}%` },
      },
      limit: 50,
    });
  }

  return [];
};

   //ACTUALIZAR EMPLEADO
export const actualizarEmpleado = async (id, data) => {
  const allowed = [
    "num_trab",
    "rfc",
    "nom_trab",
    "num_imss",
    "sexo",
    "fecha_ing",
    "num_depto",
    "nom_depto",
    "categoria",
    "puesto",
    "sind",
    "conf",
    "nomina",
    "vencimiento_contrato",
  ];

  const updates = {};

  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (["fecha_ing", "vencimiento_contrato"].includes(key)) {
        updates[key] = parseExcelDate(data[key]);
      } else {
        updates[key] = data[key];
      }
    }
  }

  const empleado = await Empleado.findByPk(id);
  if (!empleado) throw new Error("Empleado no encontrado");

  await empleado.update(updates);

  // Si se actualizó la fecha de vencimiento, recalculamos el estado
  if (data.vencimiento_contrato) {
    const fechaVenc = dayjs(updates.vencimiento_contrato);
    const estado_qr = fechaVenc.isBefore(dayjs(), "day") ? "inactivo" : "activo";
    await empleado.update({ estado_qr });
  }

  return empleado;
};
