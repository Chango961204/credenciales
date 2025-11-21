import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoZac from "../assets/pmz.webp";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  // Ocultar navbar en la vista pública de credencial
  const hideNavbar = /^\/credencial\/[^/]+$/.test(location.pathname);
  if (hideNavbar) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Links base (autenticado)
  const mainLinks = [
    { to: "/", label: "Credenciales" },
    { to: "/empleados", label: "Empleados" },
    { to: "/importar-empleados", label: "Importar" },
    { to: "/registrar-empleados", label: "Registrar" },
    { to: "/buscar-empleado", label: "Buscar" },
  ];

  // Extras solo admin
  const adminLinks = [
    { to: "/register", label: "Usuarios" },
    { to: "/auditorias", label: "Auditorías" },
  ];

  const publicLinks = [{ to: "/", label: "Inicio" }];

  const links = isAuthenticated
    ? [...mainLinks, ...(user?.role === "admin" ? adminLinks : [])]
    : publicLinks;

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-lg font-extrabold tracking-tight"
          >
            <img
              src={logoZac}
              alt="Ayuntamiento de Zacatecas 2024-2027"
              className="h-10 w-auto object-contain"
            />

            {/* <span className="hidden sm:inline bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Sistema de Credenciales PMZ
            </span> */}
          </Link>


          <ul className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`group relative inline-flex flex-col items-center px-1 py-1.5 text-sm font-semibold transition-colors ${isActive(link.to)
                    ? "text-blue-700"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <span>{link.label}</span>
                  <span
                    className={`mt-0.5 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-transform duration-200 ${isActive(link.to)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                      }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="text-right leading-tight">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-slate-200 ${user?.role === "admin"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {user?.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:shadow-md active:scale-[0.98] transition"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md active:scale-[0.98] transition"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú celulares */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold ${isActive(link.to)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    {link.label}
                    {isActive(link.to) && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </Link>
                </li>
              ))}

              <div className="mt-3 border-t border-slate-200 pt-3">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:shadow-md"
                  >
                    Cerrar sesión
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-center text-sm font-semibold text-white shadow hover:shadow-md"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>

              {isAuthenticated && (
                <div className="mt-3 flex items-center justify-between px-1">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-slate-200 ${user?.role === "admin"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {user?.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </div>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
