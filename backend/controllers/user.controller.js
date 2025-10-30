import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role", "is_active", "createdAt"],
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.id != req.params.id) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const user = await User.findByPk(req.params.id, {
            attributes: ["id", "name", "email", "role", "is_active", "createdAt"],
        });

        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuario", error: error.message });
    }
};

export const createUserByAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: "El email ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "user",
            is_active: true,
            created_by: req.user.id,
        });

        res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error al crear usuario", error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== "admin" && req.user.id != id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const updates = req.body;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        await user.update(updates);
        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        await user.destroy();
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
    }
};
