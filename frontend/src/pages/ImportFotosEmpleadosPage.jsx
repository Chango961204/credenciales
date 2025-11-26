import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { importarFotosZip } from "../services/empleadosApi";
import {
    Upload,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
    X,
    Loader2,
    RefreshCcw,
    Trash2,
} from "lucide-react";

function ImportarFotosEmpleados() {
    const [file, setFile] = useState(null);
    const [overwrite, setOverwrite] = useState(false); // default: solo faltantes
    const [deleteSource, setDeleteSource] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [report, setReport] = useState(null);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setReport(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Selecciona un archivo ZIP primero");

        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const resp = await importarFotosZip(file, { overwrite, deleteSource });
            setReport(resp);
            alert(resp.message || "Fotos importadas/sincronizadas");
            // si quieres, puedes navegar:
            // navigate("/empleados");
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || "Error desconocido";
            setError(msg);
            alert("Error al importar fotos: " + msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate("/empleados");

    return (
        <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-indigo-50 to-white">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                            Importar Fotos
                        </span>
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Sube un archivo <b>.zip</b> con fotos nombradas por <b>num_trab</b> (ej. <code>12345.jpg</code>).
                    </p>
                </div>

                <div className="rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)]">
                    {/* Archivo */}
                    <div className="mb-6">
                        <label
                            htmlFor="zipInput"
                            className="flex items-center gap-3 font-semibold text-slate-800 mb-3 cursor-pointer"
                        >
                            <ImageIcon className="w-5 h-5 text-indigo-600" />
                            Seleccionar ZIP de fotos
                        </label>

                        <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5">
                            <input
                                id="zipInput"
                                type="file"
                                accept=".zip,application/zip,application/x-zip-compressed"
                                onChange={handleFileChange}
                                disabled={loading}
                                className="block w-full text-sm text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
                           file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700
                           file:cursor-pointer cursor-pointer"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Tip: puedes incluir .jpg/.png. El sistema las renombra a <b>num_trab.png</b>.
                            </p>
                        </div>
                    </div>

                    {/* Opciones */}
                    <div className="mb-6 grid gap-3">
                        <label className="flex items-start gap-3 rounded-2xl border ring-1 ring-slate-200 bg-white p-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={overwrite}
                                onChange={(e) => setOverwrite(e.target.checked)}
                                disabled={loading}
                                className="mt-1 h-4 w-4"
                            />
                            <div className="text-sm text-slate-700">
                                <div className="font-semibold flex items-center gap-2">
                                    <RefreshCcw className="w-4 h-4" />
                                    Reemplazar fotos existentes (overwrite)
                                </div>
                                <p className="text-slate-500">
                                    Si está desactivado, <b>solo asigna fotos a empleados que aún no tienen foto</b>.
                                </p>
                            </div>
                        </label>

                       {/*  <label className="flex items-start gap-3 rounded-2xl border ring-1 ring-slate-200 bg-white p-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={deleteSource}
                                onChange={(e) => setDeleteSource(e.target.checked)}
                                disabled={loading}
                                className="mt-1 h-4 w-4"
                            />
                            <div className="text-sm text-slate-700">
                                <div className="font-semibold flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Borrar archivos temporales después de procesar
                                </div>
                                <p className="text-slate-500">
                                </p>
                            </div>
                        </label> */}
                    </div>

                    {/* Archivo seleccionado */}
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
                                        <b>Tipo:</b> {file.type || "application/zip"}
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

                    {/* Reporte */}
                    {report && (
                        <div className="mb-6 rounded-2xl border ring-1 ring-indigo-200 bg-indigo-50 p-4">
                            <div className="text-sm text-indigo-900">
                                <p className="font-semibold">Resultado</p>
                                <ul className="mt-2 space-y-1">
                                    <li><b>Total archivos:</b> {report.totalArchivos ?? "-"}</li>
                                    <li><b>Actualizadas:</b> {report.actualizadas ?? "-"}</li>
                                    <li><b>Omitidas (ya tenían foto):</b> {report.omitidasPorYaTenerFoto?.length ?? 0}</li>
                                    <li><b>Sin empleado:</b> {report.sinEmpleado?.length ?? 0}</li>
                                    <li><b>Errores:</b> {report.errores?.length ?? 0}</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Acciones */}
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
                                    Importar Fotos
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

export default ImportarFotosEmpleados;
