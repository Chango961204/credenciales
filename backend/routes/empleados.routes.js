import express from "express";
import multer from "multer";
import {
  getEmpleados,
  registrarEmpleado,
  getBuscarEmpleados,
  actualizarEmpleado,
  actualizarEstadoEmpleado,
  getEmpleadoById,
  deleteEmpleado,
} from "../controllers/empleados.controller.js";
import {
  generarCredencial,
  getCredencialByToken,
  generarQrEmpleado,
} from "../controllers/credenciales.controller.js";

import { uploadFotoEmpleado, getEmpleadoFoto } from "../controllers/fotos.controller.js";
import { uploadEmpleados } from "../controllers/excel.controller.js";
import { uploadFoto } from "../middlewares/uploadFoto.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const uploadExcel = multer({ dest: "uploads/" });

router.get("/token/:token", getCredencialByToken);

router.get("/search", protect, getBuscarEmpleados);
router.get("/", protect, getEmpleados);
router.get("/:id", protect, getEmpleadoById);

router.get("/:id/foto", getEmpleadoFoto);

router.post("/importar", protect, uploadExcel.single("file"), uploadEmpleados);
router.post("/", protect, registrarEmpleado);
router.patch("/:id", protect, actualizarEmpleado);
router.patch("/:id/estado", protect, actualizarEstadoEmpleado);
router.delete("/:id", protect, deleteEmpleado);

router.get("/:id/credencial",  generarCredencial);
router.post("/:id/generar-qr",  generarQrEmpleado);

router.post("/:id/foto", protect, uploadFoto.single("foto"), uploadFotoEmpleado);

export default router;
