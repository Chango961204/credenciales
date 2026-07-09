import express from "express";
import multer from "multer";
import path from "path";
import {
  getEmpleados,
  registrarEmpleado,
  getBuscarEmpleados,
  actualizarEmpleado,
  actualizarEstadoEmpleado,
  getEmpleadoById,
  deleteEmpleado,
} from "../controllers/empleados/index.js";
import {
  generarCredencial,
  getCredencialByToken,
  getCredencialFotoByToken,
  generarQrEmpleado,
} from "../controllers/credenciales.controller.js";

import { syncFotosEmpleados, importarFotosZip } from "../controllers/fotosBulk.controller.js"; 


import { uploadFotoEmpleado, getEmpleadoFoto } from "../controllers/fotos.controller.js";
import { uploadEmpleados } from "../controllers/excel.controller.js";
import { uploadFoto } from "../middlewares/uploadFoto.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const excelExtensions = new Set([".xlsx"]);
const zipExtensions = new Set([".zip"]);

const filterByExtension = (allowedExtensions, message) => (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (allowedExtensions.has(ext)) {
    return cb(null, true);
  }
  return cb(new Error(message), false);
};

const uploadExcel = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: filterByExtension(excelExtensions, "El archivo debe ser .xlsx"),
});

const uploadZip = multer({
  dest: "uploads/tmp",
  limits: { fileSize: 200 * 1024 * 1024, files: 1 },
  fileFilter: filterByExtension(zipExtensions, "El archivo debe ser .zip"),
});

router.get("/token/:token", getCredencialByToken);
router.get("/token/:token/foto", getCredencialFotoByToken);

router.get("/search", protect, getBuscarEmpleados);
router.get("/", protect, getEmpleados);

router.post("/fotos/sync", protect, authorize("admin"), syncFotosEmpleados); 
router.post("/fotos/importar", protect, authorize("admin"), uploadZip.single("file"), importarFotosZip); 


router.get("/:id", protect, getEmpleadoById);

router.get("/:id/foto", protect, getEmpleadoFoto);

router.post("/importar", protect, authorize("admin"), uploadExcel.single("file"), uploadEmpleados);
router.post("/", protect, authorize("admin"), registrarEmpleado);
router.patch("/:id", protect, authorize("admin"), actualizarEmpleado);
router.patch("/:id/estado", protect, authorize("admin"), actualizarEstadoEmpleado);
router.delete("/:id", protect, authorize("admin"), deleteEmpleado);

router.get("/:id/credencial", protect, generarCredencial);
router.post("/:id/generar-qr", protect, authorize("admin"), generarQrEmpleado);

router.post("/:id/foto", protect, authorize("admin"), uploadFoto.single("foto"), uploadFotoEmpleado);

export default router;
