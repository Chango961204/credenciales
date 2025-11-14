import express from "express";
import { imprimirCredencialPorEmpleado, listarImpresoras } from "../controllers/impresion.controller.js";

const router = express.Router();

router.get("/printers", /*protect, authorize("admin"),*/ listarImpresoras);

router.post("/empleado/:id", /*protect, authorize("admin"),*/ imprimirCredencialPorEmpleado);

export default router;
