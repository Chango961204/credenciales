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
  const vencimiento = formatDate(emp.vencimiento_contrato);

  return (
    <div className="group relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-blue-500" />

      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-start md:gap-6">
        <div className="flex-1">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-lg font-semibold tracking-tight text-slate-900">
              {emp.nom_trab}
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                No. {emp.num_trab}
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                Vence:{" "}
                <span className="font-semibold text-slate-800">
                  {vencimiento}
                </span>
              </span>
            </div>
          </div>

          {/* datos */}
          <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-800">IMSS:</span>{" "}
              {emp.num_imss || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-slate-800">RFC:</span>{" "}
              {emp.rfc || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                Departamento:
              </span>{" "}
              {emp.nom_depto || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Puesto:</span>{" "}
              {emp.puesto || "N/A"}
            </p>
          </div>

          {/* Carga de foto */}
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Fotografía del empleado
            </p>
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

        {/* Acciones */}
        <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
          <button
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            onClick={() => onGenerate(emp.id)}
          >
            Información del empleado
          </button>

          <button
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
            onClick={() => onEdit(emp)}
          >
            Editar datos
          </button>
        </div>
      </div>

      {/* Separador visual para el contenido expandido */}
      {(qrEmpleadoId === emp.id || modalEmpleadoId === emp.id) && (
        <div className="mx-5 mb-4 border-t border-dashed border-slate-200 pt-4" />
      )}

      {/* Panel QR / info extendida */}
      {qrEmpleadoId === emp.id && (
        <div className="px-5 pb-4">
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
        </div>
      )}

      {/* Modal de edición */}
      {modalEmpleadoId === emp.id && (
        <div className="px-5 pb-4">
          <EmpleadoModal
            empleado={emp}
            form={editForm}
            setForm={setEditForm}
            onClose={() => onEdit(null)}
            onSave={onSave}
          />
        </div>
      )}

      {/* Generador de credencial (lo dejo al final, como acción avanzada) */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        <CredencialGenerator empleadoId={emp.id} />
      </div>
    </div>
  );
}
