import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import peliculasRouter from './router/peliculasRouter.js';

const app = express();
const port = 3000;

const accesos = fs.createWriteStream('./accesos.log', { flags: 'a' });

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
app.use(morgan('combined', { stream: accesos }));
app.use(horarioLaboral);

app.get('/', (req, res) => {
    res.send('¡API de Películas funcionando!');
});

// Aquí se invocan las rutas
app.use('/peliculas', peliculasRouter);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});