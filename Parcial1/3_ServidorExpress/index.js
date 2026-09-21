import express from 'express';
import peliculasRouter from './router/peliculasRouter.js';
import { horarioLaboral } from './middleware/horarioLaboral.js';
import { accesos, morgan } from './middleware/logDeAccesos.js';
import { guardarMetadata, upload } from './middleware/subirArchivos.js';
import controlErrores from './middleware/controlErrores.js';

const app = express();
const port = 3000;

// Estos son middlewares de aplicación que se ejecuta antes de las rutas
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(morgan(':remote-addr - :remote-user [:local-date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accesos }));
app.use(horarioLaboral);

// Vistas
app.set('view engine', 'pug');
app.set('views', './views');

app.get('/',(req,res,next) => {
    res.render('hola', 
        {   
            titulo1: '¡API de Películas funcionando!', 
            mensaje: 'Hecho por: Eva Contreras',
            titulo2: 'Rutas de consulta:',
            ruta1: 'GET /peliculas',
        });
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

app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

app.use(controlErrores);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});