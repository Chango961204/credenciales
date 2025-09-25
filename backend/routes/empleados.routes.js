import express from "express";
import multer from "multer";
import {
  uploadEmpleados,
  getEmpleados,
  deleteEmpleado,
  registrarEmpleado,
  actualizarEstadoEmpleado,
  postGenerarQr,
  getBuscarEmpleados,
  buscarEmpleadoQR,
  actualizarEmpleado,
  uploadFotoEmpleado,
  getFotoEmpleado,
  getEmpleadoById,
} from "../controllers/empleados.controller.js";
import { uploadFoto } from "../middlewares/uploadFoto.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/importar", upload.single("file"), uploadEmpleados);

router.get("/", getEmpleados);
router.delete("/:id", deleteEmpleado);
router.post("/", registrarEmpleado);
router.patch("/:id/estado", actualizarEstadoEmpleado);
router.post("/:id/generar-qr", postGenerarQr);
router.get("/search", getBuscarEmpleados);
router.get("/empleados/buscar", buscarEmpleadoQR);
router.patch("/:id", actualizarEmpleado);

router.post("/:id/foto", uploadFoto.single("foto"), uploadFotoEmpleado);
router.get("/:id/foto", getFotoEmpleado);

router.get("/:id", getEmpleadoById);

export default router;
