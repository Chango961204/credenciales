import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { fileURLToPath } from "url";
import { syncFotosDesdeCarpeta } from "../services/fotosBulk.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const syncFotosEmpleados = async (req, res) => {
    try {
        const sourceDir = path.join(__dirname, "../uploads/fotosBulk");
        const destDir = path.join(__dirname, "../uploads/fotosEmpleados");

        const overwrite = req.body?.overwrite === true || req.body?.overwrite === "true";
        const deleteSource = req.body?.deleteSource === true || req.body?.deleteSource === "true";

        const result = await syncFotosDesdeCarpeta({
            sourceDir,
            destDir,
            overwrite,
            deleteSource,
            auditFn: req.audit ? (p) => req.audit(p) : null,
        });

        res.json({ message: "Sincronización terminada", ...result });
    } catch (e) {
        console.error("syncFotosEmpleados:", e);
        res.status(500).json({ message: e.message });
    }
};

export const importarFotosZip = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo .zip" });
        }

        const overwrite = req.body?.overwrite === true || req.body?.overwrite === "true";
        const deleteSource = req.body?.deleteSource === true || req.body?.deleteSource === "true";

        const uploadsRoot = path.join(__dirname, "../uploads");
        const tmpZipPath = req.file.path;

        const batchDir = path.join(uploadsRoot, "fotosBulk", `batch_${Date.now()}`);
        const destDir = path.join(uploadsRoot, "fotosEmpleados");

        fs.mkdirSync(batchDir, { recursive: true });
        fs.mkdirSync(destDir, { recursive: true });

        await fs
            .createReadStream(tmpZipPath)
            .pipe(unzipper.Extract({ path: batchDir }))
            .promise();

        fs.unlinkSync(tmpZipPath);

        const result = await syncFotosDesdeCarpeta({
            sourceDir: batchDir,
            destDir,
            overwrite,
            deleteSource: true, // borra extraídas
            auditFn: req.audit ? (p) => req.audit(p) : null,
        });

        fs.rmSync(batchDir, { recursive: true, force: true });

        res.json({ message: "Importación de fotos terminada", ...result });
    } catch (e) {
        console.error("importarFotosZip:", e);
        res.status(500).json({ message: e.message });
    }
};
