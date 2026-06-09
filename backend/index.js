import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import empleadosRoutes from "./routes/empleados.routes.js";
import "./scheduler.js";
import sequelize from "./config/database.js";
import impresionRoutes from "./routes/impresion.routes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.routes.js";
import auditMiddleware from "./middlewares/auditMiddleware.js";
import auditoriasRoutes from "./routes/auditoria.routes.js";
import { csrfProtect } from "./middlewares/csrfMiddleware.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:4000",
        "https://credenciales-front.onrender.com",
        "https://credenciales.capitaldezacatecas.gob.mx",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-XSRF-TOKEN"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.set("trust proxy", true);

app.use(auditMiddleware);

// Rutas API
app.use("/api/empleados", csrfProtect, empleadosRoutes);
app.use("/api/impresion", csrfProtect, impresionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auditorias", csrfProtect, auditoriasRoutes);
app.use("/api/users", csrfProtect, userRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE" ? "Archivo demasiado grande" : err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Solicitud invalida",
    });
  }

  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

sequelize
  .authenticate()
  .then(() => console.log("Conexión a la base de datos establecida"))
  .catch((err) => console.error("No se pudo conectar a la base de datos:", err));
