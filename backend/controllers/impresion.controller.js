import { printImageAsPdf, listWindowsPrinters } from "../services/zebraPrint.service.js";

export const enviarImpresion = async (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) return res.status(400).json({ message: "Falta imageBase64" });

    const printers = await listWindowsPrinters();
    console.log("Impresoras detectadas (debug):", printers);

    await printImageAsPdf(imageBase64, { printerName: "Zebra ZXP Series 3" });

    // + AUDITORIA: impresión
    await req.audit({
      event: "print",
      model: "impresion",
      modelId: null,
      oldValues: null,
      newValues: { filename: filename || null, size: imageBase64.length },
    });

    res.json({ message: "Trabajo de impresión enviado correctamente" });
  } catch (err) {
    console.error("Error en enviarImpresion:", err);
    res.status(500).json({ message: "Error al imprimir", error: String(err) });
  }
};
