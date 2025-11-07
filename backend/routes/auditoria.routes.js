import { Router } from "express";
import { listAuditorias } from "../controllers/auditorias.controller.js";
import {protect, authorize} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin"), listAuditorias);

export default router;
