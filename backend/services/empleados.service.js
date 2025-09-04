import xlsx from "xlsx";
import pool from "../db.js";
import fs from "fs/promises";

// 🔹 Normaliza claves (ej: "Num Trab" → "NUM_TRAB")
const normalizeKey = (key) =>
  key
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");

// 🔹 Convierte fechas Excel/Texto a formato YYYY-MM-DD
const parseExcelDate = (value) => {
  if (!value) return null;

  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000)
      .toISOString()
      .slice(0, 10);
  }

  if (value instanceof Date && !isNaN(value)) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);

    const parts = value.split(/[\/\-\.\s]/);
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
        2,
        "0"
      )}`;
    }
  }

  return null;
};

// 🔹 Inserta o actualiza un empleado
const saveEmpleado = async (row) => {
  const {
    NUM_TRAB,
    RFC,
    NOM_TRAB,
    NUM_IMSS,
    SEXO,
    FECHA_ING,
    FECHA_INGRESO,
    NUM_DEPTO,
    NOM_DEPTO,
    CATEGORIA,
    PUESTO,
    SIND,
    CONF,
    NOMINA,
    VENCIMIENTO_CONTRATO,
    VENCIMIENTO_DE_CONTRATO,
  } = row;

  if (!NUM_TRAB || !NOM_TRAB) return; // obligatorio

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
      NUM_TRAB,
      RFC,
      NOM_TRAB,
      NUM_IMSS,
      SEXO,
      parseExcelDate(FECHA_ING ?? FECHA_INGRESO),
      NUM_DEPTO,
      NOM_DEPTO,
      CATEGORIA,
      PUESTO,
      SIND,
      CONF,
      NOMINA,
      parseExcelDate(VENCIMIENTO_CONTRATO ?? VENCIMIENTO_DE_CONTRATO),
    ]
  );
};

// 🔹 Importa desde Excel
export const importarDesdeExcel = async (filePath) => {
  if (!filePath) throw new Error("No se proporcionó archivo");

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: null,
  });

  if (!rawRows.length) {
    await fs.unlink(filePath).catch(() => {});
    throw new Error("El Excel está vacío o no se pudo leer");
  }

  const rows = rawRows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [normalizeKey(k), v]))
  );

  for (const row of rows) {
    try {
      await saveEmpleado(row);
    } catch (err) {
      console.error("Error insertando fila:", row, err.message);
    }
  }

  await fs.unlink(filePath).catch(() => {});
};

// 🔹 Obtener todos los empleados
export const obtenerEmpleados = async () => {
  const [rows] = await pool.query("SELECT * FROM empleados");
  return rows;
};

// 🔹 Obtener empleados con paginación
export const obtenerEmpleadosPaginados = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    "SELECT * FROM empleados LIMIT ? OFFSET ?",
    [limit, offset]
  );

  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) as total FROM empleados"
  );

  return { data: rows, total };
};

// 🔹 Eliminar empleado por ID
export const eliminarEmpleado = async (id) => {
  await pool.query("DELETE FROM empleados WHERE id = ?", [id]);
};
