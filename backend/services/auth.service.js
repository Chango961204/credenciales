import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const revokedTokens = new Map();

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const cleanupRevokedTokens = () => {
  const now = Date.now();
  for (const [tokenHash, expiresAt] of revokedTokens.entries()) {
    if (expiresAt <= now) {
      revokedTokens.delete(tokenHash);
    }
  }
};

setInterval(cleanupRevokedTokens, 60 * 60 * 1000).unref();

class AuthService {
  generateToken(userId) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no definido");
    }

    return jwt.sign({ userId, purpose: "auth", jti: crypto.randomUUID() }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  revokeToken(token) {
    if (!token) return;

    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp
      ? decoded.exp * 1000
      : Date.now() + 7 * 24 * 60 * 60 * 1000;

    revokedTokens.set(hashToken(token), expiresAt);
    cleanupRevokedTokens();
  }

  isTokenRevoked(token) {
    cleanupRevokedTokens();
    const expiresAt = revokedTokens.get(hashToken(token));
    return Boolean(expiresAt && expiresAt > Date.now());
  }

  async register(userData) {
    const { name, username, email, password, role } = userData;

    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    if (String(password).length < 8) {
      throw new Error("La contrasena debe tener al menos 8 caracteres");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    const finalUsername =
      (username && username.trim()) ||
      (name && name.trim()) ||        
      normalizedEmail.split("@")[0];              

    if (!finalUsername) {
      throw new Error("El nombre de usuario es requerido");
    }

    const user = await User.create({
      username: finalUsername,
      email: normalizedEmail,
      password,
      role: role === "admin" ? "admin" : "user",
      is_active: true,
    });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      where: { email: normalizedEmail, is_active: true },
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
    if (this.isTokenRevoked(token)) {
      throw new Error("Token revocado");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "auth" || !decoded.userId) {
      throw new Error("Token de autenticacion invalido");
    }

    const id = decoded.userId; 
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

    if (String(newPassword).length < 8) {
      throw new Error("La nueva contrasena debe tener al menos 8 caracteres");
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
