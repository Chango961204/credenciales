// services/excel.service.js
import ExcelJS from "exceljs";
import fs from "fs/promises";
import { saveEmpleado } from "./empleados.service.js";
import { normalizeKey } from "../utils/date.util.js";

function excelDateToJSDate(value) {
  if (!value) return null;

  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (typeof value === "object") {
    if (value.result) {
      return excelDateToJSDate(value.result);
    }
    if (value.text) {
      return value.text;
    }
    if (value.value) {
      return excelDateToJSDate(value.value);
    }
  }

  if (typeof value === "string") {
    return value;
  }

  return value;
}

async function procesarFilasConLimite(rows, concurrency = 20) {
  const total = rows.length;
  let insertados = 0;
  let errores = 0;

  let index = 0;

  const worker = async () => {
    while (true) {
      let currentIndex;

      if (index >= total) return;
      currentIndex = index++;
      const row = rows[currentIndex];

      try {
        if (row.fecha_ing) {
          row.fecha_ing = excelDateToJSDate(row.fecha_ing);
        }

        const rawVenc =
          row.vencimiento_contrato ?? row.vencimiento_de_contrato ?? null;
        if (rawVenc) {
          const parsed = excelDateToJSDate(rawVenc);
          row.vencimiento_contrato = parsed;
          row.vencimiento_de_contrato = parsed;
        }

        await saveEmpleado(row);
        insertados++;
      } catch (err) {
        errores++;
        console.error("Error insertando fila:", row, err.message);
      }
    }
  };

  const workers = [];
  const numWorkers = Math.min(concurrency, total);
  for (let i = 0; i < numWorkers; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  return { total, insertados, errores };
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
  const headers = headerRow.values
    .slice(1)
    .map((h) => normalizeKey(h)); 

  const rows = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; 

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

  console.log(`>>> [IMPORT] Leyó ${rows.length} filas del Excel`);

  const resultado = await procesarFilasConLimite(rows, 20);

  console.log(
    `>>> [IMPORT] Terminado: total=${resultado.total}, insertados=${resultado.insertados}, errores=${resultado.errores}`
  );

  await fs.unlink(filePath).catch(() => {});

  return resultado;
};
