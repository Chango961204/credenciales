import xlsx from "xlsx";
import fs from "fs/promises";
import { saveEmpleado } from "./empleados.service.js";
import { normalizeKey } from "../utils/date.util.js";

function excelDateToJSDate(serial) {
  if (!serial) return null;

  if (typeof serial === "number") {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000).toISOString().split("T")[0];
  }

  return serial;
}

export const importarDesdeExcel = async (filePath) => {
  if (!filePath) throw new Error("No se proporcionó archivo");

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

  if (!rawRows.length) {
    await fs.unlink(filePath).catch(() => { });
    throw new Error("El Excel está vacío o no se pudo leer");
  }

  const rows = rawRows.map((r) => {
    let normalized = Object.fromEntries(
      Object.entries(r).map(([k, v]) => [normalizeKey(k), v])
    );

    if (normalized.vencimiento_contrato && !normalized.vencimiento_contrato) {
      normalized.vencimiento_contrato = normalized.vencimiento_contrato;
      delete normalized.vencimiento_contrato;
    }

    return normalized;
  });

  for (const row of rows) {
    try {
      if (row.fecha_ing) {
        row.fecha_ing = excelDateToJSDate(row.fecha_ing);
      }

      if (row.vencimiento_contrato) {
        row.vencimiento_contrato = excelDateToJSDate(row.vencimiento_contrato);
      }

      await saveEmpleado(row);
    } catch (err) {
      console.error("Error insertando fila:", row, err.message);
    }
  }

  await fs.unlink(filePath).catch(() => { });
};
