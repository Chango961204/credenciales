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
import { postGenerarQr } from "../controllers/qr.controller.js";
import { uploadEmpleados } from "../controllers/excel.controller.js";
import { uploadFoto } from "../middlewares/uploadFoto.js";

const router = express.Router();
const uploadExcel = multer({ dest: "uploads/" });

router.post("/importar", uploadExcel.single("file"), uploadEmpleados);

//  Primero las rutas fijas
router.get("/token/:token", getCredencialByToken);
router.get("/search", getBuscarEmpleados);

//  Luego las rutas dinámicas
router.get("/", getEmpleados);
router.post("/", registrarEmpleado);
router.get("/:id/credencial", generarCredencial);
router.patch("/:id", actualizarEmpleado);
router.patch("/:id/estado", actualizarEstadoEmpleado);
router.post("/:id/generar-qr", generarQrEmpleado);
router.post("/:id/foto", uploadFoto.single("foto"), uploadFotoEmpleado);
router.get("/:id/foto", getEmpleadoFoto);
router.get("/:id", getEmpleadoById);
router.delete("/:id", deleteEmpleado);

export default router;