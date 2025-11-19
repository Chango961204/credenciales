import EmpleadoQr from "./EmpleadoQr";
import EmpleadoModal from "./EmpleadoModal";
import FotoEmpleadoUploader from "./FotoEmpleadoUploader";
import CredencialGenerator from "./credencialGenerator";

function formatDate(value) {
  if (!value) return "N/A";

  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }

    const d = new Date(value);
    if (!isNaN(d)) {
      return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      });
    }
    return value;
  }

  if (value instanceof Date && !isNaN(value)) {
    return value.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
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
    <div className="bg-white shadow-lg rounded-2xl p-6 mb-4 border border-gray-100 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-800 mb-3">
            {emp.nom_trab}
          </h4>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-700">Número:</span>{" "}
              {emp.num_trab}
            </p>
            <p>
              <span className="font-semibold text-gray-700">IMSS:</span>{" "}
              {emp.num_imss || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">RFC:</span>{" "}
              {emp.rfc || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Departamento:</span>{" "}
              {emp.nom_depto || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Puesto:</span>{" "}
              {emp.puesto || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Vencimiento:</span>{" "}
              {formatDate(emp.vencimiento_contrato)}
            </p>
          </div>

          <div className="mt-4">
            <FotoEmpleadoUploader
              empleadoId={emp.id}
              onFotoSubida={(fileName) => {
                setResultados((prev) =>
                  prev.map((e) =>
                    e.id === emp.id ? { ...e, foto: fileName } : e
                  )
                );
              }}
              empleado={emp}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
            onClick={() => onGenerate(emp.id)}
          >
            Informacion del Empleado
          </button>
          <button
            className="px-5 py-2.5 rounded-lg bg-yellow-500 text-white font-medium shadow hover:bg-yellow-600 transition"
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
              prev.map((e) =>
                e.id === updatedEmpleado.id ? updatedEmpleado : e
              )
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
      <CredencialGenerator empleadoId={emp.id} />

    </div>

  );
}
