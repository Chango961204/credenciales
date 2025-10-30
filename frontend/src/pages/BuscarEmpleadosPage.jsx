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
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-tight">
        <Search className="text-blue-600 w-10 h-10 mb-1 group-hover:scale-110 transition-transform" /> Buscar Empleados
      </h2>

      <div className="bg-white shadow-md rounded-xl p-5 mb-6 transition hover:shadow-lg">
        <BuscarForm onSearch={handleSearch} />
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <strong className="font-semibold">Error: </strong> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Buscando empleados...</span>
        </div>
      )}

      {Array.isArray(resultados) && resultados.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-green-600 mb-3">
            {resultados.length} empleado(s) encontrado(s)
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
          <p className="text-center text-gray-500 mt-6">
            No se encontraron empleados.
          </p>
        )
      )}
    </div>
  );
}
