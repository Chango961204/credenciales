import { useState } from "react";
import { importarExcel } from "../services/empleadosApi";
import { useNavigate } from "react-router-dom";

function ImportarEmpleados() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un archivo Excel primero");
    
    setLoading(true);
    try {
      const resp = await importarExcel(file);
      alert(resp.message || "Importado correctamente");
      // Redirigir a la página de empleados después de importar
      navigate('/empleados');
    } catch (err) {
      console.error("Error al subir Excel:", err);
      const msg =
        err?.response?.data?.message || err.message || "Error desconocido";
      alert("Error al importar: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/empleados');
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Importar Empleados desde Excel</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <p>Selecciona un archivo Excel para importar los datos de empleados:</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input 
          type="file" 
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Importando..." : "Importar Excel"}
        </button>
        
        <button 
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          Cancelar
        </button>
      </div>

      {file && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
          <p><strong>Archivo seleccionado:</strong> {file.name}</p>
          <p><strong>Tamaño:</strong> {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
    </div>
  );
}

export default ImportarEmpleados;