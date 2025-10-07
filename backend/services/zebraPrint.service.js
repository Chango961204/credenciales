import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import printer from "pdf-to-printer";
import { exec } from "child_process";
import sharp from "sharp"; 

const PRINTER_NAME = "Zebra ZXP Series 3 USB Card Printer";

// Guardar PNG temporal desde base64
async function savePngTemp(base64Image, fileName = "temp_print.png") {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const tempPath = path.join(process.cwd(), fileName);
  fs.writeFileSync(tempPath, Buffer.from(base64Data, "base64"));
  return tempPath;
}

// 🆕 Rotar imagen 90° usando Sharp (más confiable que rotar el PDF)
async function rotateImageVertical(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .rotate(90) // Rotar 90° en sentido horario
      .toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error("Error rotando imagen:", error);
    throw error;
  }
}

// Crear PDF simple SIN rotación (la imagen ya viene rotada)
function createSimplePdf(imagePath, pdfPath, widthPts = 243, heightPts = 153) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [widthPts, heightPts],
      margin: 0,
      autoFirstPage: false,
    });

    async function createDoubleSidedPdf(frentePath, reversoPath, pdfPath, widthPts = 243, heightPts = 153) {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: [widthPts, heightPts],
          margin: 0,
          autoFirstPage: false,
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // Página 1: FRENTE (ya viene rotado)
        doc.addPage({ size: [widthPts, heightPts], margin: 0 });
        doc.image(frentePath, 0, 0, { width: widthPts, height: heightPts });

        // Página 2: REVERSO (ya viene rotado)
        doc.addPage({ size: [widthPts, heightPts], margin: 0 });
        doc.image(reversoPath, 0, 0, { width: widthPts, height: heightPts });

        doc.end();

        stream.on("finish", () => resolve(pdfPath));
        stream.on("error", reject);
      });
    }

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.addPage({ size: [widthPts, heightPts], margin: 0 });
    doc.image(imagePath, 0, 0, { width: widthPts, height: heightPts });

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}

// 🆕 Crear PDF con frente y reverso YA ROTADOS
async function createDoubleSidedPdf(frentePath, reversoPath, pdfPath, widthPts = 243, heightPts = 153) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [widthPts, heightPts],
      margin: 0,
      autoFirstPage: false,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Página 1: FRENTE (ya viene rotado)
    doc.addPage({ size: [widthPts, heightPts], margin: 0 });
    doc.image(frentePath, 0, 0, { width: widthPts, height: heightPts });

    // Página 2: REVERSO (ya viene rotado)
    doc.addPage({ size: [widthPts, heightPts], margin: 0 });
    doc.image(reversoPath, 0, 0, { width: widthPts, height: heightPts });

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}

export async function printDoubleSidedCard(frenteBase64, reversoBase64, options = {}) {
  const printerName = options.printerName || PRINTER_NAME;

  // 1️⃣ Guardar imágenes originales
  const frenteOriginal = await savePngTemp(frenteBase64, `temp_frente_orig_${Date.now()}.png`);
  const reversoOriginal = await savePngTemp(reversoBase64, `temp_reverso_orig_${Date.now()}.png`);

  // 2️⃣ Rotar imágenes 90° para orientación vertical
  const frenteRotated = path.join(process.cwd(), `temp_frente_rotated_${Date.now()}.png`);
  const reversoRotated = path.join(process.cwd(), `temp_reverso_rotated_${Date.now()}.png`);

  await rotateImageVertical(frenteOriginal, frenteRotated);
  await rotateImageVertical(reversoOriginal, reversoRotated);

  // 3️⃣ Crear PDF con las imágenes rotadas
  const pdfPath = path.join(process.cwd(), `temp_card_${Date.now()}.pdf`);
  await createDoubleSidedPdf(frenteRotated, reversoRotated, pdfPath);

  console.log("🧾 Archivos creados:", { frenteRotated, reversoRotated, pdfPath });
  console.log("🖨️ Usando impresora:", printerName);

  try {
    console.log("🖨️ Enviando PDF doble cara a impresora:", printerName);
    await printer.print(pdfPath, { printer: printerName });
    console.log("✅ Trabajo de impresión doble cara enviado correctamente.");
  } catch (err) {
    console.error("❌ Error enviando a la impresora:", err);
    throw err;
  } finally {
    // 4️⃣ Limpiar todos los archivos temporales
    try { fs.unlinkSync(frenteOriginal); } catch (e) { }
    try { fs.unlinkSync(reversoOriginal); } catch (e) { }
    try { fs.unlinkSync(frenteRotated); } catch (e) { }
    try { fs.unlinkSync(reversoRotated); } catch (e) { }
    try { fs.unlinkSync(pdfPath); } catch (e) { }
  }
}

export async function printImageAsPdf(base64Image, options = {}) {
  const printerName = options.printerName || PRINTER_NAME;

  // 1️⃣ Guardar imagen original
  const pngOriginal = await savePngTemp(base64Image, `temp_print_orig_${Date.now()}.png`);

  // 2️⃣ Rotar 90° para orientación vertical
  const pngRotated = path.join(process.cwd(), `temp_print_rotated_${Date.now()}.png`);
  await rotateImageVertical(pngOriginal, pngRotated);

  // 3️⃣ Crear PDF simple sin rotación adicional
  const pdfPath = pngRotated.replace(/\.png$/i, ".pdf");
  await createSimplePdf(pngRotated, pdfPath);

  console.log("🧾 Archivos creados:", { pngRotated, pdfPath });
  console.log("🖨️ Usando impresora:", printerName);

  try {
    console.log("🖨️ Enviando PDF a impresora:", printerName);
    await printer.print(pdfPath, { printer: printerName });
    console.log("✅ Trabajo enviado correctamente a la impresora.");
  } catch (err) {
    console.error("❌ Error enviando a la impresora:", err);
    throw err;
  } finally {
    try { fs.unlinkSync(pngOriginal); } catch (e) { }
    try { fs.unlinkSync(pngRotated); } catch (e) { }
    try { fs.unlinkSync(pdfPath); } catch (e) { }
  }
}

export function listWindowsPrinters() {
  return new Promise((resolve) => {
    exec(
      'powershell -Command "Get-Printer | Select-Object -Property Name,Default | ConvertTo-Json"',
      (err, stdout) => {
        if (err) {
          console.error("No se pudo listar impresoras:", err);
          return resolve(null);
        }
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (e) {
          resolve(null);
        }
      }
    );
  });
}