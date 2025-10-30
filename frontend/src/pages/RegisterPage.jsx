import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function RegistrarUsuario() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage("Usuario creado correctamente ");
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar el usuario");
    }
  };

  // Solo el admin puede ver este componente
  if (user?.role !== "admin") {
    return <p>No tienes permisos para acceder a esta página.</p>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Registrar Usuario</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{error}</div>}
      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-3">{message}</div>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold">Nombre</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-3"
          required
        />

        <label className="block mb-2 font-semibold">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-3"
          required
        />

        <label className="block mb-2 font-semibold">Contraseña</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-3"
          required
        />

        <label className="block mb-2 font-semibold">Rol</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-4"
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}
