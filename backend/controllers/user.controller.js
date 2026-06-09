import User from "../models/User.js";
import { diffObjects } from "../utils/diff.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "username", "email", "role", "is_active", "createdAt"],
        });
        res.json(users);
    } catch (error) {
        console.error("Error getAllUsers:", error);
        res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.id != req.params.id) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const user = await User.findByPk(req.params.id, {
            attributes: ["id", "username", "email", "role", "is_active", "createdAt"],
        });

        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        console.error("Error getUserById:", error);
        res.status(500).json({ message: "Error al obtener usuario", error: error.message });
    }
};


export const createUserByAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contrasena son requeridos" });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: "El email ya existe" });

        const username = (name || email.split("@")[0]).trim();

        const newUser = await User.create({
            username,
            email,
            password,
            role: role || "user",
            is_active: true,
        });

        if (req.audit) {
            await req.audit({
                event: "created",
                model: "User",
                modelId: String(newUser.id),
                oldValues: null,
                newValues: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role, is_active: newUser.is_active },
            });
        }

        res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
    } catch (error) {
        console.error("Error createUserByAdmin:", error);
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

        const before = user.get({ plain: true });

        const updates = { ...req.body };
        if (updates.name) {
            updates.username = updates.name;
            delete updates.name;
        }
        // deja el hasheo al hook beforeUpdate del modelo
        await user.update(updates);

        const after = user.get({ plain: true });

        const changes = diffObjects(before, after);
        if (Object.keys(changes).length > 0 && req.audit) {
            await req.audit({
                event: "updated",
                model: "User",
                modelId: String(user.id),
                oldValues: Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.old])),
                newValues: Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.new])),
            });
        }

        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        console.error("Error updateUser:", error);
        res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const snapshot = user.get({ plain: true });

        await user.destroy();

        if (req.audit) {
            await req.audit({
                event: "deleted",
                model: "User",
                modelId: String(req.params.id),
                oldValues: { id: snapshot.id, username: snapshot.username, email: snapshot.email, role: snapshot.role },
                newValues: null,
            });
        }

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error deleteUser:", error);
        res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
    }
};