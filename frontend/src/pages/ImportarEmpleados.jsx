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
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Selecciona un archivo Excel primero");

    setLoading(true);
    setError(null);
    try {
      const resp = await importarExcel(file);
      alert(resp.message || "Importado correctamente");
      navigate("/empleados");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Error desconocido";
      setError(msg);
      alert("Error al importar: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/empleados");

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-indigo-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Importar Empleados
            </span>
          </h1>
          <p className="mt-2 text-slate-600">
            Selecciona un archivo <b>.xlsx</b> o <b>.xls</b> para cargar la plantilla.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)]">
          {/* Drop/select zone */}
          <div className="mb-6">
            <label
              htmlFor="fileInput"
              className="flex items-center gap-3 font-semibold text-slate-800 mb-3 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Seleccionar archivo Excel
            </label>

            <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5">
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
                           file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700
                           file:cursor-pointer cursor-pointer"
              />
              <p className="mt-2 text-xs text-slate-500">
                Asegúrate de que las columnas coincidan con la plantilla esperada.
              </p>
            </div>
          </div>

          {/* File selected */}
          {file && (
            <div className="mb-6 rounded-2xl border ring-1 ring-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-700 mt-[2px]" />
                <div className="text-sm">
                  <p className="text-emerald-800">
                    <b>Archivo seleccionado:</b> {file.name}
                  </p>
                  <p className="text-emerald-700/90">
                    <b>Tamaño:</b> {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <p className="text-emerald-700/90">
                    <b>Tipo:</b>{" "}
                    {file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border ring-1 ring-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-700 mt-[2px]" />
                <div className="text-sm text-rose-800">
                  <b>Error:</b> {error}
                </div>
              </div>
            </div>
          )}

          {/* Hint */}
          {!file && !loading && (
            <div className="mb-6 rounded-2xl border ring-1 ring-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Por favor, selecciona un archivo Excel (<b>.xlsx</b> o <b>.xls</b>) para continuar.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white
                          shadow transition active:scale-[0.98]
                          ${!file || loading
                            ? "bg-slate-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-md"}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar Excel
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold
                         ring-1 ring-slate-200 text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportarEmpleados;
