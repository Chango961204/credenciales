import express from "express";
import cors from "cors";
import empleadosRoutes from "./routes/empleados.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store"); 
  next();
});


app.use("/api/empleados", empleadosRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
