import { use, useEffect, useState } from "react";
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
        console.log("Empleado data:", res.data); //prueba
        setEmpleado(res.data);
      } catch (error) {
        console.error("Error cargando empleado:", error);
        setError(error.response?.data?.msg || "Error cargando informacion");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [token, API_URL]);

  //prueba
  useEffect(() => {
    if (empleado) {
      console.log("Empleado cargado:", empleado);
      console.log("Foto URL:", empleado.fotoUrl);
    }
  }, [empleado]);

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-96 p-4 text-center border-t-4 border-green-600">
        {/* FOTO */}
        <div className="border-4 border-gray-300 rounded-lg overflow-hidden mb-3">
          {!imagenError ? (
            <img
              src={empleado.fotoUrl}
              alt={empleado.nom_trab}
              className="w-full h-80 object-cover bg-gray-100"
              onError={() => setImagenError(true)}
            />
          ) : (
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-6xl"></span>
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
            Vigencia:{" "}
            {new Date(empleado.vencimiento_contrato).toLocaleDateString(
              "es-MX",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default CredencialPage;