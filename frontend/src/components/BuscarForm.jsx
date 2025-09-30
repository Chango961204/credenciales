import { useState } from "react";

export default function BuscarForm({ onSearch }) {
  const [num, setNum] = useState("");
  const [nombre, setNombre] = useState("");

  const handleSubmit = () => onSearch(num.trim(), nombre.trim());
  const handleKeyPress = (e) => e.key === "Enter" && handleSubmit();

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-wrap items-center gap-4 border border-gray-100">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de empleado
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition"
          placeholder="Ej. 12345"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="flex-1 min-w-[220px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del empleado
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition"
          placeholder="Ej. Juan Pérez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="flex items-end">
        <button
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow hover:from-blue-700 hover:to-blue-600 transition-all"
          onClick={handleSubmit}
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
