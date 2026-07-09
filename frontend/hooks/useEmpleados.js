import { useState } from "react";
import {
  buscarEmpleados,
  generarQr,
  getEmpleadoById,
  updateEmpleado,
} from "../src/services/empleadosApi";

export function useEmpleados() {
  const [resultados, setResultados] = useState([]); // 🔹 Siempre un arreglo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrData, setQrData] = useState({});
  const [qrEmpleadoId, setQrEmpleadoId] = useState(null);

  const handleSearch = async (num, nombre) => {
    if (!num && !nombre) {
      setError("Ingresa al menos un criterio de búsqueda");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await buscarEmpleados({ num_trab: num, nombre });

      const empleados = Array.isArray(res)
        ? res
        : res
        ? [res]
        : [];

      if (empleados.length === 0) {
        setResultados([]);
        setError("No se encontraron empleados");
        return;
      }

      const empleadosConDetalle = await Promise.all(
        empleados.map(async (emp) => {
          if (!emp?.id) return emp;

          try {
            const detalle = await getEmpleadoById(emp.id);
            return { ...emp, ...detalle };
          } catch (error) {
            console.error("Error cargando detalle del empleado:", error);
            return emp;
          }
        })
      );

      setResultados(empleadosConDetalle);
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setError("Error al buscar empleados");
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (id) => {
    try {
      const data = await generarQr(id);

      if (!data || !data.empleado) {
        throw new Error("Respuesta inválida al generar QR");
      }

      setQrData((prev) => ({ ...prev, [id]: data }));
      setResultados((prev) =>
        Array.isArray(prev)
          ? prev.map((e) =>
              e.id === data.empleado.id ? { ...e, ...data.empleado } : e
            )
          : []
      );

      setQrEmpleadoId(id);
    } catch (error) {
      console.error("Error al generar QR:", error);
      setError("Error al generar el QR");
    }
  };

  // ✏️ Actualizar empleado
  const handleUpdate = async (form) => {
    try {
      await updateEmpleado(form.id, form);
      setResultados((prev) =>
        Array.isArray(prev)
          ? prev.map((emp) =>
              emp.id === form.id ? { ...emp, ...form } : emp
            )
          : []
      );
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      setError("Error al actualizar el empleado");
    }
  };

  return {
    resultados,
    loading,
    error,
    qrData,
    qrEmpleadoId,
    handleSearch,
    handleGenerate,
    handleUpdate,
    setResultados,
    setQrEmpleadoId,
    setError,
  };
}

export default useEmpleados;
