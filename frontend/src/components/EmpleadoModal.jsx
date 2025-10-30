import React from "react";

function EmpleadoModal({ empleado, form, setForm, onClose, onSave }) {
  if (!empleado) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          ✏️ Editar Empleado
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.nom_trab}
            onChange={(e) => setForm({ ...form, nom_trab: e.target.value })}
            placeholder="Nombre"
          />
          <input
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.num_imss || ""}
            onChange={(e) => setForm({ ...form, num_imss: e.target.value })}
            placeholder="IMSS"
          />
          <input
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.rfc || ""}
            onChange={(e) => setForm({ ...form, rfc: e.target.value })}
            placeholder="RFC"
          />
          <input
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.nom_depto || ""}
            onChange={(e) => setForm({ ...form, nom_depto: e.target.value })}
            placeholder="Departamento"
          />
          <input
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.puesto || ""}
            onChange={(e) => setForm({ ...form, puesto: e.target.value })}
            placeholder="Puesto"
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.vencimiento_contrato || ""}
            onChange={(e) => {
              const value = e.target.value === "" ? null : e.target.value;
              setForm({ ...form, vencimiento_contrato: value });
            }}
            placeholder="Opcional"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            onClick={onSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmpleadoModal;
