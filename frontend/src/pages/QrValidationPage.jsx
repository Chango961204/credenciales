import { useState } from "react";
import { buscarEmpleadoPorQR } from "../services/empleadosApi";
import QrScanner from "../components/QrScanner";

function QrValidationPage() {
  const [empleado, setEmpleado] = useState(null);

  const handleScan = async (qrCode) => {
    try {
      const { data } = await buscarEmpleadoPorQR(qrCode);
      setEmpleado(data);
    } catch {
      setEmpleado({ error: "Empleado no encontrado o QR inválido" });
    }
  };

  return (
    <div>
      <h1>Validar Credencial</h1>
      <QrScanner onScan={handleScan} />

      {empleado && (
        <div>
          {empleado.error ? (
            <p style={{ color: "red" }}>{empleado.error}</p>
          ) : (
            <div>
              <p>{empleado.nom_trab}</p>
              <p>{empleado.activo ? "✅ Activo" : "❌ Inactivo"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QrValidationPage;
