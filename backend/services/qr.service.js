import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import dayjs from "dayjs";

export const generarQrParaEmpleado = async (empleadoId, baseUrl) => {
  const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [empleadoId]);
  if (!rows.length) throw new Error("Empleado no encontrado");
  const empleado = rows[0];

  const qrCode = uuidv4();
  const base = (baseUrl || process.env.PUBLIC_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
  const payloadUrl = `${base}/api/empleados/qr/${qrCode}`;

  const qrImage = await QRCode.toDataURL(payloadUrl);

  await pool.query(
    "UPDATE empleados SET qr_code = ?, qr_generated_at = NOW() WHERE id = ?",
    [qrCode, empleadoId]
  );

  const vencimiento = empleado.vencimiento_contrato ? dayjs(empleado.vencimiento_contrato).format("DD/MM/YYYY") : null;
  const fecha_ing = empleado.fecha_ing ? dayjs(empleado.fecha_ing).format("DD/MM/YYYY") : null;

  return {
    qr_image: qrImage,
    url: payloadUrl,
    empleado: {
      id: empleado.id,
      num_trab: empleado.num_trab,
      nom_trab: empleado.nom_trab,
      num_imss: empleado.num_imss,
      puesto: empleado.puesto,
      vencimiento_contrato: vencimiento,
      fecha_ing,
      categoria: empleado.categoria,
      puesto: empleado.puesto,
      estado_qr: empleado.estado_qr,
    }
  };
};
