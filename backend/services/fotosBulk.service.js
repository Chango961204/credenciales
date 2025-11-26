import fs from "fs";
import path from "path";
import sharp from "sharp";
import Empleado from "../models/Empleados.js";

const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) files = files.concat(walk(full));
        else files.push(full);
    }
    return files;
}

const getNumFromFilename = (filename) => {
    const base = path.basename(filename, path.extname(filename));
    const m = String(base).match(/\d+/); // toma el primer número
    if (!m) return null;
    const n = Number(m[0]);
    return Number.isFinite(n) ? String(n) : null;
};

export async function syncFotosDesdeCarpeta({
    sourceDir,
    destDir,
    overwrite = false,
    deleteSource = false,
    auditFn = null,
}) {
    if (!fs.existsSync(sourceDir)) throw new Error(`No existe sourceDir: ${sourceDir}`);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const empleados = await Empleado.findAll({ attributes: ["id", "num_trab", "foto_path"] });
    const map = new Map();
    for (const e of empleados) map.set(String(Number(e.num_trab)), e);

    const allFiles = walk(sourceDir).filter((f) =>
        IMG_EXTS.has(path.extname(f).toLowerCase())
    );

    const result = {
        totalArchivos: allFiles.length,
        actualizadas: 0,
        sinEmpleado: [],
        omitidasPorYaTenerFoto: [],
        errores: [],
    };

    for (const filePath of allFiles) {
        try {
            const numTrab = getNumFromFilename(path.basename(filePath));
            if (!numTrab) continue;

            const emp = map.get(numTrab);
            if (!emp) {
                result.sinEmpleado.push({ file: path.basename(filePath), numTrab });
                continue;
            }

            if (!overwrite && emp.foto_path) {
                result.omitidasPorYaTenerFoto.push({
                    empleadoId: emp.id,
                    numTrab,
                    foto_path: emp.foto_path,
                });
                continue;
            }

            const finalFilename = `${numTrab}.png`;
            const finalPath = path.join(destDir, finalFilename);

            await sharp(filePath)
                .rotate()
                .resize(500, 500, { fit: "cover" })
                .png()
                .toFile(finalPath);

            const before = { foto_path: emp.foto_path || null };

            await Empleado.update({ foto_path: finalFilename }, { where: { id: emp.id } });

            if (auditFn) {
                await auditFn({
                    event: "updated",
                    model: "empleados",
                    modelId: String(emp.id),
                    oldValues: before,
                    newValues: { foto_path: finalFilename },
                });
            }

            if (deleteSource) {
                fs.unlinkSync(filePath);
            }

            result.actualizadas++;
        } catch (err) {
            result.errores.push({ file: path.basename(filePath), error: err.message });
        }
    }

    return result;
}
