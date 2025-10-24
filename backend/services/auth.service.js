import jwt from "jsonwebtoken";
import User from "../models/User.js";

class AuthService {
  // Generar JWT
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  }

  // Registro
  async register(userData) {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    // Crear usuario (el password se hasheará automáticamente por el hook)
    const user = await User.create(userData);

    const token = this.generateToken(user.id);
    return { user, token };
  }

  // Login
  async login(email, password) {
    // Buscar usuario por email
    const user = await User.findOne({
      where: { email, is_active: true },
    });

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error("Credenciales inválidas");
    }

    // Actualizar último login
    await user.update({ last_login: new Date() });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  // Verificar token
  async verifyToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user || !user.is_active) {
      throw new Error("Usuario no encontrado o inactivo");
    }

    return user;
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  }

  // Cambiar contraseña
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