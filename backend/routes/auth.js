import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  changePassword,
} from "../controllers/auth.controller.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas públicas
//router.post("/register", register);
router.post("/login", login);

// Rutas protegidas

router.post("/register", protect, authorize("admin"), register);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);

export default router;