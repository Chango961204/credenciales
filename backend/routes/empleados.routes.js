import express from "express";
import multer from "multer";
import {
  getEmpleados,
  registrarEmpleado,
  getBuscarEmpleados,
  actualizarEmpleado,
  actualizarEstadoEmpleado,
  getEmpleadoById,
  deleteEmpleado
} from "../controllers/empleados.controller.js";
import { generarCredencial } from "../controllers/credenciales.controller.js";

import { uploadFotoEmpleado, getEmpleadoFoto } from "../controllers/fotos.controller.js";
import { postGenerarQr } from "../controllers/qr.controller.js";
import { uploadEmpleados } from "../controllers/excel.controller.js";

import { uploadFoto } from "../middlewares/uploadFoto.js";

const router = express.Router();
const uploadExcel = multer({ dest: "uploads/" });

router.post("/importar", uploadExcel.single("file"), uploadEmpleados);

router.get("/", getEmpleados);
router.post("/", registrarEmpleado);
router.get("/search", getBuscarEmpleados);
router.get("/:id", getEmpleadoById);
router.patch("/:id", actualizarEmpleado);
router.delete("/:id", deleteEmpleado);

router.patch("/:id/estado", actualizarEstadoEmpleado);
router.post("/:id/generar-qr", postGenerarQr);

router.post("/:id/foto", uploadFoto.single("foto"), uploadFotoEmpleado);
router.get("/:id/foto", getEmpleadoFoto);

router.get("/:id/credencial", generarCredencial);


export default router;
