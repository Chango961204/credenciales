import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import Navbar from "./components/Navbar";
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;