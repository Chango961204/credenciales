import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://credenciales.capitaldezacatecas.gob.mx/api';
const LEGACY_AUTH_STORAGE_KEYS = [
  "token",
  "authToken",
  "accessToken",
  "refreshToken",
  "user",
  "authUser",
];

export const clearLegacyAuthStorage = () => {
  if (typeof window === "undefined") return;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      storage.removeItem(key);
    }
  }
};

clearLegacyAuthStorage();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const xsrfCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="));
    if (xsrfCookie) {
      const token = xsrfCookie.split("=")[1];
      config.headers["X-XSRF-TOKEN"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class AuthService {
  async login(email, password) {
    try {
      clearLegacyAuthStorage();

      if (!email || !password) {
        throw new Error("Email y contraseña son requeridos");
      }

      const response = await api.post("/auth/login", { email, password });

      return response.data;
    } catch (error) {
      const errorData = error.response?.data || { message: "Error al iniciar sesión" };
      console.error("Login error:", errorData);
      throw errorData;
    }
  }

  async register(userData) {
    try {
      clearLegacyAuthStorage();

      if (!userData.email || !userData.password) {
        throw new Error("Email y contraseña son requeridos");
      }

      const response = await api.post("/auth/register", userData);

      return response.data;
    } catch (error) {
      const errorData = error.response?.data || { message: "Error al registrar usuario" };
      console.error("Register error:", errorData);
      throw errorData;
    }
  }

  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuario' };
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar contraseña' };
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // fallo silencioso
    } finally {
      clearLegacyAuthStorage();
    }
  }


}

export default new AuthService();
export { api };
