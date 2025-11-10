import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function textoCordenadas(
  ctx,
  texto,
  x,
  y,
  maxWidth,
  fontSizeInicial,
  fontFamily = "Arial",
  bold = true
) {
  const fontWeight = bold ? "bold" : "normal";
  let fontSize = fontSizeInicial;
  const minFontSize = 20;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  if (ctx.measureText(texto).width <= maxWidth) {
    ctx.fillText(texto, x, y);
    return;
  }

  const reduccionMaxima = Math.floor(fontSizeInicial * 0.2);
  while (
    ctx.measureText(texto).width > maxWidth &&
    fontSize > fontSizeInicial - reduccionMaxima &&
    fontSize > minFontSize
  ) {
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


function separarApellidosNombres(nombreCompleto = "") {
  const partes = nombreCompleto.trim().split(/\s+/);

  if (partes.length === 0) {
    return { apellidos: "", nombres: "" };
  }

  if (partes.length === 1) {
    return { apellidos: partes[0], nombres: "" };
  }

  if (partes.length === 2) {
    return { apellidos: partes[0], nombres: partes[1] };
  }

  const apellidos = partes.slice(0, 2).join(" ");
  const nombres = partes.slice(2).join(" ");
  return { apellidos, nombres };
}

export async function generarCredencialFiles(empleado) {
  const frenteTpl = path.join(__dirname, "../plantillas/frente_credencial.jpg");
  const reversoTpl = path.join(__dirname, "../plantillas/reverso_credencial.jpg");
  const placeholder = path.join(__dirname, "../plantillas/placeholder.jpg");

  console.log("⤴️ generarCredencialFiles -> comprobando plantillas...");
  console.log("  frenteTpl:", frenteTpl);
  console.log("  reversoTpl:", reversoTpl);
  console.log("  placeholder:", placeholder);

  if (!fs.existsSync(frenteTpl) || !fs.existsSync(reversoTpl)) {
    throw new Error(
      "Faltan las plantillas en backend/plantillas (frente_credencial.jpg o reverso_credencial.jpg)"
    );
  }

  try {
    const frenteImg = await loadImage(frenteTpl);
    const canvas = createCanvas(frenteImg.width, frenteImg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(frenteImg, 0, 0);

    let fotoImg = null;
    const posibles = [];

    if (empleado.foto_path) {
      posibles.push(
        path.join(__dirname, "../uploads/fotosEmpleados", empleado.foto_path)
      );
    }

    posibles.push(path.join(__dirname, "../uploads/fotosEmpleados", `${empleado.id}.png`));
    posibles.push(path.join(__dirname, "../uploads/fotosEmpleados", `${empleado.id}.jpg`));
    posibles.push(path.join(__dirname, "../uploads/fotosEmpleados", `${empleado.id}.jpeg`));

    for (const p of posibles) {
      try {
        if (fs.existsSync(p)) {
          console.log("  Foto encontrada:", p);
          fotoImg = await loadImage(p);
          break;
        }
      } catch (e) {
        console.warn("  Error comprobando foto:", p, e.message);
      }
    }

    if (!fotoImg && fs.existsSync(placeholder)) {
      try {
        fotoImg = await loadImage(placeholder);
        console.log("  ✓ Usando placeholder:", placeholder);
      } catch (e) {
        console.warn("   Error cargando placeholder:", e.message);
      }
    }

    if (fotoImg) {
      ctx.drawImage(fotoImg, 20, 400, 250, 320);
    } else {
      console.log("  ℹ No se encontró foto ni placeholder; se omitirá la foto.");
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";

    const fullName = (empleado.nom_trab || "Sin nombre").toString().toUpperCase();
    const { apellidos, nombres } = separarApellidosNombres(fullName);

    textoCordenadas(ctx, apellidos || "SIN APELLIDO", 300, 500, 400, 25, "Arial", true);

    if (nombres) {
      textoCordenadas(ctx, nombres, 300, 540, 400, 25, "Arial", true);
    }

    textoCordenadas(ctx, empleado.num_trab || "Sin número", 430, 730, 400, 43);

    ctx.textAlign = "center";  

    const cargo = (empleado.puesto || "SIN CARGO").toUpperCase();
    const centerX = frenteImg.width / 2; 
    textoCordenadas(ctx, cargo, centerX, 860, 600, 28, "Arial", true);
    /*     textoCordenadas(ctx, empleado.puesto || "Sin cargo", 50, 860, 500, 28);
     */
    const frenteDataUrl = canvas.toDataURL("image/png");

    const reversoImg = await loadImage(reversoTpl);
    const canvasReverso = createCanvas(reversoImg.width, reversoImg.height);
    const ctxReverso = canvasReverso.getContext("2d");
    ctxReverso.drawImage(reversoImg, 0, 0);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está definido en las variables de entorno");
    }
    if (!process.env.FRONT_URL) {
      throw new Error("FRONT_URL no está definido en las variables de entorno");
    }

    const token = jwt.sign(
      { id: empleado.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    const frontUrl = `${process.env.FRONT_URL.replace(/\/$/, "")}/credencial/${token}`;

    const qrDataUrl = await QRCode.toDataURL(frontUrl, {
      width: 280,
      margin: 1,
    });

    const qrImg = await loadImage(qrDataUrl);
    ctxReverso.drawImage(qrImg, 400, 450, 480, 480);

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
  } catch (err) {
    throw new Error(
      `Error generando las imágenes de la credencial: ${err.message}`
    );
  }
}
