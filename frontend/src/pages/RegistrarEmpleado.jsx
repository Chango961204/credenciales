import React, { useState } from "react";
import axios from "axios";
import { Loader2, UserPlus, CalendarDays, Building2, Badge } from "lucide-react";

export default function RegistrarEmpleado() {
  const [form, setForm] = useState({
    num_trab: "",
    rfc: "",
    nom_trab: "",
    num_imss: "",
    sexo: "",
    fecha_ing: "",
    num_depto: "",
    nom_depto: "",
    categoria: "",
    puesto: "",
    sind: "",
    conf: "",
    nomina: "",
    vencimiento_contrato: "",
  });

  const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    // num_trab / num_depto: sólo números
    if (name === "num_trab" || name === "num_depto") {
      if (/^\d*$/.test(value)) setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    // sind / conf: "0" | "1"
    if (name === "sind" || name === "conf") {
      if (value === "" || value === "0" || value === "1") {
        setForm((f) => ({ ...f, [name]: value }));
      }
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta({ tipo: "", mensaje: "" });

    // Validación mínima
    if (!form.num_trab || !form.rfc || !form.nom_trab) {
      return setAlerta({ tipo: "error", mensaje: "Completa al menos: Número de empleado, RFC y Nombre." });
    }
    if (!form.sexo) {
      return setAlerta({ tipo: "error", mensaje: "Selecciona el sexo." });
    }

    // Normalización de payload
    const payload = {
      ...form,
      num_trab: form.num_trab ? Number(form.num_trab) : null,
      num_depto: form.num_depto ? Number(form.num_depto) : null,
      sind: form.sind === "" ? null : Number(form.sind),
      conf: form.conf === "" ? null : Number(form.conf),
      fecha_ing: form.fecha_ing || null,
      vencimiento_contrato: form.vencimiento_contrato || null,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/empleados`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setAlerta({ tipo: "success", mensaje: res.data?.message || "Empleado registrado correctamente" });

      // Limpiar formulario
      setForm({
        num_trab: "",
        rfc: "",
        nom_trab: "",
        num_imss: "",
        sexo: "",
        fecha_ing: "",
        num_depto: "",
        nom_depto: "",
        categoria: "",
        puesto: "",
        sind: "",
        conf: "",
        nomina: "",
        vencimiento_contrato: "",
      });
    } catch (error) {
      const msg = error?.response?.data?.message || "Error al registrar empleado. Intenta nuevamente.";
      setAlerta({ tipo: "error", mensaje: msg });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "num_trab", label: "Número de empleado", type: "number", icon: Badge },
    { name: "rfc", label: "RFC", type: "text", icon: UserPlus },
    { name: "nom_trab", label: "Nombre completo", type: "text", icon: UserPlus },
    { name: "num_imss", label: "Número de Seguro Social", type: "text", icon: UserPlus },
    { name: "fecha_ing", label: "Fecha de ingreso", type: "date", icon: CalendarDays },
    { name: "num_depto", label: "No. Departamento", type: "number", icon: Building2 },
    { name: "nom_depto", label: "Nombre de departamento", type: "text", icon: Building2 },
    { name: "categoria", label: "Categoría", type: "text", icon: Building2 },
    { name: "puesto", label: "Puesto", type: "text", icon: Building2 },
    { name: "nomina", label: "Nómina", type: "text", icon: Building2 },
    { name: "vencimiento_contrato", label: "Vencimiento de contrato", type: "date", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-slate-200 shadow-[0_20px_60px_-20px_rgba(2,6,23,0.25)] p-8">
        <h2 className="text-4xl font-extrabold text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
            Registro de Empleado
          </span>
        </h2>

        {alerta.mensaje && (
          <div
            className={`mt-6 mb-6 rounded-xl p-4 text-sm font-medium ${
              alerta.tipo === "success"
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
            }`}
          >
            {alerta.mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos base */}
          {fields.map((f) => {
            const Icon = f.icon || UserPlus;
            return (
              <div key={f.name} className="relative">
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  {f.label}
                </label>
                <Icon className="w-4 h-4 absolute left-3 top-[42px] text-slate-400 pointer-events-none" />
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  required={["rfc", "nom_trab", "num_trab"].includes(f.name)}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                             focus:ring-2 focus:ring-sky-300 text-slate-800"
                />
              </div>
            );
          })}

          {/* Selects */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-800 mb-1">Sexo</label>
            <select
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full pl-3 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                         focus:ring-2 focus:ring-sky-300 text-slate-800"
            >
              <option value="">Seleccionar...</option>
              <option value="M">Hombre</option>
              <option value="F">Mujer</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-800 mb-1">¿Sindicalizado?</label>
            <select
              name="sind"
              value={form.sind}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full pl-3 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                         focus:ring-2 focus:ring-sky-300 text-slate-800"
            >
              <option value="">Seleccionar...</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-800 mb-1">¿Confianza?</label>
            <select
              name="conf"
              value={form.conf}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full pl-3 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                         focus:ring-2 focus:ring-sky-300 text-slate-800"
            >
              <option value="">Seleccionar...</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-white
                         bg-gradient-to-r from-blue-600 to-sky-600 shadow hover:shadow-lg
                         active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Registrar Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
