import { useState, useEffect } from "react";
import { obtenerEmpleados } from "../services/empleadosApi";
import EmpleadosTable from "../components/EmpleadosTable";
import { useNavigate } from "react-router-dom";

function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const fetchEmpleados = async (pageNumber = 1) => {
    try {
      const data = await obtenerEmpleados(pageNumber, limit);
      setEmpleados(data.empleados || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      alert("Error al cargar empleados");
    }
  };

  const handleImportClick = () => {
    navigate('/importar-empleados');
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
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

      <EmpleadosTable empleados={empleados} />

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
    </div>
  );
}

export default EmpleadosPage;