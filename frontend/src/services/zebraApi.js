import axios from "axios";

export async function imprimirEnZebra(imageUrl) {
  try {
    const res = await axios.post("http://localhost:4000/zebra/print", {
      imageUrl,
    });
    return res.data;
  } catch (err) {
    console.error("Error al enviar a Zebra:", err);
    throw err;
  }
}
