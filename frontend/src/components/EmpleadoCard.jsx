import EmpleadoQr from "./EmpleadoQr";
import EmpleadoModal from "./EmpleadoModal";
import FotoEmpleadoUploader from "./FotoEmpleadoUploader";

function formatDate(value) {
    if (!value) return "N/A";

    if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        return value;
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [, y, m, d] = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        return `${d}/${m}/${y}`;
    }

    if (typeof value === "string") {
        const d = new Date(value);
        if (!isNaN(d)) {
            return d.toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
        return value;
    }

    if (value instanceof Date && !isNaN(value)) {
        return value.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return String(value);
}


export default function EmpleadoCard({
    emp,
    qrEmpleadoId,
    qrData,
    onGenerate,
    onEdit,
    onCloseQr,
    modalEmpleadoId,
    editForm,
    setEditForm,
    onSave,
    setResultados,
}) {
    return (
        <div className="bg-white shadow p-4 rounded-lg mb-3">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-lg font-bold text-blue-600 mb-2">{emp.nom_trab}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Número:</strong> {emp.num_trab}</p>
                        <p><strong>IMSS:</strong> {emp.num_imss || "N/A"}</p>
                        <p><strong>RFC:</strong> {emp.rfc || "N/A"}</p>
                        <p><strong>Departamento:</strong> {emp.nom_depto || "N/A"}</p>
                        <p><strong>Puesto:</strong> {emp.puesto || "N/A"}</p>
                        <p><strong>Vencimiento:</strong> {formatDate(emp.vencimiento_contrato)}</p>
                    </div>

                    <div className="mt-3">
                        {emp.foto ? (
                            <img
                                src={`http://localhost:4000/api/empleados/${emp.id}/foto`}
                                alt="Foto del empleado"
                                className="w-24 h-24 object-cover rounded"
                            />
                        ) : (
                            <p className="text-gray-500">Sin foto</p>
                        )}
                    </div>

                    <FotoEmpleadoUploader
                        empleadoId={emp.id}
                        onFotoSubida={(fileName) => {
                            setResultados((prev) =>
                                prev.map((e) => (e.id === emp.id ? { ...e, foto: fileName } : e))
                            );
                        }}
                        empleado={emp}
                    />
                </div>

                <div className="flex flex-col gap-2 ml-4">
                    <button
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                        onClick={() => onGenerate(emp.id)}
                    >
                        Generar QR
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                        onClick={() => onEdit(emp)}
                    >
                        Editar
                    </button>
                </div>
            </div>

            {qrEmpleadoId === emp.id && (
                <EmpleadoQr
                    empleado={qrData[emp.id]?.empleado || emp}
                    onClose={onCloseQr}
                    onQrUpdate={(updatedEmpleado) => {
                        setResultados((prev) =>
                            prev.map((e) => (e.id === updatedEmpleado.id ? updatedEmpleado : e))
                        );

                        onGenerate(updatedEmpleado.id);
                    }}
                />
            )}


            {modalEmpleadoId === emp.id && (
                <EmpleadoModal
                    empleado={emp}
                    form={editForm}
                    setForm={setEditForm}
                    onClose={() => onEdit(null)}
                    onSave={onSave}
                />
            )}
        </div>
    );
}
