import { useState } from "react";
import { actualizarEstadoEmpleado } from "../services/empleadosApi";
import { Check, X } from "lucide-react";

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
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none shadow-md ${
        estado === "activo" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <span
        className={`absolute left-1 inline-flex items-center justify-center w-6 h-6 transform rounded-full bg-white shadow transition-transform duration-300 ${
          estado === "activo" ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {estado === "activo" ? (
          <Check size={16} className="text-green-600" />
        ) : (
          <X size={16} className="text-red-600" />
        )}
      </span>
    </button>
  );
}

export default EstadoToggle;
