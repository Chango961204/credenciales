import { useState } from "react";
import BuscarForm from "../components/BuscarForm";
import EmpleadoCard from "../components/EmpleadoCard";
import useEmpleados from "../../hooks/useEmpleados";
import { Search } from "lucide-react";

export default function BuscarEmpleadosPage() {
  const {
    resultados,
    loading,
    error,
    qrData,
    qrEmpleadoId,
    handleSearch,
    handleGenerate,
    handleUpdate,
    setResultados,
    setQrEmpleadoId,
    setError,
  } = useEmpleados();

  const [modalEmpleadoId, setModalEmpleadoId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const openModal = (emp) => {
    if (!emp) return setModalEmpleadoId(null);
    setModalEmpleadoId(emp.id);
    setEditForm({
      ...emp,
      vencimiento_contrato: emp.vencimiento_contrato?.split("T")[0] || "",
    });
  };

  const handleSave = async () => {
    try {
      await handleUpdate(editForm);
      if (qrEmpleadoId === editForm.id) {
        await handleGenerate(editForm.id);
      }
      setModalEmpleadoId(null);
    } catch {
      setError("Error al actualizar empleado");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl grid place-items-center bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
              Buscar Empleados
            </span>
          </h2>
        </div>

        {/* Card: filtros */}
        <div className="mb-6 rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)] p-5 md:p-6 transition hover:shadow-[0_16px_40px_-12px_rgba(2,6,23,0.2)]">
          <BuscarForm onSearch={handleSearch} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border ring-1 ring-rose-200 bg-rose-50 p-4 text-rose-800">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            className="flex items-center gap-2 text-slate-700 mb-4"
            role="status"
            aria-live="polite"
          >
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Buscando empleados…</span>
          </div>
        )}

        {/* Resultados */}
        {Array.isArray(resultados) && resultados.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-semibold text-slate-800">
              <span className="text-sky-700">{resultados.length}</span> empleado(s) encontrado(s)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {resultados.map((emp, index) => (
                <EmpleadoCard
                  key={emp.id || index}
                  emp={emp}
                  qrEmpleadoId={qrEmpleadoId}
                  qrData={qrData}
                  onGenerate={handleGenerate}
                  onEdit={openModal}
                  onCloseQr={() => setQrEmpleadoId(null)}
                  modalEmpleadoId={modalEmpleadoId}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSave={handleSave}
                  setResultados={setResultados}
                />
              ))}
            </div>
          </div>
        ) : (
          !loading && (
            <p className="text-center text-slate-500 mt-8">
              No se encontraron empleados.
            </p>
          )
        )}
      </div>
    </div>
  );
}
