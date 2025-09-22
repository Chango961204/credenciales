import { useState } from "react";
import {buscarEmpleados,generarQr,updateEmpleado,} from "../services/empleadosApi";
import EmpleadoModal from "../components/EmpleadoModal";
import EmpleadoQr from "../components/EmpleadoQr";
import EstadoToggle from "../components/EstadoToggle";

function formatDate(date) {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    if (isNaN(d)) return date;
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return date;
  }
}

function BuscarEmpleadosPage() {
  const [num, setNum] = useState("");
  const [nombre, setNombre] = useState("");
  const [resultados, setResultados] = useState([]);
  const [qrEmpleadoId, setQrEmpleadoId] = useState(null); // empleado que tiene QR abierto
  const [qrData, setQrData] = useState({}); // guarda QR por empleado
  const [modalEmpleadoId, setModalEmpleadoId] = useState(null); // empleado que tiene modal abierto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editForm, setEditForm] = useState({});

  const handleSearch = async () => {
    if (!num.trim() && !nombre.trim()) {
      return setError("Ingresa al menos un criterio de búsqueda");
    }

    setLoading(true);
    setError("");

    try {
      const res = await buscarEmpleados({
        num_trab: num.trim() || undefined,
        nombre: nombre.trim() || undefined,
      });

      setResultados(res);
      if (res.length === 0) setError("No se encontraron empleados");
    } catch {
      setError("Error al buscar empleados");
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (id) => {
    try {
      const data = await generarQr(id);
      setQrData((prev) => ({ ...prev, [id]: data }));
      setResultados((prev) =>
        prev.map((e) =>
          e.id === data.empleado.id ? { ...e, ...data.empleado } : e
        )
      );
      setQrEmpleadoId(id);
    } catch {
      setError("Error al generar el QR");
    }
  };

  const handleKeyPress = (e) => e.key === "Enter" && handleSearch();

  const limpiar = () => {
    setNum("");
    setNombre("");
    setResultados([]);
    setQrData({});
    setError("");
  };

  const openModal = (emp) => {
    setModalEmpleadoId(emp.id);
    setEditForm({
      ...emp,
      vencimiento_contrato: emp.vencimiento_contrato
        ? emp.vencimiento_contrato.split("T")[0]
        : "",
    });
  };

  const handleSave = async () => {
    try {
      await updateEmpleado(editForm.id, editForm);

      setResultados((prev) =>
        prev.map((emp) =>
          emp.id === editForm.id ? { ...emp, ...editForm } : emp
        )
      );

      if (qrEmpleadoId === editForm.id) {
        const newQr = await generarQr(editForm.id);
        setQrData((prev) => ({ ...prev, [editForm.id]: newQr }));
      }

      setModalEmpleadoId(null);
    } catch (err) {
      console.error("Error al actualizar:", err);
      setError("Error al actualizar empleado");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Buscar Empleados</h2>

      <div className="bg-gray-100 p-4 rounded-lg flex flex-wrap gap-3 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1 min-w-[150px]"
          placeholder="Número de empleado"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input
          className="border rounded px-3 py-2 flex-1 min-w-[200px]"
          placeholder="Nombre del empleado"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className={`px-4 py-2 rounded text-white ${loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
          onClick={limpiar}
        >
          Limpiar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {resultados.length > 0 && (
        <div>
          <h3 className="text-green-600 mb-3 font-semibold">
            {resultados.length} empleado(s) encontrado(s)
          </h3>
          {resultados.map((emp) => (
            <div
              key={emp.id}
              className="bg-white shadow p-4 rounded-lg mb-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-blue-600 mb-2">
                    {emp.nom_trab}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <strong>Número:</strong> {emp.num_trab}
                    </p>
                    <p>
                      <strong>IMSS:</strong> {emp.num_imss || "N/A"}
                    </p>
                    <p>
                      <strong>RFC:</strong> {emp.rfc || "N/A"}
                    </p>
                    <p>
                      <strong>Departamento:</strong> {emp.nom_depto || "N/A"}
                    </p>
                    <p>
                      <strong>Puesto:</strong> {emp.puesto || "N/A"}
                    </p>
                    <p>
                      <strong>Vencimiento:</strong>{" "}
                      {formatDate(emp.vencimiento_contrato)}
                    </p>

                    <EstadoToggle
                      empleado={emp}
                      onQrUpdate={(nuevoQr, empleadoActualizado) => {
                        setQrData((prev) => ({
                          ...prev,
                          [emp.id]: { ...prev[emp.id], qrCode: nuevoQr },
                        }));
                        setResultados((prev) =>
                          prev.map((e) =>
                            e.id === emp.id ? { ...e, ...empleadoActualizado } : e
                          )
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleGenerate(emp.id)}
                  >
                    Generar QR
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    onClick={() => openModal(emp)}
                  >
                    Editar
                  </button>
                </div>
              </div>

              {qrEmpleadoId === emp.id && (
                <EmpleadoQr
                  empleado={qrData[emp.id]?.empleado || emp}
                  onClose={() => setQrEmpleadoId(null)}
                />
              )}

              {modalEmpleadoId === emp.id && (
                <EmpleadoModal
                  empleado={emp}
                  form={editForm}
                  setForm={setEditForm}
                  onClose={() => setModalEmpleadoId(null)}
                  onSave={handleSave}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuscarEmpleadosPage;
