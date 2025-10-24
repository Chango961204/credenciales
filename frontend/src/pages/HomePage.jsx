import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      {isAuthenticated ? (
        // ✅ Vista para usuarios autenticados
        <div className="max-w-4xl w-full text-center space-y-8">
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
            <Link
              to="/empleados"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <div className="text-blue-600 text-5xl mb-4 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Ver Empleados
              </h3>
              <p className="text-gray-600 text-sm">
                Consulta la lista completa de empleados registrados
              </p>
            </Link>

            <Link
              to="/registrar-empleados"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <div className="text-green-600 text-5xl mb-4 group-hover:scale-110 transition-transform">
                ➕
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Registrar Empleado
              </h3>
              <p className="text-gray-600 text-sm">
                Agrega nuevos empleados al sistema
              </p>
            </Link>

            <Link
              to="/buscar-empleado"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <div className="text-purple-600 text-5xl mb-4 group-hover:scale-110 transition-transform">
                🔍
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Buscar Empleado
              </h3>
              <p className="text-gray-600 text-sm">
                Encuentra empleados por diferentes criterios
              </p>
            </Link>

            <Link
              to="/importar-empleados"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
            >
              <div className="text-orange-600 text-5xl mb-4 group-hover:scale-110 transition-transform">
                📂
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Importar Empleados
              </h3>
              <p className="text-gray-600 text-sm">
                Carga masiva de empleados desde archivos
              </p>
            </Link>
          </div>
        </div>
      ) : (
        // 🚪 Vista para usuarios no autenticados (solo login/registro)
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

            <Link
              to="/register"
              className="block w-full px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition duration-200 font-semibold text-center"
            >
              Crear Cuenta Nueva
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
