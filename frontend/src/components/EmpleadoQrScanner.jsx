import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function EmpleadoQrScanner() {
  const [empleado, setEmpleado] = useState(null);
  const [error, setError] = useState(null);

  const fetchEmpleado = async (id) => {
    try {
      const res = await fetch(`/api/empleados/${id}`);
      if (!res.ok) throw new Error("Empleado no encontrado");
      const data = await res.json();
      setEmpleado(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const onScanSuccess = (decodedText) => {
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.id) {
        fetchEmpleado(parsed.id);
      } else {
        setError("El QR no contiene un ID válido");
      }
    } catch (err) {
      setError("Formato de QR inválido");
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });
    scanner.render(onScanSuccess, (err) =>
      console.warn("Error escaneo:", err)
    );

    return () => scanner.clear();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Título principal */}
      <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
        Escanear Credencial
      </h2>

      <div
        id="reader"
        className="w-full max-w-md mx-auto border-2 border-green-400 rounded-xl shadow-md overflow-hidden"
      ></div>

      {error && (
        <p className="text-red-500 mt-4 text-center font-medium">{error}</p>
      )}

      {empleado && (
        <div className="mt-6 p-6 border rounded-xl shadow-lg bg-white">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
            {empleado.nom_trab}
          </h3>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
            <p>
              <span className="font-semibold">Número:</span>{" "}
              {empleado.num_trab}
            </p>
            <p>
              <span className="font-semibold">IMSS:</span>{" "}
              {empleado.num_imss || "N/A"}
            </p>
            <p>
              <span className="font-semibold">RFC:</span>{" "}
              {empleado.rfc || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Departamento:</span>{" "}
              {empleado.nom_depto || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Puesto:</span>{" "}
              {empleado.puesto || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Vencimiento:</span>{" "}
              {empleado.vencimiento_contrato || "N/A"}
            </p>
            <p className="col-span-2">
              <span className="font-semibold">Estatus:</span>{" "}
              <span
                className={
                  empleado.estado_qr === "activo"
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {empleado.estado_qr}
              </span>
            </p>
          </div>

          {empleado.fotoUrl && (
            <div className="flex justify-center mt-6">
              <img
                src={empleado.fotoUrl}
                alt="Foto del empleado"
                className="w-32 h-32 object-cover rounded-full border-4 border-green-500 shadow-md"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
