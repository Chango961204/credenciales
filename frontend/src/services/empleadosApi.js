// src/services/empleadosApi.js
import { api } from "./authService"; // usa el instance con Bearer

export const importarExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/empleados/importar`, formData);
  return res.data;
};

export const obtenerEmpleados = async (page = 1, limit = 10) => {
  const res = await api.get(`/empleados`, { params: { page, limit } });
  return res.data;
};

export const actualizarEstadoEmpleado = async (id, estado) => {
  const res = await api.patch(`/empleados/${id}/estado`, { estado_qr: estado });
  return res.data;
};

export const buscarEmpleados = async (query) => {
  const res = await api.get(`/empleados/search`, { params: query });
  return res.data;
};

export const generarQr = async (id) => {
  const res = await api.get(`/empleados/${id}/credencial`);
  return res.data;
};

export const obtenerEmpleadosPaginados = async (page, limit) => {
  const res = await api.get(`/empleados`, { params: { page, limit } });
  return res.data;
};

export const buscarEmpleadoPorNombre = async (nombre) => {
  const res = await api.get(`/empleados/buscar`, { params: { nombre } });
  return res.data;
};

export const updateEmpleado = async (id, data) => {
  const res = await api.patch(`/empleados/${id}`, data);
  return res.data;
};

export const uploadFotoEmpleado = async (id, file) => {
  const formData = new FormData();
  formData.append("foto", file);
  const res = await api.post(`/empleados/${id}/foto`, formData);
  return res.data;
};

export const getFotoEmpleado = (id) =>
  `${import.meta.env.VITE_API_URL}/empleados/${id}`;

export const getEmpleadoById = async (id) => {
  const res = await api.get(`/empleados/${id}`);
  return res.data;
};
