// backend/scheduler.js
import cron from "node-cron";
import pool from "./config/db.js";
import dayjs from "dayjs";

async function syncEstadosPorVencimiento() {
  try {
    // Opción eficiente: actualizar en lote según CURDATE()
    const [result] = await pool.query(
      `UPDATE empleados
         SET estado_qr = CASE
           WHEN vencimiento_contrato IS NOT NULL AND DATE(vencimiento_contrato) < CURDATE() THEN 'inactivo'
           WHEN vencimiento_contrato IS NOT NULL AND DATE(vencimiento_contrato) >= CURDATE() THEN 'activo'
           ELSE estado_qr
         END
       WHERE vencimiento_contrato IS NOT NULL`
    );

    console.log(`[scheduler] syncEstadosPorVencimiento ejecutado - affectedRows: ${result.affectedRows} - ${dayjs().format()}`);
  } catch (err) {
    console.error("[scheduler] Error al sincronizar estados por vencimiento:", err);
  }
}

// Ejecutar una vez al arrancar el servidor (para sincronizar inmediatamente)
(async () => {
  await syncEstadosPorVencimiento();
})();

// Programar la tarea para que corra todos los días a las 02:00 (hora del servidor).
// Si quieres zona horaria específica (ej. Ciudad de México) agrega { timezone: "America/Mexico_City" }
cron.schedule(
  "0 2 * * *",
  async () => {
    await syncEstadosPorVencimiento();
  },
  {
    timezone: "America/Mexico_City",
  }
);

console.log("[scheduler] Tarea programada para sincronizar estados (daily @ 02:00)");
