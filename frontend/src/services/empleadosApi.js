import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const importarExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`${API_URL}/importar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const obtenerEmpleados = async (page = 1, limit = 10) => {
  const res = await axios.get(API_URL, {
    params: { page, limit },
    headers: { "Cache-Control": "no-cache" },
  });
  return res.data;
};

export const actualizarEstadoEmpleado = async (id, estado) => {
  const res = await axios.patch(`${API_URL}/${id}/estado`, { estado_qr: estado });
  return res.data;
};

export const buscarEmpleados = async (query) => {
  const res = await axios.get(`${API_URL}/search`, { params: query });
  return res.data;
};

export const generarQr = async (id) => {
  const res = await axios.post(`${API_URL}/${id}/generar-qr`);
  return res.data; 
};

export const buscarEmpleadoQR = async (qr) => {
  const res = await axios.get(`${API_URL}/qr/${qr}`);
  return res.data; 
};

export const obtenerEmpleadosPaginados = async (page, limit) => {
  const res = await axios.get(API_URL, { params: { page, limit } });
  return res.data;
};

export const buscarEmpleadoPorNombre = async (nombre) => {
  const res = await axios.get(`${API_URL}/empleados/buscar`, { params: { nombre } });
  return res.data;
};

export const updateEmpleado = async (id, data) => {
  const res = await axios.patch(`${API_URL}/${id}`, data);
  return res.data;
};



export const uploadFotoEmpleado = async (id, file) => {
  const formData = new FormData();
  formData.append("foto", file); 

  const res = await axios.post(`${API_URL}/${id}/foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getFotoEmpleado = (id) => `${API_URL}/${id}/foto`;
