import React from "react";

function EmpleadoModal({ empleado, form, setForm, onClose, onSave }) {
    if (!empleado) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">Editar Empleado</h3>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        className="border rounded px-3 py-2"
                        value={form.nom_trab}
                        onChange={(e) => setForm({ ...form, nom_trab: e.target.value })}
                        placeholder="Nombre"
                    />
                    <input
                        className="border rounded px-3 py-2"
                        value={form.num_imss || ""}
                        onChange={(e) => setForm({ ...form, num_imss: e.target.value })}
                        placeholder="IMSS"
                    />
                    <input
                        className="border rounded px-3 py-2"
                        value={form.rfc || ""}
                        onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                        placeholder="RFC"
                    />
                    <input
                        className="border rounded px-3 py-2"
                        value={form.nom_depto || ""}
                        onChange={(e) => setForm({ ...form, nom_depto: e.target.value })}
                        placeholder="Departamento"
                    />
                    <input
                        className="border rounded px-3 py-2"
                        value={form.puesto || ""}
                        onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                        placeholder="Puesto"
                    />
                    <input
                        type="date"
                        className="border rounded px-3 py-2"
                        value={form.vencimiento_contrato || ""}
                        onChange={(e) =>
                            setForm({ ...form, vencimiento_contrato: e.target.value })
                        }
                    />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
