import cron from "node-cron";
import dayjs from "dayjs";
import { Op } from "sequelize";
import sequelize from "./config/database.js";
import Empleado from "./models/Empleados.js";

async function syncEstadosPorVencimiento() {
  try {
    const empleados = await Empleado.findAll({
      where: {
        vencimiento_contrato: { [Op.not]: null },
      },
    });

    let actualizados = 0;

    for (const emp of empleados) {
      const hoy = dayjs();
      const vencimiento = dayjs(emp.vencimiento_contrato);

      const nuevoEstado = vencimiento.isBefore(hoy, "day")
        ? "inactivo"
        : "activo";

      if (emp.estado_qr !== nuevoEstado) {
        emp.estado_qr = nuevoEstado;
        await emp.save();
        actualizados++;
      }
    }

    console.log(
      `[scheduler] Estados sincronizados correctamente: ${actualizados} actualizados - ${dayjs().format()}`
    );
  } catch (err) {
    console.error("[scheduler] Error al sincronizar estados:", err);
  }
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log("[scheduler] Conectado a la base de datos correctamente ✅");

    await syncEstadosPorVencimiento();
  } catch (error) {
    console.error("[scheduler] Error inicial:", error);
  }
})();

cron.schedule(
  "0 2 * * *",
  async () => {
    await syncEstadosPorVencimiento();
  },
  { timezone: "America/Mexico_City" }
);

console.log("[scheduler] Tarea programada para sincronizar estados (daily @ 02:00)");
