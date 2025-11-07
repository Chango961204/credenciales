import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Shield, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4">
        <div className="max-w-lg w-full rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 p-8 text-center shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)]">
          <h2 className="text-2xl font-bold text-slate-900">Acceso restringido</h2>
          <p className="mt-2 text-slate-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.name || !formData.email || !formData.password) {
      return setError("Todos los campos son obligatorios");
    }
    if (formData.password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setMessage(res.data?.message || "Usuario creado correctamente");
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-blue-50 to-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
              Registrar Usuario
            </span>
          </h1>
          <p className="mt-2 text-slate-600">
            Crea cuentas para nuevos integrantes del sistema.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)] p-6">
          {/* Alerts */}
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border ring-1 ring-rose-200 bg-rose-50 p-3 text-rose-800">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div className="text-sm">
                <b>Error:</b> {error}
              </div>
            </div>
          )}
          {message && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border ring-1 ring-emerald-200 bg-emerald-50 p-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              <div className="text-sm">
                {message}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Nombre</label>
              <User className="w-4 h-4 absolute left-3 top-[42px] text-slate-400 pointer-events-none" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre completo"
                autoComplete="name"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                           focus:ring-2 focus:ring-sky-300 text-slate-800"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Email</label>
              <Mail className="w-4 h-4 absolute left-3 top-[42px] text-slate-400 pointer-events-none" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                           focus:ring-2 focus:ring-sky-300 text-slate-800"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Contraseña</label>
              <Lock className="w-4 h-4 absolute left-3 top-[42px] text-slate-400 pointer-events-none" />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                           focus:ring-2 focus:ring-sky-300 text-slate-800"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Usa al menos 6 caracteres. Recomendado: mezcla letras, números y símbolos.
              </p>
            </div>

            {/* Rol */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Rol</label>
              <Shield className="w-4 h-4 absolute left-3 top-[42px] text-slate-400 pointer-events-none" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 ring-1 ring-slate-200 outline-none
                           focus:ring-2 focus:ring-sky-300 text-slate-800"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white
                         bg-gradient-to-r from-blue-600 to-sky-500 shadow hover:shadow-md active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando…
                </>
              ) : (
                <>Registrar</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}