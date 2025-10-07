import express from "express";
import { printDoubleSidedCard, listWindowsPrinters } from "../services/zebraPrint.service.js";

const router = express.Router();

router.get("/printers", async (req, res) => {
  try {
    const printers = await listWindowsPrinters();
    res.json({ printers });
  } catch (error) {
    console.error("Error listando impresoras:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { frente, reverso } = req.body;
    
    if (!frente || !reverso) {
      return res.status(400).json({ 
        error: "Se requieren ambas imágenes: frente y reverso" 
      });
    }
    
    await printDoubleSidedCard(frente, reverso, { 
      printerName: "Zebra ZXP Series 3 USB Card Printer" 
    });
    
    res.json({ message: "Impresión doble cara enviada correctamente" });
  } catch (error) {
    console.error("❌ Error en /api/impresion:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;