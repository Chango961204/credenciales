import pool from "../db.js";
import { parseExcelDate } from "../utils/date.util.js";
import { mapRowToEmpleado } from "../utils/empleados.mapper.js";

const parseDateSafely = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === 'number') {
    return parseExcelDate(dateValue);
  }

  if (typeof dateValue === 'string') {
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateValue.match(dateRegex);

    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  console.warn('No se pudo parsear la fecha:', dateValue);
  return null;
};

export const saveEmpleado = async (row) => {
  const empleado = mapRowToEmpleado(row);
  console.log("Guardando empleado:", empleado);

  if (!empleado.num_trab || !empleado.nom_trab) return;

  await pool.query(
    `INSERT INTO empleados 
      (num_trab, rfc, nom_trab, num_imss, sexo, fecha_ing, num_depto, nom_depto, categoria, puesto, sind, conf, nomina, vencimiento_contrato)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
      rfc=VALUES(rfc), nom_trab=VALUES(nom_trab), num_imss=VALUES(num_imss),
      sexo=VALUES(sexo), fecha_ing=VALUES(fecha_ing), num_depto=VALUES(num_depto),
      nom_depto=VALUES(nom_depto), categoria=VALUES(categoria), puesto=VALUES(puesto),
      sind=VALUES(sind), conf=VALUES(conf), nomina=VALUES(nomina),
      vencimiento_contrato=VALUES(vencimiento_contrato)`,
    [
      empleado.num_trab,
      empleado.rfc || null,
      empleado.nom_trab,
      empleado.num_imss || null,
      empleado.sexo || null,
      empleado.fecha_ing ? parseDateSafely(empleado.fecha_ing) : null,
      empleado.num_depto || null,
      empleado.nom_depto || null,
      empleado.categoria || null,
      empleado.puesto || null,
      empleado.sind || null,
      empleado.conf || null,
      empleado.nomina || null,
      empleado.vencimiento_contrato ? parseDateSafely(empleado.vencimiento_contrato) : null,
    ]
  );
};

export const saveEmpleadoManual = async (data) => {
  const { num_trab, rfc, nom_trab, num_imss, sexo, fecha_ing, num_depto,
    nom_depto, categoria, puesto, sind, conf, nomina, vencimiento_contrato } = data;

  if (!num_trab || !nom_trab) return;

  await pool.query(
    `INSERT INTO empleados 
      (num_trab, rfc, nom_trab, num_imss, sexo, fecha_ing, num_depto, nom_depto, categoria, puesto, sind, conf, nomina, vencimiento_contrato)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      num_trab,
      rfc,
      nom_trab,
      num_imss,
      sexo,
      parseExcelDate(fecha_ing),
      num_depto,
      nom_depto,
      categoria,
      puesto,
      sind,
      conf,
      nomina,
      parseExcelDate(vencimiento_contrato),
    ]
  );
};

export const obtenerEmpleadosPaginados = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query("SELECT * FROM empleados LIMIT ? OFFSET ?", [limit, offset]);
  const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM empleados");
  return { data: rows, total };
};

export const eliminarEmpleado = async (id) => {
  await pool.query("DELETE FROM empleados WHERE id = ?", [id]);
};

export const buscarEmpleados = async ({ num_trab, nombre }) => {
  if (num_trab) {
    const [rows] = await pool.query(
      "SELECT id, num_trab, nom_trab, estado_qr FROM empleados WHERE num_trab = ?",
      [num_trab]
    );
    return rows;
  } else if (nombre) {
    const [rows] = await pool.query(
      "SELECT id, num_trab, nom_trab, estado_qr FROM empleados WHERE nom_trab LIKE ? LIMIT 50",
      [`%${nombre}%`]
    );
    return rows;
  }
  return [];
};

export const actualizarEmpleado = async (id, data) => {
  const allowed = [
    "num_trab", "rfc", "nom_trab", "num_imss", "sexo",
    "fecha_ing", "num_depto", "nom_depto", "categoria",
    "puesto", "sind", "conf", "nomina", "vencimiento_contrato"
  ];

  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      updates.push(`${key} = ?`);
      if (key === "fecha_ing" || key === "vencimiento_contrato") {
        values.push(parseExcelDate(data[key]));
      } else {
        values.push(data[key]);
      }
    }
  }

  if (updates.length === 0) throw new Error("No hay campos para actualizar");

  values.push(id);
  const sql = `UPDATE empleados SET ${updates.join(", ")} WHERE id = ?`;
  await pool.query(sql, values);

  if (Object.prototype.hasOwnProperty.call(data, "vencimiento_contrato")) {
    await pool.query(
      "UPDATE empleados SET estado_qr = IF(vencimiento_contrato < CURDATE(), 'inactivo', 'activo') WHERE id = ?",
      [id]
    );
  }

  const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [id]);
  return rows[0] || null;
};
