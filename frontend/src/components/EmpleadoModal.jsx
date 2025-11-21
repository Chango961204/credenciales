import React from "react";
import { Pencil } from "lucide-react";


function EmpleadoModal({ empleado, form, setForm, onClose, onSave }) {
  if (!empleado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white/95 shadow-2xl transition-all">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-blue-600">
                <Pencil className="h-4 w-4" />
              </span>
              Editar empleado
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Modifica solo los datos necesarios. Los cambios se reflejan en la credencial.
            </p>
          </div>

          <button
            onClick={onClose}
            className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Nombre completo
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                value={form.nom_trab}
                onChange={(e) =>
                  setForm({ ...form, nom_trab: e.target.value })
                }
                placeholder="Nombre del trabajador"
              />
            </div>

            {/* Departamento */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Departamento
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                value={form.nom_depto || ""}
                onChange={(e) =>
                  setForm({ ...form, nom_depto: e.target.value })
                }
                placeholder="Ej. Sindicatura Municipal"
              />
            </div>

            {/* Puesto */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Puesto
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                value={form.puesto || ""}
                onChange={(e) =>
                  setForm({ ...form, puesto: e.target.value })
                }
                placeholder="Ej. Asistente, Coordinador, etc."
              />
            </div>

            {/* Vencimiento de contrato */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Vencimiento de contrato
                <span className="ml-1 text-[10px] font-normal text-slate-400">
                  (opcional)
                </span>
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                value={form.vencimiento_contrato || ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? null : e.target.value;
                  setForm({ ...form, vencimiento_contrato: value });
                }}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <button
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
            onClick={onSave}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmpleadoModal;
