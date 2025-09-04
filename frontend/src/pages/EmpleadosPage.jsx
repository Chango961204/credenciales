import { useState, useEffect } from "react";
import { importarExcel, obtenerEmpleados } from "../services/empleadosApi";
import EmpleadosTable from "../components/EmpleadosTable";

function EmpleadosPage() {
  const [file, setFile] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // puedes hacerlo configurable

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un archivo Excel primero");
    try {
      const resp = await importarExcel(file);
      alert(resp.message || "Importado ok");
      fetchEmpleados();
    } catch (err) {
      console.error("Error al subir Excel:", err);
      const msg =
        err?.response?.data?.message || err.message || "Error desconocido";
      alert("Error al importar: " + msg);
    }
  };

  const fetchEmpleados = async (pageNumber = 1) => {
    const data = await obtenerEmpleados(pageNumber, limit);
    setEmpleados(data.empleados || []); // 👈 aseguramos array
    setTotal(data.total || 0);
    setPage(data.page || 1);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestión de Empleados</h1>

      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          Importar Excel
        </button>
      </div>

      <EmpleadosTable empleados={empleados} />

      {/* Controles de paginación */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => fetchEmpleados(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 10px" }}>
          Página {page} de {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => fetchEmpleados(page + 1)}
          disabled={page >= Math.ceil(total / limit)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default EmpleadosPage;
