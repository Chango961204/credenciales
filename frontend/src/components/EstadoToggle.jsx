import { useState } from "react";
import { actualizarEstadoEmpleado } from "../services/empleadosApi";

function EstadoToggle({ empleado, onQrUpdate }) {
  const [estado, setEstado] = useState(empleado.estado_qr);

  const handleToggle = async () => {
    const nuevoEstado = estado === "activo" ? "inactivo" : "activo";
    try {
      await actualizarEstadoEmpleado(empleado.id, nuevoEstado);
      setEstado(nuevoEstado);

      if (onQrUpdate) {
        onQrUpdate({ ...empleado, estado_qr: nuevoEstado });
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  return (
    <div className="mt-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="text-sm">Estado QR:</span>
        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded text-white ${
            estado === "activo"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {estado === "activo" ? "Activo" : "Inactivo"}
        </button>
      </label>
    </div>
  );
}

export default EstadoToggle;
