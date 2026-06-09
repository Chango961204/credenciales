import authService from "../services/auth.service.js";
import { createCsrfToken, signCsrfToken } from "../utils/csrf.js";

const getCookieOptions = (httpOnly) => ({
  httpOnly,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

const setTokenCookie = (res, token) => {
  const csrfToken = createCsrfToken();

  res.cookie("token", token, getCookieOptions(true));
  res.cookie("XSRF-TOKEN", csrfToken, getCookieOptions(false));
  res.cookie("XSRF-SIGNATURE", signCsrfToken(csrfToken), getCookieOptions(true));
};

const clearTokenCookie = (res) => {
  const options = {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.clearCookie("token", { ...options, httpOnly: true });
  res.clearCookie("XSRF-TOKEN", { ...options, httpOnly: false });
  res.clearCookie("XSRF-SIGNATURE", { ...options, httpOnly: true });
};

export const register = async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);

    // Auditoría: registro de usuario
    if (req.audit) {
      await req.audit({
        event: "register",
        model: "auth",
        modelId: String(user.id),
        oldValues: null,
        newValues: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    }

    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        name: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    const { user, token } = await authService.login(email, password);

    // Auditoría: login
    if (req.audit) {
      await req.audit({
        event: "login",
        model: "auth",
        modelId: String(user.id),
        oldValues: null,
        newValues: {
          userId: user.id,
          email: user.email,
        },
      });
    }

    setTokenCookie(res, token);

    res.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        email: user.email,
        name: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
 
    const u = req.user || {};
    res.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.username || u.name,
        role: u.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!req.user && token) {
      try {
        req.user = await authService.verifyToken(token);
      } catch {
        req.user = null;
      }
    }

    // Auditoría: logout
    if (req.user?.id && req.audit) {
      await req.audit({
        event: "logout",
        model: "auth",
        modelId: String(req.user.id),
        oldValues: { userId: req.user.id },
        newValues: null,
      });
    }

    authService.revokeToken(token);
    clearTokenCookie(res);

    res.json({
      success: true,
      message: "Logout exitoso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva contraseña son requeridas",
      });
    }

    const result = await authService.changePassword(
      req.user.id,
      oldPassword,
      newPassword
    );

    // Auditoría: cambio de contraseña
    if (req.audit) {
      await req.audit({
        event: "password_changed",
        model: "auth",
        modelId: String(req.user.id),
        oldValues: null,
        newValues: {
          userId: req.user.id,
          changedAt: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
