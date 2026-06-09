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
import { createFixedWindowRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();
const loginRateLimit = createFixedWindowRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) =>
    `${req.ip}:${String(req.body?.email || "").trim().toLowerCase()}`,
  message: "Demasiados intentos de inicio de sesion. Intenta mas tarde.",
});

// Rutas públicas (sin CSRF — aún no hay cookie)
router.post("/login", loginRateLimit, login);

// Rutas protegidas

router.post("/register", protect, authorize("admin"), csrfProtect, register);
router.get("/me", protect, getMe);
router.post("/logout", csrfProtect, logout);
router.put("/change-password", protect, csrfProtect, changePassword);

export default router;
