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
  buscarEmpleadoQR
} from "../controllers/empleados.controller.js";

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


export default router;
