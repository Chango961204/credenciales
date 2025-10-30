import authService from "../services/auth.service.js";

export const register = async (req, res) => {
  console.log("Register request body:", req.body);
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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
    res.json({
      success: true,
      user: req.user,
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
    // Aquí puedes agregar lógica adicional como blacklist de tokens si lo necesitas
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