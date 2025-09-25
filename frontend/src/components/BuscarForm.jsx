import { useState } from "react";

export default function BuscarForm({ onSearch }) {
  const [num, setNum] = useState("");
  const [nombre, setNombre] = useState("");

  const handleSubmit = () => onSearch(num.trim(), nombre.trim());
  const handleKeyPress = (e) => e.key === "Enter" && handleSubmit();

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex flex-wrap gap-3 mb-4">
      <input
        className="border rounded px-3 py-2 flex-1 min-w-[150px]"
        placeholder="Número de empleado"
        value={num}
        onChange={(e) => setNum(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <input
        className="border rounded px-3 py-2 flex-1 min-w-[200px]"
        placeholder="Nombre del empleado"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Buscar
      </button>
    </div>
  );
}
