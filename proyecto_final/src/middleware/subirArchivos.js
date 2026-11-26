import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const enVercel = Boolean(process.env.VERCEL);
const metadataPath = enVercel ? path.join(os.tmpdir(), 'metadata.json') : './metadata.json';

const storage = multer.diskStorage({
    destination: enVercel ? os.tmpdir() : 'uploads/',
    filename: (req, file, callback) => {
        callback(null, path.basename(file.originalname));
    }
});
const upload = multer({ storage });

const obtenerFechaLocal = () => new Date().toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'medium'
});

const guardarMetadata = archivo => {
    let archivos = [];

    if (fs.existsSync(metadataPath)) {
        const contenido = fs.readFileSync(metadataPath, 'utf8');
        archivos = contenido ? JSON.parse(contenido) : [];
    }

    archivos.push({
        nombre: archivo.filename,
        tipo: archivo.mimetype,
        tamaño: archivo.size,
        fechaSubida: obtenerFechaLocal(),
    });

    fs.writeFileSync(metadataPath, JSON.stringify(archivos, null, 2));
};

export { guardarMetadata, upload };
