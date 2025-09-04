import { Routes, Route } from "react-router-dom";
import EmpleadosPage from "../pages/EmpleadosPage";
import ImportarEmpleados from "../pages/ImportarEmpleados";
import HomePage from "../pages/HomePage";
import RegistrarEmpleado from "../pages/RegistrarEmpleado";
function AppRoutes() {
  return (
    <Routes>


      <Route path="/" element={<HomePage />} />
        
      <Route path="/empleados" element={<EmpleadosPage />} />
      
      <Route path="/importar-empleados" element={<ImportarEmpleados />} />

      <Route path="/registrar-empleados" element={<RegistrarEmpleado />} />      
      
    </Routes>
  );
}

export default AppRoutes;