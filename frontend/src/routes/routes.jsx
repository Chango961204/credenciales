import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";

// Páginas públicas
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CredencialPage from "../pages/CredencialPage";

// Páginas protegidas
import EmpleadosPage from "../pages/EmpleadosPage";
import ImportarEmpleados from "../pages/ImportarEmpleados";
import RegistrarEmpleado from "../pages/RegistrarEmpleado";
import BuscarEmpleadosPage from "../pages/BuscarEmpleadosPage";


function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/credencial/:token" element={<CredencialPage />} />

      {/* Rutas protegidas - requieren autenticación */}
      <Route
        path="/empleados"
        element={
          <PrivateRoute>
            <EmpleadosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/importar-empleados"
        element={
          <PrivateRoute>
            <ImportarEmpleados />
          </PrivateRoute>
        }
      />

      <Route
        path="/registrar-empleados"
        element={
          <PrivateRoute>
            <RegistrarEmpleado />
          </PrivateRoute>
        }
      />

      <Route
        path="/buscar-empleado"
        element={
          <PrivateRoute>
            <BuscarEmpleadosPage />
          </PrivateRoute>
        }
      />

      {/* Rutas solo para admin (ejemplo) */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <div className="p-8">
              <h1 className="text-2xl font-bold">Panel de Administrador</h1>
            </div>
          </PrivateRoute>
        }
      />

      {/* Página no encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;