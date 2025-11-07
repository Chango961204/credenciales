import { Op } from "sequelize";
import Auditoria from "../models/Auditoria.js";

export async function listAuditorias(req, res) {
    try {
        const {
            model, modelId, userId, event,
            email, 
            from, to, 
            page = 1, limit = 20,
        } = req.query;

        const where = {};
        if (model) where.model = model;
        if (modelId) where.modelId = modelId;
        if (userId) where.userId = userId;
        if (event) where.event = event;
        if (email) where.userEmail = { [Op.like]: `%${email}%` };

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(from + " 00:00:00");
            if (to) where.createdAt[Op.lte] = new Date(to + " 23:59:59");
        }

        const offset = (Number(page) - 1) * Number(limit);

        const { rows, count } = await Auditoria.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: Number(limit),
            offset,
        });

        res.json({
            total: count,
            page: Number(page),
            limit: Number(limit),
            data: rows,
        });
    } catch (err) {
        res.status(500).json({ message: "Error listando auditorías", error: err.message });
    }
}
