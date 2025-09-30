import React from "react";

function formatDate(value) {
  if (!value) return "";

  if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    return value;
  }

  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!isNaN(date)) {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return "";
  }

  if (value instanceof Date) {
    if (isNaN(value)) return "";
    return value.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (typeof value === "string") {
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}/${m}/${y}`;
    }

    const d = new Date(value);
    if (!isNaN(d)) {
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  return "";
}

function EmpleadosTable({ empleados }) {
  if (!Array.isArray(empleados) || empleados.length === 0) {
    return (
      <p className="mt-4 text-center text-gray-500 italic">
        No hay empleados registrados
      </p>
    );
  }

  return (
    <div className="overflow-x-auto mt-6 shadow-lg rounded-lg">
      <table className="w-full border-collapse text-sm text-left">
        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs uppercase">
          <tr>
            <th className="px-4 py-3">Num Trab</th>
            <th className="px-4 py-3">RFC</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">IMSS</th>
            <th className="px-4 py-3">Sexo</th>
            <th className="px-4 py-3">Fecha Ingreso</th>
            <th className="px-4 py-3">Num Depto</th>
            <th className="px-4 py-3">Nom Depto</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Puesto</th>
            <th className="px-4 py-3">Sind</th>
            <th className="px-4 py-3">Conf</th>
            <th className="px-4 py-3">Nómina</th>
            <th className="px-4 py-3">Vencimiento Contrato</th>
            <th className="px-4 py-3">Estado QR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {empleados.map((emp) => (
            <tr
              key={emp.id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-4 py-3">{emp.num_trab}</td>
              <td className="px-4 py-3">{emp.rfc}</td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {emp.nom_trab}
              </td>
              <td className="px-4 py-3">{emp.num_imss}</td>
              <td className="px-4 py-3">{emp.sexo}</td>
              <td className="px-4 py-3">{formatDate(emp.fecha_ing)}</td>
              <td className="px-4 py-3">{emp.num_depto}</td>
              <td className="px-4 py-3">{emp.nom_depto}</td>
              <td className="px-4 py-3">{emp.categoria}</td>
              <td className="px-4 py-3">{emp.puesto}</td>
              <td className="px-4 py-3">
                {emp.sind ? (
                  <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                    Sí
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                    No
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {emp.conf ? (
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                    Sí
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                    No
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{emp.nomina}</td>
              <td className="px-4 py-3">
                {formatDate(emp.vencimiento_contrato)}
              </td>
              <td className="px-4 py-3">
                {emp.estado_qr === "activo" ? (
                  <span className="px-2 py-1 text-xs rounded bg-green-200 text-green-800 font-semibold">
                    Activo
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded bg-red-200 text-red-800 font-semibold">
                    Inactivo
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmpleadosTable;
