import { useState } from "react";
import { importarExcel } from "../services/empleadosApi";
import { useNavigate } from "react-router-dom";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";

function ImportarEmpleados() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("📁 Archivo seleccionado:", selectedFile);

    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log("🔍 handleUpload iniciado");
    console.log("📁 Archivo en estado:", file);

    if (!file) {
      alert("Selecciona un archivo Excel primero");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📤 Enviando archivo al servidor...");
      const resp = await importarExcel(file);
      console.log("✅ Respuesta del servidor:", resp);

      alert(resp.message || "Importado correctamente");
      navigate('/empleados');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Error desconocido";
      setError(msg);
      alert("Error al importar: " + msg);
    } finally {
      setLoading(false);
      console.log("🏁 Proceso finalizado");
    }
  };

  const handleCancel = () => {
    navigate('/empleados');
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px" }}>

      <div style={{ marginBottom: "20px" }}>
        <p>Selecciona un archivo Excel para importar los datos de los empleados:</p>
      </div>

      <div style={{
        marginBottom: "20px", padding: "20px", border: "2px dashed #007bff", borderRadius: "8px", backgroundColor: "#f8f9fa"
      }}>
        <label htmlFor="fileInput" style={{
          display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontWeight: "bold", cursor: "pointer"
        }}
        >
          <FileSpreadsheet size={20} /> Seleccionar archivo Excel:
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={loading}
          style={{
            display: "block", width: "100%", padding: "10px", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer"
          }}
        />
      </div>

      {file && (
        <div style={{
          marginBottom: "20px", padding: "15px", backgroundColor: "#d4edda", borderRadius: "4px", border: "1px solid #c3e6cb", display: "flex", flexDirection: "column", gap: "8px"
        }}>
          <p style={{ margin: 0, color: "#155724", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={18} /> <strong>Archivo seleccionado:</strong> {file.name}
          </p>
          <p style={{ margin: 0, color: "#155724", paddingLeft: "26px" }}>
            <strong>Tamaño:</strong> {(file.size / 1024).toFixed(2)} KB
          </p>
          <p style={{ margin: 0, color: "#155724", paddingLeft: "26px" }}>
            <strong>Tipo:</strong> {file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
          </p>
        </div>
      )}

      {error && (
        <div style={{
          padding: "15px", backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", borderRadius: "4px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <AlertCircle size={18} />
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            padding: "12px 24px", backgroundColor: (!file || loading) ? "#ccc" : "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: (!file || loading) ? "not-allowed" : "pointer",
            opacity: (!file || loading) ? 0.6 : 1, fontSize: "16px", fontWeight: "bold", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "8px"
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              Importando...
            </>
          ) : (
            <>
              <Upload size={18} />
              Importar Excel
            </>
          )}
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: "12px 24px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px"
          }}
        >
          <X size={18} />
          Cancelar
        </button>
      </div>

      {!file && !loading && (
        <div style={{
          marginTop: "20px", padding: "15px", backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeaa7", borderRadius: "4px"
        }}>
          Por favor, selecciona un archivo Excel (.xlsx o .xls) para continuar
        </div>
      )}
    </div>
  );
}

export default ImportarEmpleados;