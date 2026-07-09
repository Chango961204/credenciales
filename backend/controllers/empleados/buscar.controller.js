import { buscarEmpleados } from "../../services/empleados.service.js";

export const getBuscarEmpleados = async (req, res) => {
    try {
        const { num_trab, nombre } = req.query;

        if (
            (!num_trab || String(num_trab).trim() === "") &&
            (!nombre || String(nombre).trim() === "")
        ) {
            return res.json([]);
        }

        const empleados = await buscarEmpleados({ num_trab, nombre });

        const normalized = empleados.map((emp) => ({
            ...emp.toJSON(),
            fecha_ing: emp.fecha_ing
                ? dayjs(emp.fecha_ing).format("YYYY-MM-DD")
                : null,
            vencimiento_contrato: emp.vencimiento_contrato
                ? dayjs(emp.vencimiento_contrato).format("YYYY-MM-DD")
                : null,
        }));

        res.json(normalized);
    } catch (err) {
        console.error("Error en getBuscarEmpleados:", err);
        res.status(500).json({ message: err.message });
    }
};
