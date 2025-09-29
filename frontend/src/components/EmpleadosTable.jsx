import React from "react";


function formatDate(value) {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    return value;
  }

  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!isNaN(date)) {
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    return "";
  }

  if (value instanceof Date) {
    if (isNaN(value)) return "";
    return value.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  if (typeof value === "string") {
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}/${m}/${y}`;
    }

    const d = new Date(value);
    if (!isNaN(d)) {
      return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    return value; 
  }

  return "";
}

function EmpleadosTable({ empleados, onEdit }) {
  if (!Array.isArray(empleados) || empleados.length === 0) {
    return <p style={{ marginTop: "20px" }}>No hay empleados registrados</p>;
  }

  return (
    <table border="1" cellPadding="6" style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Num Trab</th>
          <th>RFC</th>
          <th>Nombre</th>
          <th>IMSS</th>
          <th>Sexo</th>
          <th>Fecha Ingreso</th>
          <th>Num Depto</th>
          <th>Nom Depto</th>
          <th>Categoría</th>
          <th>Puesto</th>
          <th>Sind</th>
          <th>Conf</th>
          <th>Nómina</th>
          <th>Vencimiento Contrato</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {empleados.map((emp) => (
          <tr key={emp.id}>
            <td>{emp.num_trab}</td>
            <td>{emp.rfc}</td>
            <td>{emp.nom_trab}</td>
            <td>{emp.num_imss}</td>
            <td>{emp.sexo}</td>
            <td>{formatDate(emp.fecha_ing)}</td>
            <td>{emp.num_depto}</td>
            <td>{emp.nom_depto}</td>
            <td>{emp.categoria}</td>
            <td>{emp.puesto}</td>
            <td>{emp.sind}</td>
            <td>{emp.conf}</td>
            <td>{emp.nomina}</td>
            <td>{formatDate(emp.vencimiento_contrato)}</td>
            <td>{emp.activo ? "Activo" : "Inactivo"}</td>
            <td>

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EmpleadosTable;


