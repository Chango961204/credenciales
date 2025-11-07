import React from "react";

function formatDate(value) {
  if (!value) return "";

  if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    return value;
  }

  if (typeof value === "number" && !Number.isNaN(value)) {
    const ms = (value - 25569) * 86400 * 1000;
    const d = new Date(ms);
    if (!Number.isNaN(d.valueOf())) {
      return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  if (typeof value === "string") {
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}/${m}/${y}`;
    }
    const d = new Date(value);
    if (!Number.isNaN(d.valueOf())) {
      return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
  }

  return "";
}

const Chip = ({ children, tone = "slate" }) => {
  const palette = {
    green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    red: "bg-rose-100 text-rose-700 ring-rose-200",
    blue: "bg-sky-100 text-sky-700 ring-sky-200",
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${palette[tone] || palette.slate}`}
    >
      {children}
    </span>
  );
};

/* -------- component -------- */
function EmpleadosTable({ empleados = [] }) {
  if (!Array.isArray(empleados) || empleados.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 p-8 text-center shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)]">
        <p className="text-slate-500">
          No hay empleados registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <th className="px-4 py-3 text-left font-semibold">Num Trab</th>
              <th className="px-4 py-3 text-left font-semibold">RFC</th>
              <th className="px-4 py-3 text-left font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold">IMSS</th>
              <th className="px-4 py-3 text-left font-semibold">Sexo</th>
              <th className="px-4 py-3 text-left font-semibold">Fecha Ingreso</th>
              <th className="px-4 py-3 text-left font-semibold">Num Depto</th>
              <th className="px-4 py-3 text-left font-semibold">Nom Depto</th>
              <th className="px-4 py-3 text-left font-semibold">Categoría</th>
              <th className="px-4 py-3 text-left font-semibold">Puesto</th>
              <th className="px-4 py-3 text-left font-semibold">Sind</th>
              <th className="px-4 py-3 text-left font-semibold">Conf</th>
              <th className="px-4 py-3 text-left font-semibold">Nómina</th>
              <th className="px-4 py-3 text-left font-semibold">Vencimiento Contrato</th>
              <th className="px-4 py-3 text-left font-semibold">Estado QR</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {empleados.map((emp, i) => (
              <tr
                key={emp.id ?? i}
                className="hover:bg-indigo-50/40 transition-colors"
              >
                <td className="px-4 py-3 text-slate-800">{emp.num_trab}</td>
                <td className="px-4 py-3 text-slate-700">{emp.rfc}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{emp.nom_trab}</td>
                <td className="px-4 py-3 text-slate-700">{emp.num_imss}</td>
                <td className="px-4 py-3 text-slate-700">{emp.sexo}</td>
                <td className="px-4 py-3 text-slate-700">{formatDate(emp.fecha_ing)}</td>
                <td className="px-4 py-3 text-slate-700">{emp.num_depto}</td>
                <td className="px-4 py-3 text-slate-700">{emp.nom_depto}</td>
                <td className="px-4 py-3 text-slate-700">{emp.categoria}</td>
                <td className="px-4 py-3 text-slate-700">{emp.puesto}</td>

                <td className="px-4 py-3">
                  {emp.sind ? (
                    <Chip tone="green">Sí</Chip>
                  ) : (
                    <Chip tone="red">No</Chip>
                  )}
                </td>

                <td className="px-4 py-3">
                  {emp.conf ? (
                    <Chip tone="blue">Sí</Chip>
                  ) : (
                    <Chip tone="gray">No</Chip>
                  )}
                </td>

                <td className="px-4 py-3 text-slate-700">{emp.nomina}</td>
                <td className="px-4 py-3 text-slate-700">
                  {formatDate(emp.vencimiento_contrato)}
                </td>

                <td className="px-4 py-3">
                  {emp.estado_qr === "activo" ? (
                    <Chip tone="green">Activo</Chip>
                  ) : (
                    <Chip tone="red">Inactivo</Chip>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmpleadosTable;
