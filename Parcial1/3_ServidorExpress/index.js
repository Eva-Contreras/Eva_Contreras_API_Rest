import express from 'express';
import peliculasRouter from './router/peliculasRouter.js';

const app = express();

const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('¡API de Películas funcionando!');
});

app.use('/peliculas', peliculasRouter);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});