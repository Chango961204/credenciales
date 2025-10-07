import path from "path";
import { fileURLToPath } from "url";
import { generarCredencialFiles } from "../services/credenciales.service.js";
import fs from "fs";
import Empleado from "../models/Empleados.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generarCredencial = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id);

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleadoData = empleado.toJSON();
    const result = await generarCredencialFiles(empleadoData);

    res.json({
      frenteUrl: result.frenteDataUrl,
      reversoUrl: result.reversoDataUrl,
    });
  } catch (err) {
    console.error("Error generarCredencialController:", err);
    res.status(500).json({ 
      message: "Error generando credencial", 
      detail: err.message 
    });
  }  
};


