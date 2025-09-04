import axios from "axios";

const API_URL = "http://localhost:4000/api/empleados";

export const importarExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`${API_URL}/import`, formData);
};
export const obtenerEmpleados = async (page = 1, limit = 10) => {
  const res = await axios.get("http://localhost:4000/api/empleados", {
    params: { page, limit },
    headers: { "Cache-Control": "no-cache" }
  });
  return res.data;
};
