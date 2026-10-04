import express from 'express';
import peliculasRouter from './router/peliculasRouter.js';
import { horarioLaboral } from './middleware/horarioLaboral.js';
import { accesos, morgan } from './middleware/logDeAccesos.js';
import { guardarMetadata, upload } from './middleware/subirArchivos.js';
import controlErrores from './middleware/controlErrores.js';
import { jwtAuth } from './middleware/jwtAuth.js';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Estos son middlewares de aplicación que se ejecuta antes de las rutas
app.use(express.json());
app.use(cookieParser());
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

app.post('/sesion', async (req, res) => {
    const { usuario, contrasena } = req.body ?? {};

    if (!process.env.JWT_SECRET || !process.env.JWT_USER || !process.env.JWT_PASSWORD_HASH) {
        return res.status(500).json({
            mensaje: 'La autenticación JWT no está configurada'
        });
    }

    if (typeof usuario !== 'string' || typeof contrasena !== 'string') {
        return res.status(400).json({ mensaje: 'Debes enviar usuario y contraseña' });
    }

    const contrasenaValida = await bcrypt.compare(
        contrasena,
        process.env.JWT_PASSWORD_HASH
    );

    if (usuario !== process.env.JWT_USER || !contrasenaValida) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
        { sub: usuario },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return res
        .cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000,
            path: '/',
        })
        .json({ mensaje: 'Sesión iniciada', expiraEn: '1h' });
});

app.post('/cerrar-sesion', (req, res) => {
    return res
        .clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        })
        .sendStatus(204);
});

app.post("/subir", jwtAuth, upload.single("archivo"), (req, res) => {
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
app.use('/peliculas', jwtAuth, peliculasRouter);

app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

app.use(controlErrores);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});