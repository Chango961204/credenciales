import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#eee", marginBottom: "2rem" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>Credenciales</Link>
      <Link to="/empleados" style={{ marginRight: "1rem" }}>Empleados</Link>
      <Link to="/importar-empleados" style={{ marginRight: "1rem" }}>Importar Empleados</Link>
      <Link to="/registrar-empleados">Registrar Empleados</Link>
    </nav>
  );
}

export default Navbar;