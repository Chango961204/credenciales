import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CredencialPage = () => {
  const { token } = useParams();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenError, setImagenError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  
  

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        const res = await axios.get(`${API_URL}/empleados/token/${token}`);
/*         console.log("Empleado data:", res.data);
 */        setEmpleado(res.data);
      } catch (error) {
        console.error("Error cargando empleado:", error);
        setError(error.response?.data?.msg || "Error cargando informacion");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [token, API_URL]);

  const normalizeFotoUrl = (url) => {
    if (!url) return null;
    const raw = url.trim();

    if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) {
      return raw;
    }

    if (/^[a-z0-9.-]+\/.+/i.test(raw)) {
      return `${window.location.protocol}//${raw}`;
    }

    return `${window.location.origin.replace(/\/$/, "")}/${raw.replace(
      /^\/+/,
      ""
    )}`;
  };

  const formatVigencia = (value) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [, y, m, d] = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return `${d}/${m}/${y}`;
    }

    try {
      const d = new Date(value);
      if (isNaN(d)) return value;

      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return value;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600 font-semibold">
          Cargando credencial...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-600 font-semibold">{error}</p>
      </div>
    );

  if (!empleado)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-600 font-semibold">
          Empleado no encontrado
        </p>
      </div>
    );

  const fotoSrc = normalizeFotoUrl(empleado.fotoUrl);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-96 p-4 text-center border-t-4 border-green-600">
        {/* FOTO */}
        <div className="border-4 border-gray-300 rounded-lg overflow-hidden mb-3">
          {!imagenError && fotoSrc ? (
            <img
              src={fotoSrc}
              alt={empleado.nom_trab}
              className="w-full h-80 object-cover bg-gray-100"
              onError={() => setImagenError(true)}
            />
          ) : (
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Foto no disponible</span>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 uppercase mb-2">
          {empleado.nom_trab}
        </h2>

        <p className="text-sm text-gray-700 mb-1 font-semibold uppercase">
          {empleado.nom_depto || "Sin departamento"}
        </p>

        <p className="text-sm text-gray-700 mb-1 uppercase">
          {empleado.puesto || "Sin puesto"}
        </p>

        <p className="text-sm text-gray-500 font-mono mb-3">
          {empleado.num_trab}
        </p>

        <div className="flex justify-center items-center gap-2 mt-3 text-green-600 font-semibold text-lg">
          <span>{empleado.estado_qr?.toUpperCase() || "ACTIVO"}</span>
        </div>

        {empleado.vencimiento_contrato && (
          <p className="text-xs text-gray-500 mt-2">
            Vigencia: {formatVigencia(empleado.vencimiento_contrato)}
          </p>
        )}
      </div>
    </div>
  );
};

export default CredencialPage;
