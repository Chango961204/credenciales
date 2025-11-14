import fs from "fs";
import fsP from "fs/promises";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import printer from "pdf-to-printer";

const exec = promisify(execFile);

const CARD_WIDTH_PT = 243; // ~85.6 mm
const CARD_HEIGHT_PT = 153; // ~54 mm

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

async function writeJpegTmpFromDataUrl(dataUrl, namePrefix) {
  const buf = dataUrlToBuffer(dataUrl);
  const out = await sharp(buf)
    .rotate() // por si trae EXIF
    .jpeg({ quality: 75, mozjpeg: true })
    .toBuffer();

  const file = path.join(os.tmpdir(), `${namePrefix}-${Date.now()}.jpg`);
  await fsP.writeFile(file, out);
  return file;
}

async function createTwoPagePdf(frontPath, backPath) {
  const pdfPath = path.join(os.tmpdir(), `card-${Date.now()}.pdf`);
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [CARD_WIDTH_PT, CARD_HEIGHT_PT],
      margin: 0,
      autoFirstPage: false,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.addPage({ size: [CARD_WIDTH_PT, CARD_HEIGHT_PT], margin: 0 });
    doc.image(frontPath, 0, 0, { width: CARD_WIDTH_PT, height: CARD_HEIGHT_PT });

    doc.addPage({ size: [CARD_WIDTH_PT, CARD_HEIGHT_PT], margin: 0 });
    doc.image(backPath, 0, 0, { width: CARD_WIDTH_PT, height: CARD_HEIGHT_PT });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  return pdfPath;
}

async function printPdf(pdfPath, printerName) {
  const isWin = process.platform === "win32";
  try {
    if (isWin) {
      await printer.print(pdfPath, { printer: printerName });
    } else {
      // Linux / CUPS
      await exec("lp", ["-d", printerName, pdfPath]);
    }
  } catch (err) {
    throw err;
  }
}

export async function printDoubleSidedCard(frontDataUrl, backDataUrl, { printerName }) {
  let frontJpg, backJpg, pdf;
  try {
    frontJpg = await writeJpegTmpFromDataUrl(frontDataUrl, "front");
    backJpg = await writeJpegTmpFromDataUrl(backDataUrl, "back");

    pdf = await createTwoPagePdf(frontJpg, backJpg);
    await printPdf(pdf, printerName);
  } finally {
    for (const f of [frontJpg, backJpg, pdf]) {
      if (!f) continue;
      try { await fsP.unlink(f); } catch { }
    }
  }
}

export async function listPrinters() {
  if (process.platform === "win32") {
    try {
      const { stdout } = await exec('powershell -Command "Get-Printer | Select-Object -Property Name,Default | ConvertTo-Json"');
      return JSON.parse(stdout);
    } catch {
      return null;
    }
  }
  try {
    const { stdout } = await exec("lpstat", ["-p"]);
    const printers = stdout
      .split("\n")
      .map((l) => (l.match(/^printer\s+(.+?)\s/) || [])[1])
      .filter(Boolean);
    return printers;
  } catch {
    return null;
  }
}
