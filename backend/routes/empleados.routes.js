import { Router } from "express";
import multer from "multer";
import {
  uploadEmpleados,
  getEmpleados,
  deleteEmpleado,
} from "../controllers/empleados.controller.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Subir archivo Excel e importar empleados
router.post("/importar", upload.single("file"), uploadEmpleados);

// Listar empleados con paginación
router.get("/", getEmpleados);

// Eliminar empleado por ID
router.delete("/:id", deleteEmpleado);

export default router;
