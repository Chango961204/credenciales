import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import dayjs from "dayjs";
import Empleado from "../models/Empleados.js";

export const generarQrParaEmpleado = async (empleadoId, baseUrl) => {
  const empleado = await Empleado.findByPk(empleadoId);

  if (!empleado) throw new Error("Empleado no encontrado");

  const qrCode = uuidv4();
  const base = (baseUrl || process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT}`).replace(/\/$/, "");
  const payloadUrl = `${base}/api/empleados/qr/${qrCode}`;

  const qrImage = await QRCode.toDataURL(payloadUrl);

  await empleado.update({
    qr_code: qrCode,
    qr_generated_at: new Date(),
  });

  const vencimiento = empleado.vencimiento_contrato
    ? dayjs(empleado.vencimiento_contrato).format("DD/MM/YYYY")
    : null;

  const fecha_ing = empleado.fecha_ing
    ? dayjs(empleado.fecha_ing).format("DD/MM/YYYY")
    : null;

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
      estado_qr: empleado.estado_qr,
    },
  };
};
