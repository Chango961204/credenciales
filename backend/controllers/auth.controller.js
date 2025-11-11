// backend/controllers/auth.controller.js
import authService from "../services/auth.service.js";

export const register = async (req, res) => {
  console.log("Register request body:", req.body);
  try {
    const { user, token } = await authService.register(req.body);

    // Auditoría: registro de usuario (lo hace un admin)
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

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user.id,
        email: user.email,
        // el front usa `name`, lo mapeamos desde username
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

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.username, // mapeo a name para el front
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
    // req.user viene de authMiddleware.verifyToken
    // y suele tener { id, email, username, role }
    const u = req.user || {};
    res.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.username || u.name, // el front sigue usando `name`
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
