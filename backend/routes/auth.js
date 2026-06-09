import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  changePassword,
} from "../controllers/auth.controller.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import { csrfProtect } from "../middlewares/csrfMiddleware.js";

const router = express.Router();

// Rutas públicas (sin CSRF — aún no hay cookie)
router.post("/login", login);

// Rutas protegidas

router.post("/register", protect, authorize("admin"), csrfProtect, register);
router.get("/me", protect, getMe);
router.post("/logout", protect, csrfProtect, logout);
router.put("/change-password", protect, csrfProtect, changePassword);

export default router;