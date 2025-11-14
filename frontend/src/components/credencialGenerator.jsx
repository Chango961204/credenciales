import { useState } from "react";
import axios from "axios";

export default function CredencialGenerator({ empleadoId }) {
  const [imgs, setImgs] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const normalizeSrc = (val) => {
    if (!val || typeof val !== "string") return null;

    const s = val.trim();
    if (s.startsWith("data:")) return s; // base64
    if (/^https?:\/\//i.test(s) || s.startsWith("/")) return s; 

    const cleaned = s.replace(/\s+/g, "");
    if (/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
      return `data:image/png;base64,${cleaned}`;
    }

    return s;
  };

  const openPreviewWindow = async (imgSrc) => {
    try {
      const src = normalizeSrc(imgSrc);
      if (!src) throw new Error("Fuente de imagen inválida");

      let finalUrl = src;
      if (src.startsWith("data:")) {
        const r = await fetch(src);
        const blob = await r.blob();
        finalUrl = URL.createObjectURL(blob);
      }

      const w = window.open("", "_blank");
      if (!w) {
        alert("Permite popups para ver la vista previa");
        return;
      }

      w.document.write(`
        <html>
          <head>
            <title>Vista previa - Credencial</title>
            <style>
              html,body{height:100%;margin:0;background:#f3f4f6;
              display:flex;align-items:center;justify-content:center}
              img{max-width:95vw;max-height:95vh;
              box-shadow:0 8px 24px rgba(0,0,0,0.15);border-radius:8px}
            </style>
          </head>
          <body>
            <img src="${finalUrl}" alt="Credencial" />
          </body>
        </html>
      `);
      w.document.close();

      if (src.startsWith("data:")) {
        setTimeout(() => URL.revokeObjectURL(finalUrl), 30000);
      }
    } catch (err) {
      console.error("Error mostrando preview:", err);
      alert("No se pudo mostrar la vista previa: " + err.message);
    }
  };

  const handleGenerate = async () => {
    if (!empleadoId) {
      alert("No se proporcionó el ID del empleado");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/empleados/${empleadoId}/credencial`);
      console.log("Respuesta credencial backend:", res.data);

      const data = res.data || {};

      const frente =
        data.frenteUrl || data.frenteDataUrl || data.frente || data.frenteBase64;
      const reverso =
        data.reversoUrl || data.reversoDataUrl || data.reverso || data.reversoBase64;

      const frenteNorm = normalizeSrc(frente);
      const reversoNorm = normalizeSrc(reverso);

      if (!frenteNorm || !reversoNorm) {
        throw new Error("El servidor no devolvió las imágenes de la credencial");
      }

      // ✅ Guardar imágenes en estado
      setImgs({ frente: frenteNorm, reverso: reversoNorm });
      console.log("✅ Credencial generada correctamente");

    } catch (err) {
      console.error("Error generando credencial:", err);
      alert("Error generando credencial: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enviar ambas imágenes a impresión
  const handlePrintDoubleSided = async () => {
    if (!imgs?.frente || !imgs?.reverso) {
      alert("Genera primero ambas imágenes (frente y reverso)");
      return;
    }

    try {
      await axios.post(`${API_URL}/impresion`, {
        frente: imgs.frente,
        reverso: imgs.reverso,
      });
      alert("Impresión doble cara enviada correctamente");
    } catch (err) {
      console.error("Error imprimiendo doble cara:", err);
      alert("Error imprimiendo doble cara: " + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-3">
      <button
        onClick={handleGenerate}
        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? "Generando..." : "Generar credencial"}
      </button>

      {imgs && (
        <>
          <div className="mt-3 flex gap-6 justify-center">
            {["frente", "reverso"].map((lado) => (
              <div key={lado} className="flex flex-col items-center">
                <img
                  src={imgs[lado] || ""}
                  alt={lado}
                  className="w-80 h-48 object-contain rounded-lg shadow-md border"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => openPreviewWindow(imgs[lado])}
                    className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300"
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = imgs[lado];
                      a.download = `credencial_${lado}.png`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={handlePrintDoubleSided}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
            >
              Imprimir ambos lados
            </button>
          </div>
        </>
      )}
    </div>
  );
}
