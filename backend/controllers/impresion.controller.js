import Empleado from "../models/Empleados.js";
import { generarCredencialFiles } from "../services/credenciales.service.js";
import { printDoubleSidedCard, listPrinters } from "../services/zebraPrint.service.js";

export async function imprimirCredencialPorEmpleado(req, res) {
  try {
    const { id } = req.params;
    const emp = await Empleado.findByPk(id);
    if (!emp) return res.status(404).json({ message: "Empleado no encontrado" });

    const { frenteDataUrl, reversoDataUrl } = await generarCredencialFiles(emp);

    await printDoubleSidedCard(frenteDataUrl, reversoDataUrl, {
      printerName: process.env.PRINTER_NAME || "Zebra ZXP Series 3 USB Card Printer",
    });

    if (req.audit) {
      await req.audit({
        event: "print_card",
        model: "impresion",
        modelId: String(emp.id),
        oldValues: null,
        newValues: { empleadoId: emp.id },
      });
    }

    res.json({ success: true, message: "Enviado a imprimir" });
  } catch (err) {
    console.error("Error imprimirCredencialPorEmpleado:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function listarImpresoras(_req, res) {
  try {
    const printers = await listPrinters();
    res.json({ printers });
  } catch (err) {
    console.error("Error listando impresoras:", err);
    res.status(500).json({ message: err.message });
  }
}
