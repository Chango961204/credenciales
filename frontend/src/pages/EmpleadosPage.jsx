import { useState, useEffect } from "react";
import {
  obtenerEmpleados,
  updateEmpleado,
  buscarEmpleados,
} from "../services/empleadosApi";
import EmpleadosTable from "../components/EmpleadosTable";
import { useNavigate } from "react-router-dom";
import { Users, FilePlus2, Search } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Gestión de empleados
              </h1>
              <p className="text-sm text-slate-600">
                Consulta, busca y administra la información de los empleados.
              </p>
            </div>
          </div>

          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]"
          >
            <FilePlus2 className="h-5 w-5" />
            Importar desde Excel
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-6 rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-slate-200 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Buscar empleados
                </h4>
                <p className="text-xs text-slate-500">
                  Filtra por número de empleado o nombre.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              placeholder="Número de empleado"
              value={numTrab}
              onChange={(e) => setNumTrab(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <input
              placeholder="Nombre del empleado"
              value={nombreEmpleado}
              onChange={(e) => setNombreEmpleado(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={handleBuscar}
              disabled={loading}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                loading
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
            <button
              onClick={handleLimpiarBusqueda}
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-[0.98]"
            >
              Ver todos
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {esBusqueda && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Resultados de búsqueda ({empleados.length} encontrados)
          </div>
        )}

        {/* Tabla de empleados */}
        <div className="rounded-2xl bg-white/95 p-4 shadow-md ring-1 ring-slate-200 backdrop-blur">
          <EmpleadosTable
            empleados={empleados}
            onEdit={handleEditClick}
            selectedEmpleado={selectedEmpleado}
            onSave={handleSaveEmpleado}
            onClose={handleCloseModal}
          />
        </div>

        {/* Paginación */}
        {!esBusqueda && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <button
              onClick={() => fetchEmpleados(page - 1)}
              disabled={page <= 1}
              className={`rounded-xl px-4 py-2 font-medium transition ${
                page <= 1
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
              }`}
            >
              Anterior
            </button>
            <span className="text-slate-700">
              Página{" "}
              <span className="font-semibold text-slate-900">{page}</span> de{" "}
              <span className="font-semibold text-slate-900">
                {Math.ceil(total / limit) || 1}
              </span>
            </span>
            <button
              onClick={() => fetchEmpleados(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className={`rounded-xl px-4 py-2 font-medium transition ${
                page >= Math.ceil(total / limit)
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
              }`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmpleadosPage;
