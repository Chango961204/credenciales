import { api } from "./authService";

export async function imprimirEnZebra(frente, reverso) {
  try {
    const res = await api.post("/impresion", {
      frente,
      reverso,
    });
    return res.data;
  } catch (err) {
    console.error("Error al enviar a Zebra:", err);
    throw err;
  }
}
