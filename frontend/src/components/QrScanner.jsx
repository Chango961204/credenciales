import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function QrScanner() {
  const [empleado, setEmpleado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      async (qrValue) => {
        try {
          // ✅ Si el QR contiene la URL, extraemos el uuid
          let uuid = qrValue;
          if (qrValue.includes("/qr/")) {
            uuid = qrValue.split("/qr/")[1]; 
          }

          const res = await fetch(`/api/empleados/qr/${uuid}`);
          if (!res.ok) throw new Error("QR inválido o no encontrado");

          const data = await res.json();
          setEmpleado(data);
          setError(null);
        } catch (err) {
          setError(err.message);
          setEmpleado(null);
        }
      },
      (err) => {
        console.warn("Error de escaneo:", err);
      }
    );

    return () => {
      scanner.clear().catch((e) => console.error("Error al limpiar scanner:", e));
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Escaneo de QR</h2>
      <div id="reader" style={{ width: "300px", margin: "auto" }}></div>

      {empleado ? (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <h3>Datos del Empleado</h3>
          <p><strong>Número de trabajador:</strong> {empleado.num_trab}</p>
          <p><strong>Nombre:</strong> {empleado.nombre}</p>
          <p><strong>Vencimiento contrato:</strong> {empleado.vencimiento}</p>
          <p><strong>Estado:</strong> {empleado.estado}</p>
        </div>
      ) : (
        <p style={{ marginTop: "20px" }}>Escanea un QR...</p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>⚠️ {error}</p>
      )}
    </div>
  );
}

export default QrScanner;
