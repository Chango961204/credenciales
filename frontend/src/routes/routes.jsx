import { Routes, Route } from "react-router-dom";
import EmpleadosPage from "../pages/EmpleadosPage";
import ImportarEmpleados from "../pages/ImportarEmpleados";
import HomePage from "../pages/HomePage";
import RegistrarEmpleado from "../pages/RegistrarEmpleado";
import BuscarEmpleadosPage from "../pages/BuscarEmpleadosPage";
import CredencialPage from "../pages/CredencialPage";

function AppRoutes() {
  return (
    <Routes>


      <Route path="/" element={<HomePage />} />

      <Route path="/empleados" element={<EmpleadosPage />} />

      <Route path="/importar-empleados" element={<ImportarEmpleados />} />

      <Route path="/registrar-empleados" element={<RegistrarEmpleado />} />

      <Route path="buscar-empleado" element={<BuscarEmpleadosPage />} />

      <Route path="/credencial/:token" element={<CredencialPage />} />


    </Routes>
  );
}

export default AppRoutes;