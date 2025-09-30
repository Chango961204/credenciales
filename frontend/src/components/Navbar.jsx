import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Credenciales" },
    { to: "/empleados", label: "Empleados" },
    { to: "/importar-empleados", label: "Importar Empleados" },
    { to: "/registrar-empleados", label: "Registrar Empleados" },
    { to: "/buscar-empleado", label: "Buscar Empleado" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg px-6 py-3 mb-6">
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
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Navbar;
