import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, UserPlus, Search, Upload, UserCog } from "lucide-react"; 

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      {isAuthenticated ? (
        <div className="max-w-5xl w-full text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900">
            Sistema de Credenciales PMZ
          </h1>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">
              ¡Bienvenido de nuevo, {user?.name}!
            </h2>
            <p className="text-blue-100">
              Rol:{" "}
              <span className="font-semibold">
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {/* Ver empleados */}
            <Link
              to="/empleados"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <Users className="text-blue-600 w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Ver Empleados
              </h3>
              <p className="text-gray-600 text-sm">
                Consulta la lista completa de empleados registrados
              </p>
            </Link>

            {/* Registrar empleado */}
            <Link
              to="/registrar-empleados"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <UserPlus className="text-green-600 w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Registrar Empleado
              </h3>
              <p className="text-gray-600 text-sm">
                Agrega nuevos empleados al sistema
              </p>
            </Link>

            {/* Buscar empleado */}
            <Link
              to="/buscar-empleado"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <Search className="text-purple-600 w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Buscar Empleado
              </h3>
              <p className="text-gray-600 text-sm">
                Encuentra empleados por diferentes criterios
              </p>
            </Link>

            {/* Importar empleados */}
            <Link
              to="/importar-empleados"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <Upload className="text-orange-600 w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Importar Empleados
              </h3>
              <p className="text-gray-600 text-sm">
                Carga empleados desde archivos Excel
              </p>
            </Link>

            {/* Registrar usuario (solo admin) */}
            {user?.role === "admin" && (
              <Link
                to="/register"
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
              >
                <UserCog className="text-red-600 w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Registrar Usuario
                </h3>
                <p className="text-gray-600 text-sm">
                  Crea nuevos usuarios con acceso al sistema
                </p>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center max-w-md w-full">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            Sistema de Credenciales PMZ
          </h1>
          <p className="text-gray-600 mb-10 text-lg">
            Comienza ahora para acceder a todas las funcionalidades del sistema
          </p>

          <div className="space-y-4">
            <Link
              to="/login"
              className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition duration-200 font-semibold text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
