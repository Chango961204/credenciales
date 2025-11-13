import jwt from "jsonwebtoken";
import User from "../models/User.js";

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  }

  async register(userData) {
    console.log("Registering user with data:", userData);

    const { name, username, email, password, role } = userData;

    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    const finalUsername =
      (username && username.trim()) ||
      (name && name.trim()) ||        
      email.split("@")[0];              

    if (!finalUsername) {
      throw new Error("El nombre de usuario es requerido");
    }

    const user = await User.create({
      username: finalUsername,
      email,
      password,
      role: role || "user",
      is_active: true,
    });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async login(email, password) {
    const user = await User.findOne({
      where: { email, is_active: true },
    });

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error("Credenciales inválidas");
    }

    await user.update({ last_login: new Date() });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async verifyToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id = decoded.userId || decoded.id; 
    const user = await User.findByPk(id, { 
      attributes: ["id", "email", "username", "role", "is_active"],
    });

    if (!user || !user.is_active) {
      throw new Error("Usuario no encontrado o inactivo");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const isValidPassword = await user.comparePassword(oldPassword);
    if (!isValidPassword) {
      throw new Error("Contraseña actual incorrecta");
    }

    await user.update({ password: newPassword });
    return { message: "Contraseña actualizada exitosamente" };
  }
}

export default new AuthService();
