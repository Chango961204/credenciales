import express from "express";
import {
  getAllUsers,
  getUserById,
  createUserByAdmin,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Solo el admin puede ver todos los usuarios o crear nuevos
router.get("/", protect, authorize("admin"), getAllUsers);
router.post("/", protect, authorize("admin"), createUserByAdmin);

// Ver, actualizar o eliminar usuario por id
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
