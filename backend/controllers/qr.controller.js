import QRCode from "qrcode";
import Empleado from "../models/Empleados.js";

export const postGenerarQr = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await Empleado.findByPk(id);

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const qrPayload = {
      id: empleado.id,
      num_trab: empleado.num_trab,
      nom_trab: empleado.nom_trab,
      vencimiento_contrato: empleado.vencimiento_contrato,
      estado_qr: empleado.estado_qr,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

    res.json({
      message: "QR generado correctamente",
      empleado,
      qrCode,
    });
  } catch (err) {
    console.error("Error postGenerarQr:", err);
    res.status(500).json({ message: "Error al generar QR" });
  }
};
