import ExcelJS from "exceljs";
import fs from "fs/promises";
import { saveEmpleado } from "./empleados.service.js";
import { normalizeKey } from "../utils/date.util.js";

function excelDateToJSDate(value) {
  if (!value) return null;

  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0]; // formato YYYY-MM-DD
  }

  if (value.text) {
    return value.text;
  }

  return value;
}

export const importarDesdeExcel = async (filePath) => {
  if (!filePath) throw new Error("No se proporcionó archivo");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    await fs.unlink(filePath).catch(() => {});
    throw new Error("El archivo Excel no tiene hojas válidas");
  }

  const headerRow = sheet.getRow(1);
  const headers = headerRow.values.slice(1).map((h) => normalizeKey(h));

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // saltar encabezados
    const data = {};

    headers.forEach((header, i) => {
      const cellValue = row.getCell(i + 1).value;
      data[header] = cellValue ?? null;
    });

    rows.push(data);
  });

  if (!rows.length) {
    await fs.unlink(filePath).catch(() => {});
    throw new Error("El Excel está vacío o no se pudo leer");
  }

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
      console.error("❌ Error insertando fila:", row, err.message);
    }
  }

  await fs.unlink(filePath).catch(() => {});
};
