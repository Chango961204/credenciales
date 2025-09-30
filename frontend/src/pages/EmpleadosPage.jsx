import { useState, useEffect } from "react";
import {
  obtenerEmpleados,
  updateEmpleado,
  buscarEmpleados,
} from "../services/empleadosApi";
import EmpleadosTable from "../components/EmpleadosTable";
import { useNavigate } from "react-router-dom";

function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

  const [numTrab, setNumTrab] = useState("");
  const [nombreEmpleado, setNombreEmpleado] = useState("");
  const [esBusqueda, setEsBusqueda] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchEmpleados = async (pageNumber = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerEmpleados(pageNumber, limit);
      setEmpleados(data.empleados || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setEsBusqueda(false);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      setError("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    if (!numTrab.trim() && !nombreEmpleado.trim()) {
      setError("Ingresa al menos un criterio de búsqueda");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resultados = await buscarEmpleados({
        num_trab: numTrab.trim() || undefined,
        nombre: nombreEmpleado.trim() || undefined,
      });

      setEmpleados(resultados);
      setEsBusqueda(true);

      if (resultados.length === 0) {
        setError("No se encontraron empleados");
      }
    } catch (error) {
      console.error("Error buscando empleados:", error);
      setError("Error al buscar empleados");
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarBusqueda = () => {
    setNumTrab("");
    setNombreEmpleado("");
    setError("");
    setEsBusqueda(false);
    fetchEmpleados(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  const handleImportClick = () => {
    navigate("/importar-empleados");
  };

  const handleEditClick = (empleado) => {
    setSelectedEmpleado(empleado);
  };

  const handleSaveEmpleado = async (empleadoActualizado) => {
    try {
      await updateEmpleado(empleadoActualizado.id, empleadoActualizado);
      setSelectedEmpleado(null);

      if (esBusqueda) {
        handleBuscar();
      } else {
        fetchEmpleados(page);
      }
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      alert("Error al actualizar empleado");
    }
  };

  const handleCloseModal = () => {
    setSelectedEmpleado(null);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          👨‍💼 Gestión de Empleados
        </h1>
        <button
          onClick={handleImportClick}
          className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md 
                     hover:bg-green-700 transition transform hover:scale-105"
        >
          📥 Importar Excel
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">
          🔍 Buscar Empleados
        </h4>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            placeholder="Número de empleado"
            value={numTrab}
            onChange={(e) => setNumTrab(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-3 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            placeholder="Nombre del empleado"
            value={nombreEmpleado}
            onChange={(e) => setNombreEmpleado(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-3 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleBuscar}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
            }`}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          <button
            onClick={handleLimpiarBusqueda}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium 
                       hover:bg-gray-700 hover:scale-105 transition"
          >
            Ver Todos
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {esBusqueda && (
        <div className="mb-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded">
          Resultados de búsqueda ({empleados.length} encontrados)
        </div>
      )}

      {/* Tabla de empleados */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <EmpleadosTable empleados={empleados} onEdit={handleEditClick} />
      </div>

      {/* Paginación */}
      {!esBusqueda && (
        <div className="mt-6 flex justify-center items-center gap-3">
          <button
            onClick={() => fetchEmpleados(page - 1)}
            disabled={page <= 1}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              page <= 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
            }`}
          >
            Anterior
          </button>
          <span className="font-semibold text-gray-700">
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => fetchEmpleados(page + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              page >= Math.ceil(total / limit)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default EmpleadosPage;
