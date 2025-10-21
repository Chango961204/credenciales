import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; 

// 📂 Importar archivo Excel
export const importarExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await axios.post(`${API_URL}/api/empleados/importar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; 
};

// 📄 Obtener empleados (paginado)
export const obtenerEmpleados = async (page = 1, limit = 10) => {
  const res = await axios.get(`${API_URL}/api/empleados`, {
    params: { page, limit },
    headers: { "Cache-Control": "no-cache" },
  });
  return res.data;
};

// 🔄 Actualizar estado del empleado
export const actualizarEstadoEmpleado = async (id, estado) => {
  const res = await axios.patch(`${API_URL}/api/empleados/${id}/estado`, { estado_qr: estado });
  return res.data;
};

// 🔍 Buscar empleados (por número o nombre)
export const buscarEmpleados = async (query) => {
  const res = await axios.get(`${API_URL}/api/empleados/search`, { params: query });
  return res.data;
};

// 🧾 Generar QR
export const generarQr = async (id) => {
  const res = await axios.post(`${API_URL}/api/empleados/${id}/generar-qr`);
  return res.data; 
};

// 📱 Buscar empleado por QR (escaneo)
export const buscarEmpleadoQR = async (qr) => {
  const res = await axios.get(`${API_URL}/api/empleados/qr/${qr}`);
  return res.data; 
};

// 🧮 Obtener empleados paginados
export const obtenerEmpleadosPaginados = async (page, limit) => {
  const res = await axios.get(`${API_URL}/api/empleados`, { params: { page, limit } });
  return res.data;
};

// 🔎 Buscar empleado por nombre
export const buscarEmpleadoPorNombre = async (nombre) => {
  const res = await axios.get(`${API_URL}/api/empleados/buscar`, { params: { nombre } });
  return res.data;
};

// ✏️ Actualizar datos de un empleado
export const updateEmpleado = async (id, data) => {
  const res = await axios.patch(`${API_URL}/api/empleados/${id}`, data);
  return res.data;
};

// 📸 Subir foto del empleado
export const uploadFotoEmpleado = async (id, file) => {
  const formData = new FormData();
  formData.append("foto", file); 

  const res = await axios.post(`${API_URL}/api/empleados/${id}/foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🖼️ Obtener la foto del empleado
export const getFotoEmpleado = (id) => `${API_URL}/api/empleados/${id}/foto`;

// 🧑 Obtener empleado por ID
export const getEmpleadoById = async (id) => {
  const res = await axios.get(`${API_URL}/api/empleados/${id}`);
  return res.data;
};
