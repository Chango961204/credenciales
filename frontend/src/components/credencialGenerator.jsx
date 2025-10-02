import { useState } from "react";
import axios from "axios";

export default function CredencialGenerator({ empleadoId }) {
  const [imgs, setImgs] = useState(null);
  const [loading, setLoading] = useState(false);

  const normalizeSrc = (val) => {
    if (!val) return null;
    if (typeof val !== "string") return null;

    const s = val.trim();

    if (s.startsWith("data:")) return s;

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
        alert("Permite popups para poder ver la vista previa");
        return;
      }

      w.document.write(
        `<html>
          <head>
            <title>Vista previa - Credencial</title>
            <style>
              html,body{height:100%;margin:0;background:#f3f4f6;display:flex;align-items:center;justify-content:center}
              img{max-width:95vw;max-height:95vh;box-shadow:0 8px 24px rgba(0,0,0,0.15);border-radius:8px}
            </style>
          </head>
          <body>
            <img src="${finalUrl}" alt="Credencial" />
          </body>
        </html>`
      );
      w.document.close();

      // Revocar objectURL pasado 30s si hicimos uno
      if (src.startsWith("data:")) {
        setTimeout(() => URL.revokeObjectURL(finalUrl), 30000);
      }
    } catch (err) {
      console.error("Error mostrando preview:", err);
      alert("No se pudo mostrar la vista previa: " + err.message);
    }
  };

  const handlePrint = (imgSrc) => {
    (async () => {
      try {
        const src = normalizeSrc(imgSrc);
        if (!src) throw new Error("Fuente inválida para imprimir");
        let finalUrl = src;
        if (src.startsWith("data:")) {
          const r = await fetch(src);
          const blob = await r.blob();
          finalUrl = URL.createObjectURL(blob);
        }
        const w = window.open("", "_blank");
        if (!w) return alert("Permite popups para imprimir");
        w.document.write(`<html><head><title>Imprimir</title></head><body style="margin:0"><img src="${finalUrl}" style="width:100%;height:auto" onload="window.print();"></body></html>`);
        w.document.close();
        if (src.startsWith("data:")) setTimeout(() => URL.revokeObjectURL(finalUrl), 30000);
      } catch (err) {
        console.error("Error imprimir:", err);
        alert("No se pudo imprimir: " + err.message);
      }
    })();
  };

  const handleDownload = (imgSrc, filename = "credencial.png") => {
    const src = normalizeSrc(imgSrc);
    if (!src) return alert("No hay imagen para descargar");
    const a = document.createElement("a");
    if (src.startsWith("data:")) {
      a.href = src;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    a.href = src;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/empleados/${empleadoId}/credencial`);
      console.log("Respuesta credencial backend:", res.data);

      const data = res.data || {};
      const candidates = {
        frente: data.frenteUrl ?? data.frente ?? data.frenteData ?? data.frenteBase64,
        reverso: data.reversoUrl ?? data.reverso ?? data.reversoData ?? data.reversoBase64,
      };

      const frenteNorm = normalizeSrc(candidates.frente);
      const reversoNorm = normalizeSrc(candidates.reverso);

      setImgs({ frente: frenteNorm, reverso: reversoNorm });

      if (!frenteNorm && !reversoNorm) {
        alert("El servidor no devolvió imágenes válidas. Revisa la consola (res.data).");
      }
    } catch (err) {
      console.error("Error generando credencial:", err);
      alert("Error generando credencial: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
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
        <div className="mt-3 flex gap-6 justify-center">
          <div className="flex flex-col items-center">
            <img
              src={imgs.frente || ""}
              alt="frente"
              className="w-80 h-48 object-contain rounded-lg shadow-md border"
            />
            <div className="mt-2 flex gap-2">
              <button onClick={() => openPreviewWindow(imgs.frente)} className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300">Visualizar</button>
              <button onClick={() => handlePrint(imgs.frente)} className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700">Imprimir</button>
              <button onClick={() => handleDownload(imgs.frente, "credencial_frente.png")} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Descargar</button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <img
              src={imgs.reverso || ""}
              alt="reverso"
              className="w-80 h-48 object-contain rounded-lg shadow-md border"
            />
            <div className="mt-2 flex gap-2">
              <button onClick={() => openPreviewWindow(imgs.reverso)} className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300">Visualizar</button>
              <button onClick={() => handlePrint(imgs.reverso)} className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700">Imprimir</button>
              <button onClick={() => handleDownload(imgs.reverso, "credencial_reverso.png")} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Descargar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
