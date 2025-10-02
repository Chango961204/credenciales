import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import empleadosRoutes from "./routes/empleados.routes.js";
import "./scheduler.js";
import sequelize from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas API
app.use("/api/empleados", empleadosRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

sequelize.authenticate()
  .then(() => console.log("Conexión a la base de datos establecida"))
  .catch((err) => console.error("No se pudo conectar a la base de datos:", err)); 
  