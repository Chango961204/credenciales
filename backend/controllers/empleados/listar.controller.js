import Empleado from "../../models/Empleados.js";

export const getEmpleados = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
        const offset = (page - 1) * limit;

        const { rows: data, count: total } = await Empleado.findAndCountAll({
            offset,
            limit,
            order: [["id", "ASC"]],
        });

        res.json({
            empleados: data,
            total,
            page,
            limit,
        });
    } catch (error) {
        console.error("Error getEmpleados:", error);
        res.status(500).json({
            message: "Error al obtener empleados",
            error: error.message,
        });
    }
};

export const getEmpleadoById = async (req, res) => {
    try {
        const { id } = req.params;
        const empleado = await Empleado.findByPk(id);

        if (!empleado) {
            return res
                .status(404)
                .json({ message: "Empleado no encontrado" });
        }

        const fotoUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/empleados/${empleado.id}/foto`;

        res.json({
            id: empleado.id,
            num_trab: empleado.num_trab,
            nom_trab: empleado.nom_trab,
            puesto: empleado.puesto,
            rfc: empleado.rfc,
            num_imss: empleado.num_imss,
            nom_depto: empleado.nom_depto,
            vencimiento_contrato: empleado.vencimiento_contrato,
            estado_qr: empleado.estado_qr,
            fotoUrl,
        });
    } catch (err) {
        console.error("Error getEmpleadoById:", err);
        res.status(500).json({ message: err.message });
    }
};