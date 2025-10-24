import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Links que solo se muestran cuando el usuario está autenticado
  const authenticatedLinks = [
    { to: "/", label: "Credenciales" },
    { to: "/empleados", label: "Empleados" },
    { to: "/importar-empleados", label: "Importar Empleados" },
    { to: "/registrar-empleados", label: "Registrar Empleados" },
    { to: "/buscar-empleado", label: "Buscar Empleado" },
  ];

  // Links públicos (si no está autenticado)
  const publicLinks = [
    { to: "/", label: "Inicio" },
  ];

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg px-6 py-3 mb-6">
      <div className="flex items-center justify-between">
        {/* Links de navegación */}
        <ul className="flex flex-wrap gap-6 text-white font-medium">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`relative transition duration-300 hover:text-yellow-300 ${
                    isActive ? "text-yellow-300" : ""
                  }`}
                >
                  {link.label}
                  {/* Animación underline */}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-300 transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 hover:w-full"
                    }`}
                  ></span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sección de autenticación */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Información del usuario */}
              <div className="flex items-center gap-3 text-white">
                <div className="text-right">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs opacity-80">{user?.email}</p>
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs rounded-full font-medium">
                  {user?.role === "admin" ? "Administrador" : "Usuario"}
                </span>
              </div>

              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 font-medium text-sm shadow-md hover:shadow-lg"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              {/* Botones de login y registro */}
              <Link
                to="/login"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition duration-200 font-medium text-sm"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded-lg transition duration-200 font-medium text-sm shadow-md hover:shadow-lg"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;