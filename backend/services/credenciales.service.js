import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generarCredencialFiles(empleado) {
    const frenteTpl = path.join(__dirname, "../plantillas/FrenteCredencial.jpg");
    const reversoTpl = path.join(__dirname, "../plantillas/ReversoCredencial.jpg");

    if (!fs.existsSync(frenteTpl) || !fs.existsSync(reversoTpl)) {
        throw new Error("Faltan las plantillas en backend/plantillas");
    }

    const frenteImg = await loadImage(frenteTpl);
    const canvas = createCanvas(frenteImg.width, frenteImg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(frenteImg, 0, 0);

    let fotoImg;
    const fotoPath = path.join(__dirname, "../uploads/fotosEmpleados", `${empleado.id}.png`);
    const placeholder = path.join(__dirname, "../plantillas/placeholder.jpg");

    if (fs.existsSync(fotoPath)) {
        fotoImg = await loadImage(fotoPath);
    } else if (fs.existsSync(placeholder)) {
        fotoImg = await loadImage(placeholder);
    }

    if (fotoImg) {
        ctx.drawImage(fotoImg, 20, 400, 200, 250);
    }

    ctx.fillStyle = "#000000ff";
    ctx.textAlign = "left";

    ctx.font = "bold 30px Arial";
    ctx.fillText(empleado.nom_trab || "Sin nombre", 280, 500);

    ctx.font = "bold 33px Arial";
    ctx.fillText(empleado.num_trab || "Sin numero de empleado", 430, 730);

    ctx.font = "bold 28px Arial";
    ctx.fillText(empleado.puesto || "Sin cargo", 350, 880);

    const frenteDataUrl = canvas.toDataURL("image/png");

    // === REVERSO ===
    const reversoImg = await loadImage(reversoTpl);
    const canvasReverso = createCanvas(reversoImg.width, reversoImg.height);
    const ctxReverso = canvasReverso.getContext("2d");

    ctxReverso.drawImage(reversoImg, 0, 0);

    const qrPayload = JSON.stringify({
        id: empleado.id,
        num_trab: empleado.num_trab,
        nom_trab: empleado.nom_trab,
        puesto: empleado.puesto,
        
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 280,
        margin: 1,
    });

    const qrImg = await loadImage(qrDataUrl);
    ctxReverso.drawImage(qrImg, 430, 500, 380, 380);

    ctxReverso.fillStyle = "#000309ff";
    ctxReverso.textAlign = "center";
    ctxReverso.font = "bold 26px Arial";

    let fechaVenc = "N/A";
    if (empleado.vencimiento_contrato) {
        const fechaObj = new Date(empleado.vencimiento_contrato);
        fechaVenc = fechaObj.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    ctxReverso.fillText(`Vigencia: ${fechaVenc}`, reversoImg.width / 2.3, 1562);

    const reversoDataUrl = canvasReverso.toDataURL("image/png");

    return {
        frenteDataUrl,
        reversoDataUrl,
    };
}
