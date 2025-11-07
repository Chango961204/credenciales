import { logAudit } from "../services/audit.service.js";

export default function auditMiddleware(req, res, next) {
    req.audit = async (payload) => {
        await logAudit(req, payload);
    };
    next();
}
