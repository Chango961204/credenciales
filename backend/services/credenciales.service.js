import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Función para ajustar texto ===
function textoCordenadas(ctx, texto, x, y, maxWidth, fontSizeInicial, fontFamily = "Arial", bold = true) {
  const fontWeight = bold ? "bold" : "normal";
  let fontSize = fontSizeInicial;
  const minFontSize = 20;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  if (ctx.measureText(texto).width <= maxWidth) {
    ctx.fillText(texto, x, y);
    return;
  }

  const reduccionMaxima = Math.floor(fontSizeInicial * 0.2);
  while (ctx.measureText(texto).width > maxWidth && fontSize > fontSizeInicial - reduccionMaxima && fontSize > minFontSize) {
    fontSize -= 1;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }

  if (ctx.measureText(texto).width <= maxWidth) {
    ctx.fillText(texto, x, y);
    return;
  }

  fontSize = fontSizeInicial - 3;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  const palabras = texto.split(" ");
  let mejorDivision = Math.ceil(palabras.length / 2);
  let menorDiferencia = Infinity;

  for (let i = 1; i < palabras.length; i++) {
    const linea1 = palabras.slice(0, i).join(" ");
    const linea2 = palabras.slice(i).join(" ");
    const ancho1 = ctx.measureText(linea1).width;
    const ancho2 = ctx.measureText(linea2).width;
    const diferencia = Math.abs(ancho1 - ancho2);

    if (ancho1 <= maxWidth && ancho2 <= maxWidth && diferencia < menorDiferencia) {
      menorDiferencia = diferencia;
      mejorDivision = i;
    }
  }

  const linea1 = palabras.slice(0, mejorDivision).join(" ");
  const linea2 = palabras.slice(mejorDivision).join(" ");
  ctx.fillText(linea1, x, y - 5);
  ctx.fillText(linea2, x, y + fontSize + 5);
}

// === FUNCIÓN PRINCIPAL ===
export async function generarCredencialFiles(empleado) {
  // Plantillas base
  const frenteTpl = path.join(__dirname, "../plantillas/FrenteCredencial.jpg");
  const reversoTpl = path.join(__dirname, "../plantillas/ReversoCredencial.jpg");

  if (!fs.existsSync(frenteTpl) || !fs.existsSync(reversoTpl)) {
    throw new Error("Faltan las plantillas en backend/plantillas");
  }

  // === FRENTE ===
  const frenteImg = await loadImage(frenteTpl);
  const canvas = createCanvas(frenteImg.width, frenteImg.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(frenteImg, 0, 0);

  // Cargar foto del empleado o placeholder
  let fotoImg;
  const fotoPath = path.join(__dirname, "../uploads/fotosEmpleados", `${empleado.id}.png`);
  const placeholder = path.join(__dirname, "../plantillas/placeholder.jpg");

  if (fs.existsSync(fotoPath)) {
    fotoImg = await loadImage(fotoPath);
  } else if (fs.existsSync(placeholder)) {
    fotoImg = await loadImage(placeholder);
  }

  if (fotoImg) {
    ctx.drawImage(fotoImg, 20, 400, 250, 320);
  }

  // Texto de datos
  ctx.fillStyle = "#000000ff";
  ctx.textAlign = "left";

  textoCordenadas(ctx, empleado.nom_trab || "Sin nombre", 295, 500, 450, 30);
  textoCordenadas(ctx, empleado.num_trab || "Sin número", 430, 730, 400, 43);
  textoCordenadas(ctx, empleado.puesto || "Sin cargo", 50, 860, 500, 28);

  const frenteDataUrl = canvas.toDataURL("image/png");

  // === REVERSO ===
  const reversoImg = await loadImage(reversoTpl);
  const canvasReverso = createCanvas(reversoImg.width, reversoImg.height);
  const ctxReverso = canvasReverso.getContext("2d");

  ctxReverso.drawImage(reversoImg, 0, 0);

  function crearUrlConToken(empleado) { 
    const token = jwt.sign(
      { id: empleado.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    const frontUrl = `${process.env.FRONT_URL}/credencial/${token}`;
    return { token, frontUrl };
  }

  const { frontUrl } = crearUrlConToken(empleado);


  //const frontUrl = `http://localhost:5173/credencial/${empleado.id}`;
  //const frontUrl = `https://6811da40ffb5.ngrok-free.app/credencial/${empleado.id}`;

  const qrDataUrl = await QRCode.toDataURL(frontUrl, {
    width: 280,
    margin: 1,
  });

  const qrImg = await loadImage(qrDataUrl);
  ctxReverso.drawImage(qrImg, 400, 450, 480, 480);

  // Texto adicional
  ctxReverso.fillStyle = "#000000";
  ctxReverso.textAlign = "center";
  ctxReverso.font = "bold 45px Arial";

  let fechaVenc = "N/A";
  if (empleado.vencimiento_contrato) {
    const fechaObj = new Date(empleado.vencimiento_contrato);
    fechaVenc = fechaObj.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  ctxReverso.fillText(`Vigencia: ${fechaVenc}`, reversoImg.width / 2, 1562);

  const reversoDataUrl = canvasReverso.toDataURL("image/png");

  return {
    frenteDataUrl,
    reversoDataUrl,
  };
}
