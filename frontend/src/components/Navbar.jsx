import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const hideNavbar = /^\/credencial\/[^/]+$/.test(location.pathname);
  if (hideNavbar) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Links(autenticado)
  const mainLinks = [
    { to: "/", label: "Credenciales" },
    { to: "/empleados", label: "Empleados" },
    { to: "/importar-empleados", label: "Importar" },
    { to: "/registrar-empleados", label: "Registrar" },
    { to: "/buscar-empleado", label: "Buscar" },
  ];

  //  solo admin
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
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600"
          >
            PMZ · Credenciales
          </Link>

          <ul className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`relative px-1 py-2 text-sm font-semibold transition-colors ${isActive(link.to)
                      ? "text-indigo-700"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all
                    ${isActive(link.to) ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
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
                    className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-slate-200 ${user?.role === "admin"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                      }`}
                  >
                    {user?.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-white
                             bg-gradient-to-r from-rose-500 to-red-600 shadow
                             hover:shadow-md active:scale-[0.98] transition"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-indigo-600 to-violet-600 shadow
                           hover:shadow-md active:scale-[0.98] transition"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold
                                ${isActive(link.to)
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    {link.label}
                    {isActive(link.to) && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    )}
                  </Link>
                </li>
              ))}

              <div className="pt-2 mt-2 border-t border-slate-200">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-white
                               bg-gradient-to-r from-rose-500 to-red-600 shadow hover:shadow-md"
                  >
                    Cerrar sesión
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center rounded-xl px-3 py-2 text-sm font-semibold text-white
                               bg-gradient-to-r from-indigo-600 to-violet-600 shadow hover:shadow-md"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>

              {isAuthenticated && (
                <div className="flex items-center justify-between mt-3 px-1">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-slate-200 ${user?.role === "admin"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
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
