import User from "../models/User.js";
import { diffObjects } from "../utils/diff.js";
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

        const newUser = await User.create({
            username: name,
            email,
            password,
            role: role || "user",
            is_active: true,
            created_by: req.user?.id,
        });

        await req.audit({
            event: "created",
            model: "User",
            modelId: newUser.id,
            oldValues: null,
            newValues: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role, is_active: newUser.is_active },
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

        const before = user.get({ plain: true });

        // map name -> username (si viene del front)
        const updates = { ...req.body };
        if (updates.name) {
            updates.username = updates.name;
            delete updates.name;
        }
        // deja el hasheo al hook beforeUpdate del modelo
        await user.update(updates);

        const after = user.get({ plain: true });

        const changes = diffObjects(before, after);
        if (Object.keys(changes).length > 0) {
            await req.audit({
                event: "updated",
                model: "User",
                modelId: user.id,
                oldValues: Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.old])),
                newValues: Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.new])),
            });
        }

        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const snapshot = user.get({ plain: true });

        await user.destroy();

        await req.audit({
            event: "deleted",
            model: "User",
            modelId: String(req.params.id),
            oldValues: { id: snapshot.id, username: snapshot.username, email: snapshot.email, role: snapshot.role },
            newValues: null,
        });

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
    }
};

