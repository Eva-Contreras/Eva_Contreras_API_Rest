import express from 'express';
import morgan from 'morgan';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import peliculasRouter from './router/peliculasRouter.js';

const app = express();
const port = 3000;
const accesos = fs.createWriteStream('./accesos.log', { flags: 'a' });
const metadataPath = './metadata.json';
const storage = multer.diskStorage({
    destination: 'uploads/',
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

morgan.token('local-date', () => {
    const fecha = new Date();
    const pad = valor => String(valor).padStart(2, '0');
    const offset = -fecha.getTimezoneOffset();
    const signo = offset >= 0 ? '+' : '-';
    const horasOffset = pad(Math.floor(Math.abs(offset) / 60));
    const minutosOffset = pad(Math.abs(offset) % 60);

    return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}:${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())} ${signo}${horasOffset}${minutosOffset}`;
});

const horarioLaboral = (req, res, next) => {
    const fecha = new Date();
    const dia = fecha.getDay();
    const hora = fecha.getHours();

    const esDiaLaboral = dia >= 1 && dia <= 5;
    const estaEnHorario = hora >= 7 && hora < 14;

    if (!esDiaLaboral || !estaEnHorario) {
        return res.status(503).json({
            mensaje: 'No se pueden ejecutar peticiones a esta hora'
        });
    }

    next();
};

// Estos son middlewares de aplicación que se ejecuta antes de las rutas
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(morgan(':remote-addr - :remote-user [:local-date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accesos }));
app.use(horarioLaboral);

app.get('/', (req, res) => {
    res.send('¡API de Películas funcionando!');
});

app.post("/subir", upload.single("archivo"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            mensaje: 'Debes enviar un archivo con el campo "archivo"'
        });
    }

    guardarMetadata(req.file);

    res.json({
        mensaje: `Archivo recibido`
    });
});

// Aquí se invocan las rutas
app.use('/peliculas', peliculasRouter);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});