import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import peliculasRouter from './router/peliculasRouter.js';

const app = express();
const port = 3000;

const accesos = fs.createWriteStream('./accesos.log', { flags: 'a' });

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
    const estaEnHorario = hora >= 8 && hora < 15;

    if (!esDiaLaboral || !estaEnHorario) {
        return res.status(503).json({
            mensaje: 'No se pueden ejecutar peticiones a esta hora'
        });
    }

    next();
};

// Estos son middlewares de aplicación que se ejecuta antes de las rutas
app.use(express.json());
app.use(morgan(':remote-addr - :remote-user [:local-date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accesos }));
app.use(horarioLaboral);

app.get('/', (req, res) => {
    res.send('¡API de Películas funcionando!');
});

// Aquí se invocan las rutas
app.use('/peliculas', peliculasRouter);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});