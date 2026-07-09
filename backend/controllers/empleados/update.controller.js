import Empleado from "../../models/Empleados.js";

export const registrarEmpleado = async (req, res) => {
    try {
        const body = req.body;

        const data = {};
        const numericFields = ["num_trab", "num_depto"];
        const dateFields = ["fecha_ing", "vencimiento_contrato"];
        const tinyIntFields = ["sind", "conf"];

        for (const [key, value] of Object.entries(body)) {
            if (typeof value === "undefined") continue;

            if (value === "" && !tinyIntFields.includes(key)) continue;

            if (numericFields.includes(key)) {
                data[key] = value === "" ? null : Number(value);
            } else if (dateFields.includes(key)) {
                data[key] = value ? value : null; // "YYYY-MM-DD" es válido
            } else if (tinyIntFields.includes(key)) {
                // "1"/"0" → 1/0
                data[key] = value === "1" || value === 1 ? 1 : 0;
            } else {
                data[key] = value;
            }
        }

        if (!data.estado_qr) {
            data.estado_qr = "activo";
        }

        const empleado = await Empleado.create(data);

        if (req.audit) {
            await req.audit({
                event: "created",
                model: "empleados",
                modelId: String(empleado.id),
                oldValues: null,
                newValues: {
                    id: empleado.id,
                    num_trab: empleado.num_trab,
                    nom_trab: empleado.nom_trab,
                    puesto: empleado.puesto,
                    nom_depto: empleado.nom_depto,
                },
            });
        }

        res.status(201).json({
            message: "Empleado registrado correctamente",
            empleado,
        });
    } catch (error) {
        console.error("Error registrarEmpleado:", error);
        res.status(500).json({
            message: "Error al registrar empleado",
            error: error.message,
        });
    }
};

export const actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        // Validación básica numérica
        if (payload.num_trab && isNaN(Number(payload.num_trab))) {
            return res
                .status(400)
                .json({ message: "num_trab debe ser numérico" });
        }

        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res
                .status(404)
                .json({ message: "Empleado no encontrado" });
        }

        const before = empleado.get({ plain: true });

        const updates = {};
        const allowedFields = new Set(["num_trab", "rfc", "nom_trab", "num_imss", "sexo", "fecha_ing", "num_depto", "nom_depto", "categoria", "puesto", "sind", "conf", "nomina", "vencimiento_contrato", "estado_qr",]);
        const numericFields = ["num_trab", "num_depto"];
        const dateFields = ["fecha_ing", "vencimiento_contrato"];

        for (const [key, value] of Object.entries(payload)) {
            if (!allowedFields.has(key)) continue;
            if (value === "" || typeof value === "undefined") continue;

            if (numericFields.includes(key)) {
                updates[key] = Number(value);
            } else if (dateFields.includes(key)) {
                updates[key] = value ? value : null;
            } else if (key === "estado_qr") {
                if (value === "activo" || value === "inactivo") {
                    updates[key] = value;
                }
            } else {
                updates[key] = value;
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.json({
                message: "No hay cambios para aplicar",
                empleado,
            });
        }

        await empleado.update(updates);
        const after = empleado.get({ plain: true });

        if (req.audit) {
            await req.audit({
                event: "updated",
                model: "empleados",
                modelId: String(empleado.id),
                oldValues: before,
                newValues: after,
            });
        }

        res.json({
            message: "Empleado actualizado correctamente",
            empleado,
        });
    } catch (err) {
        console.error("Error actualizarEmpleado:", err);
        res.status(500).json({
            message: "Error al actualizar empleado",
            error: err.message,
        });
    }
};

export const actualizarEstadoEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_qr } = req.body;

        if (!["activo", "inactivo"].includes(estado_qr)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res
                .status(404)
                .json({ message: "Empleado no encontrado" });
        }

        const before = { estado_qr: empleado.estado_qr };
        empleado.estado_qr = estado_qr;
        await empleado.save();
        const after = { estado_qr: empleado.estado_qr };

        if (req.audit) {
            await req.audit({
                event: "updated",
                model: "empleados",
                modelId: String(empleado.id),
                oldValues: before,
                newValues: after,
            });
        }

        res.json({ message: "Estado actualizado correctamente" });
    } catch (err) {
        console.error("Error actualizarEstadoEmpleado:", err);
        res.status(500).json({ message: err.message });
    }
};

export const deleteEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const emp = await Empleado.findByPk(id);
        if (!emp) {
            return res
                .status(404)
                .json({ message: "Empleado no encontrado" });
        }

        const snapshot = emp.get({ plain: true });
        await emp.destroy();

        if (req.audit) {
            await req.audit({
                event: "deleted",
                model: "empleados",
                modelId: String(id),
                oldValues: snapshot,
                newValues: null,
            });
        }

        res.json({ message: "Empleado eliminado correctamente" });
    } catch (err) {
        console.error("Error deleteEmpleado:", err);
        res.status(500).json({ message: err.message });
    }
};
