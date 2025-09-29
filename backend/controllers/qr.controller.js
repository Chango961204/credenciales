import QRCode from "qrcode";
import pool from "../config/db.js";

export const postGenerarQr = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Empleado no encontrado" });

    const empleado = rows[0];

    const qrPayload = {
      id: empleado.id,
      num_trab: empleado.num_trab,
      nom_trab: empleado.nom_trab,
      vencimiento_contrato: empleado.vencimiento_contrato,
      estado_qr: empleado.estado_qr,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

    res.json({ message: "QR generado", empleado, qrCode });
  } catch (err) {
    console.error("Error postGenerarQr:", err);
    res.status(500).json({ message: "Error al generar QR" });
  }
};
