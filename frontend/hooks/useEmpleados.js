import { useState } from "react";
import { buscarEmpleados, generarQr, updateEmpleado } from "../src/services/empleadosApi";

export function useEmpleados() {
  const [resultados, setResultados] = useState([]);
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
      setResultados(res);
      if (res.length === 0) setError("No se encontraron empleados");
    } catch {
      setError("Error al buscar empleados");
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (id) => {
    try {
      const data = await generarQr(id);
      setQrData((prev) => ({ ...prev, [id]: data }));
      setResultados((prev) =>
        prev.map((e) =>
          e.id === data.empleado.id ? { ...e, ...data.empleado } : e
        )
      );
      setQrEmpleadoId(id);
    } catch {
      setError("Error al generar el QR");
    }
  };

  const handleUpdate = async (form) => {
    await updateEmpleado(form.id, form);
    setResultados((prev) =>
      prev.map((emp) => (emp.id === form.id ? { ...emp, ...form } : emp))
    );
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