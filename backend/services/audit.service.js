// backend/services/audit.service.js
import Auditoria from "../models/Auditoria.js";
import { auditSafe } from "../utils/auditSafe.js";

/**
 * .
 *
 * @param {import("express").Request | null} req
 * @param {{
 *   event: string,
 *   model: string,
 *   modelId?: string|number|null,
 *   oldValues?: any,
 *   newValues?: any
 * }} payload
 */
export async function logAudit(req, payload) {
  try {
    const getClientIp = (r) => {
      const fwd = r?.headers?.["x-forwarded-for"];
      let ip = Array.isArray(fwd) ? fwd[0] : (typeof fwd === "string" ? fwd.split(",")[0] : null);
      ip = (ip || r?.socket?.remoteAddress || r?.ip || "").toString().trim();
      if (ip === "::1") return "127.0.0.1";
      if (ip.startsWith("::ffff:")) return ip.slice(7); // ::ffff:10.0.0.5 -> 10.0.0.5
      return ip;
    };

    const userId    = req?.user?.id ?? null;
    const username  = req?.user?.username || req?.user?.name || (userId ? null : "anonymous");
    const userEmail = req?.user?.email || null;
    const url       = req?.originalUrl || req?.url || null;
    const ip        = getClientIp(req);

    await Auditoria.create({
      event:   payload.event,
      model:   payload.model,
      modelId: payload.modelId != null ? String(payload.modelId) : null,
      oldValues: auditSafe(payload.oldValues) ?? null,
      newValues: auditSafe(payload.newValues) ?? null,
      userId,
      username,
      userEmail,
      url,
      ip,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[audit] error:", err?.message || err);
  }
}
