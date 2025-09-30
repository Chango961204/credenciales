import React, { useState } from "react";
import axios from "axios";

function RegistrarEmpleado() {
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
    try {
      await axios.post("http://localhost:4000/api/empleados", form);
      alert("Empleado registrado correctamente");
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
      alert("Error al registrar empleado");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-2xl mt-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Registrar Empleado
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "num_trab", label: "Número de empleado", type: "number" },
          { name: "rfc", label: "RFC", type: "text" },
          { name: "nom_trab", label: "Nombre", type: "text" },
          { name: "num_imss", label: "Número de Seguro Social", type: "text" },
          { name: "fecha_ing", label: "Fecha de Ingreso", type: "date" },
          { name: "num_depto", label: "No. Departamento", type: "number" },
          { name: "nom_depto", label: "Nombre de Departamento", type: "text" },
          { name: "categoria", label: "Categoría", type: "text" },
          { name: "puesto", label: "Puesto", type: "text" },
          { name: "nomina", label: "Nómina", type: "text" },
          { name: "vencimiento_contrato", label: "Vencimiento de Contrato", type: "date" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        ))}

        {/* Selects especiales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <select
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Selecciona sexo</option>
            <option value="M">Hombre</option>
            <option value="F">Mujer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sindicato
          </label>
          <select
            name="sind"
            value={form.sind}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">¿Sindicalizado?</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confianza
          </label>
          <select
            name="conf"
            value={form.conf}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">¿Confianza?</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </div>

        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Registrar
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarEmpleado;
