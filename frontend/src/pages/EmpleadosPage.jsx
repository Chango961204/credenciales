import { useState, useEffect } from "react";
import { obtenerEmpleados, updateEmpleado, buscarEmpleados } from "../services/empleadosApi";
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
    if (e.key === 'Enter') handleBuscar();
  };

  const handleImportClick = () => {
    navigate('/importar-empleados');
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
    <div style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Gestión de Empleados</h1>
        <button 
          onClick={handleImportClick}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Importar Excel
        </button>
      </div>

      <div style={{ 
        marginBottom: "20px", 
        padding: "15px", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "5px" 
      }}>
        <h4 style={{ marginBottom: "10px" }}>Buscar Empleados</h4>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="Número de empleado"
            value={numTrab}
            onChange={(e) => setNumTrab(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              minWidth: "150px"
            }}
          />
          
          <input
            placeholder="Nombre del empleado"
            value={nombreEmpleado}
            onChange={(e) => setNombreEmpleado(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              minWidth: "200px"
            }}
          />
          
          <button
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: loading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          
          <button
            onClick={handleLimpiarBusqueda}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Ver Todos
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "10px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      {esBusqueda && (
        <div style={{
          padding: "10px",
          backgroundColor: "#d1ecf1",
          color: "#0c5460",
          border: "1px solid #bee5eb",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          Resultados de búsqueda ({empleados.length} encontrados)
        </div>
      )}

      <EmpleadosTable empleados={empleados} onEdit={handleEditClick} />

      {!esBusqueda && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => fetchEmpleados(page - 1)}
            disabled={page <= 1}
            style={{
              padding: "8px 16px",
              backgroundColor: page <= 1 ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page <= 1 ? "not-allowed" : "pointer"
            }}
          >
            Anterior
          </button>
          
          <span style={{ margin: "0 15px", fontWeight: "bold" }}>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          
          <button
            onClick={() => fetchEmpleados(page + 1)}
            disabled={page >= Math.ceil(total / limit)}
            style={{
              padding: "8px 16px",
              backgroundColor: page >= Math.ceil(total / limit) ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page >= Math.ceil(total / limit) ? "not-allowed" : "pointer"
            }}
          >
            Siguiente
          </button>
        </div>
      )}

          </div>
  );
}

export default EmpleadosPage;