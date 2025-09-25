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
    scanner.render(onScanSuccess, (err) => console.warn("Error escaneo:", err));

    return () => scanner.clear(); // limpiar al desmontar
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Escanear credencial</h2>
      <div id="reader" className="w-full max-w-md mx-auto"></div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {empleado && (
        <div className="mt-4 p-4 border rounded shadow bg-white">
          <h3 className="text-lg font-bold mb-2">{empleado.nom_trab}</h3>
          <p><strong>Número:</strong> {empleado.num_trab}</p>
          <p><strong>IMSS:</strong> {empleado.num_imss || "N/A"}</p>
          <p><strong>RFC:</strong> {empleado.rfc || "N/A"}</p>
          <p><strong>Departamento:</strong> {empleado.nom_depto || "N/A"}</p>
          <p><strong>Puesto:</strong> {empleado.puesto || "N/A"}</p>
          <p><strong>Vencimiento:</strong> {empleado.vencimiento_contrato || "N/A"}</p>
          <p>
            <strong>Estatus:</strong>{" "}
            <span
              className={
                empleado.estado_qr === "activo"
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {empleado.estado_qr}
            </span>
          </p>

          {empleado.fotoUrl && (
            <img
              src={empleado.fotoUrl}
              alt="Foto del empleado"
              className="mt-3 w-32 h-32 object-cover rounded border"
            />
          )}
        </div>
      )}
    </div>
  );
}
