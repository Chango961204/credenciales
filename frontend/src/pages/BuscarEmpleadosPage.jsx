import { useState } from "react";
import BuscarForm from "../components/BuscarForm";
import EmpleadoCard from "../components/EmpleadoCard";
import useEmpleados from "../../hooks/useEmpleados";
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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Buscar Empleados</h2>

      <BuscarForm onSearch={handleSearch} />

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

      {loading && <p className="text-gray-500">Buscando...</p>}

      {resultados.length > 0 && (
        <div>
          <h3 className="text-green-600 mb-3 font-semibold">
            {resultados.length} empleado(s) encontrado(s)
          </h3>
          {resultados.map((emp) => (
            <EmpleadoCard
              key={emp.id}
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
      )}
    </div>
  );
}
