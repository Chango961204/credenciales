import React, { useState } from "react";
import { uploadFotoEmpleado, getFotoEmpleado } from "../services/empleadosApi";
import { Camera, Upload } from "lucide-react";

const FotoEmpleadoUploader = ({ empleado }) => {
  if (!empleado) {
    return <p className="text-gray-500">No hay datos del empleado</p>;
  }

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(getFotoEmpleado(empleado.id));

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Selecciona una foto primero");
    try {
      await uploadFotoEmpleado(empleado.id, selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      alert("Foto subida correctamente");
    } catch (err) {
      console.error("Error subiendo la foto:", err);
      alert("Error al subir foto");
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-xl shadow-md bg-white">
      <p className="font-semibold text-gray-700 mb-2">Foto del empleado</p>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Foto del empleado"
          className="w-32 h-32 object-cover rounded-lg border shadow-sm mb-3 transition-transform hover:scale-105"
        />
      ) : (
        <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg mb-3 border text-gray-400">
          Sin foto
        </div>
      )}

      {/* Input estilizado con ícono */}
      <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer font-medium w-fit">
        <Camera size={18} />
        <span>Seleccionar foto</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <button
        onClick={handleUpload}
        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow"
      >
        <Upload size={18} />
        Subir Foto
      </button>
    </div>
  );
};

export default FotoEmpleadoUploader;
