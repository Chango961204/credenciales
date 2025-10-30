import React, { useState } from "react";
import axios from "axios";

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

  // ✅ Usa la URL dinámica del backend
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "num_trab" || name === "num_depto") {
      if (/^\d*$/.test(value)) setForm({ ...form, [name]: value });
    } else if (name === "sind" || name === "conf") {
      if (value === "0" || value === "1") setForm({ ...form, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta({ tipo: "", mensaje: "" });

    try {
      const res = await axios.post(`${API_URL}/empleados`, form);
      setAlerta({ tipo: "success", mensaje: res.data.message || "Empleado registrado correctamente" });

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
      console.error("❌ Error al registrar empleado:", error);
      const msg =
        error.response?.data?.message ||
        "Error al registrar empleado. Intenta nuevamente.";
      setAlerta({ tipo: "error", mensaje: msg });
    }
  };

  const fields = [
    { name: "num_trab", label: "Número de empleado", type: "number" },
    { name: "rfc", label: "RFC", type: "text" },
    { name: "nom_trab", label: "Nombre completo", type: "text" },
    { name: "num_imss", label: "Número de Seguro Social", type: "text" },
    { name: "fecha_ing", label: "Fecha de ingreso", type: "date" },
    { name: "num_depto", label: "No. Departamento", type: "number" },
    { name: "nom_depto", label: "Nombre de departamento", type: "text" },
    { name: "categoria", label: "Categoría", type: "text" },
    { name: "puesto", label: "Puesto", type: "text" },
    { name: "nomina", label: "Nómina", type: "text" },
    { name: "vencimiento_contrato", label: "Vencimiento de contrato", type: "date" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10 border border-slate-200">
        <h2 className="text-4xl font-bold text-center text-blue-700 mb-8">
          Registro de Empleado
        </h2>

        {alerta.mensaje && (
          <div
            className={`text-center mb-6 py-3 px-4 rounded-xl text-white font-medium transition-all ${
              alerta.tipo === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {alerta.mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-sm font-semibold text-slate-700 mb-1">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          ))}

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-1">Sexo</label>
            <select
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              required
              className="px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="" selected disabled >Seleccionar...</option>
              <option value="M">Hombre</option>
              <option value="F">Mujer</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-1">¿Sindicalizado?</label>
            <select
              name="sind"
              value={form.sind}
              onChange={handleChange}
              required
              className="px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="" selected disabled>Seleccionar...</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-1">¿Confianza?</label>
            <select
              name="conf"
              value={form.conf}
              onChange={handleChange}
              required
              className="px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value=""selected disabled>¿Confianza?</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-center mt-8">
            <button
              type="submit"
              className="px-10 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Registrar Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
