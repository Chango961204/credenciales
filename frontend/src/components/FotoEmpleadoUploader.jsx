import React, { useState } from "react";
import { uploadFotoEmpleado, getFotoEmpleado } from "../services/empleadosApi";

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
    <div className="mt-3 p-2 border rounded">
      <p className="font-semibold">Foto del empleado:</p>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Foto del empleado"
          className="w-32 h-32 object-cover rounded mb-2"
        />
      ) : (
        <p className="text-gray-400">Sin foto</p>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Subir Foto
      </button>
    </div>
  );
};

export default FotoEmpleadoUploader;
