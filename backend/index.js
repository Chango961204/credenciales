import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import empleadosRoutes from "./routes/empleados.routes.js";
import "./scheduler.js";
import sequelize from "./config/database.js";
import impresionRoutes from "./routes/impresion.routes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.routes.js";
import auditMiddleware from "./middlewares/auditMiddleware.js";
import auditoriasRoutes from "./routes/auditoria.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4000",
      "https://credenciales-front.onrender.com",
      "http://credenciales.capitaldezacatecas.gob.mx",
      "https://credenciales.capitaldezacatecas.gob.mx",

    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.set("trust proxy", true);

// Primer uso del middleware de auditoría
app.use(auditMiddleware);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas API
app.use("/api/empleados", empleadosRoutes);
app.use("/api/impresion", impresionRoutes);
app.use("/api/auth", authRoutes);

// (Este segundo uso de auditMiddleware es redundante, pero si así te funcionaba,
// lo dejo para no cambiarte el comportamiento)
app.use(auditMiddleware);

app.use("/api/auditorias", auditoriasRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

sequelize
  .authenticate()
  .then(() => console.log("Conexión a la base de datos establecida"))
  .catch((err) => console.error("No se pudo conectar a la base de datos:", err));
