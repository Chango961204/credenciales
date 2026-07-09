import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { fileURLToPath } from "url";
import { Transform } from "stream";
import { pipeline } from "stream/promises";
import { syncFotosDesdeCarpeta } from "../services/fotosBulk.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_ZIP_ENTRIES = 5000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_EXTRACTED_BYTES = 200 * 1024 * 1024;

async function extractImagesFromZip(zipPath, batchDir) {
    const directory = await unzipper.Open.file(zipPath);
    const fileEntries = directory.files.filter((entry) => entry.type !== "Directory");

    if (fileEntries.length > MAX_ZIP_ENTRIES) {
        throw new Error(`El ZIP excede el limite de ${MAX_ZIP_ENTRIES} archivos`);
    }

    const root = path.resolve(batchDir);
    let totalExtracted = 0;

    for (const entry of directory.files) {
        const entryPath = String(entry.path || "").replace(/\\/g, "/");
        if (!entryPath || entryPath.split("/").includes("..") || path.isAbsolute(entryPath)) {
            throw new Error("El ZIP contiene rutas invalidas");
        }

        if (entry.type === "Directory") continue;

        const ext = path.extname(entryPath).toLowerCase();
        if (!IMG_EXTS.has(ext)) continue;

        const targetPath = path.resolve(root, entryPath);
        if (!targetPath.startsWith(`${root}${path.sep}`)) {
            throw new Error("El ZIP contiene rutas fuera del directorio permitido");
        }

        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        let imageBytes = 0;
        const limitStream = new Transform({
            transform(chunk, encoding, callback) {
                imageBytes += chunk.length;
                totalExtracted += chunk.length;

                if (imageBytes > MAX_IMAGE_BYTES) {
                    callback(new Error("Una imagen del ZIP excede 10MB"));
                    return;
                }

                if (totalExtracted > MAX_EXTRACTED_BYTES) {
                    callback(new Error("El ZIP excede el limite total descomprimido"));
                    return;
                }

                callback(null, chunk);
            },
        });

        await pipeline(entry.stream(), limitStream, fs.createWriteStream(targetPath));
    }
}

export const syncFotosEmpleados = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "No tienes permisos para sincronizar fotos" });
        }

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
    let tmpZipPath = null;
    let batchDir = null;

    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "No tienes permisos para importar fotos" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo .zip" });
        }

        // Validar que sea un archivo ZIP
        if (!req.file.mimetype.includes("zip") && !req.file.originalname.endsWith(".zip")) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "El archivo debe ser un ZIP válido" });
        }

        const overwrite = req.body?.overwrite === true || req.body?.overwrite === "true";
        const deleteSource = req.body?.deleteSource === true || req.body?.deleteSource === "true";

        const uploadsRoot = path.join(__dirname, "../uploads");
        tmpZipPath = req.file.path;

        batchDir = path.join(uploadsRoot, "fotosBulk", `batch_${Date.now()}`);
        const destDir = path.join(uploadsRoot, "fotosEmpleados");

        fs.mkdirSync(batchDir, { recursive: true });
        fs.mkdirSync(destDir, { recursive: true });

        await extractImagesFromZip(tmpZipPath, batchDir);

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
        if (tmpZipPath && fs.existsSync(tmpZipPath)) {
            fs.rmSync(tmpZipPath, { force: true });
        }
        if (batchDir && fs.existsSync(batchDir)) {
            fs.rmSync(batchDir, { recursive: true, force: true });
        }
        console.error("importarFotosZip:", e);
        res.status(500).json({ message: e.message });
    }
};
