import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import pool from "../db.js";

// Servicio para generar QR de un empleado
export const generarQrParaEmpleado = async (empleadoId) => {
  const [[empleado]] = await pool.query(
    "SELECT id, num_trab, nom_trab, vencimiento_contrato FROM empleados WHERE id = ?",
    [empleadoId]
  );

  if (!empleado) throw new Error("Empleado no encontrado");

  const qrCode = uuidv4();
  const dataUrl = await QRCode.toDataURL(String(qrCode));

  const venc = empleado.vencimiento_contrato ? new Date(empleado.vencimiento_contrato) : null;
  const estado = venc && venc < new Date() ? "inactivo" : "activo";

  await pool.query(
    "UPDATE empleados SET qr_code = ?, qr_generated_at = NOW(), estado_qr = ? WHERE id = ?",
    [qrCode, estado, empleadoId]
  );

  return {
    qrCode,
    qr_image: dataUrl,
    empleado: {
      id: empleado.id,
      num_trab: empleado.num_trab,
      nombre: empleado.nom_trab,
      vencimiento: empleado.vencimiento_contrato,
      estado,
    },
  };
};
