import express from 'express';
import halson from 'halson';

const router = express.Router();

const peliculas = [
    { id: 1, titulo: "Inception", director: "Christopher Nolan", anio: 2010 },
    { id: 2, titulo: "Interstellar", director: "Christopher Nolan", anio: 2014 },
    { id: 3, titulo: "TinkerBell", director: "Bradley Raymond", anio: 2008 },
    { id: 4, titulo: "The Matrix", director: "Wachowski Sisters", anio: 1999 },
    { id: 5, titulo: "Gladiator", director: "Ridley Scott", anio: 2000 },
    { id: 6, titulo: "Snoopy y Charlie Brown: La pelicula", director: "Steve Martino", anio: 2015 }
];

router.get('/', (req, res) => {

    let resultado = peliculas;

    if (req.query.titulo) {
        resultado = resultado.filter(
            p => p.titulo.toLowerCase().includes(req.query.titulo.toLowerCase())
        );
    }

    if (req.query.director) {
        resultado = resultado.filter(
            p => p.director.toLowerCase().includes(req.query.director.toLowerCase())
        );
    }

    if (req.query.anio) {
        resultado = resultado.filter(
            p => p.anio === parseInt(req.query.anio)
        );
    }

    if (resultado.length === 0) {
        return res.status(404).json({
            mensaje: "Película no encontrada"
        });
    }

    const respuesta = resultado.map(pelicula => ({
        ...halson(pelicula),
        link: `${req.protocol}://${req.get('host')}${req.baseUrl}/${pelicula.id}`
    }));

    res.json(respuesta);
});

router.get('/:id', (req, res, next) => {

    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        const error = new Error(
            'El id de la película debe ser un número válido'
        );

        error.statusCode = 400;

        return next(error);
    }

    const pelicula = peliculas.find(p => p.id === id);

    if (pelicula) {
        const respuesta = {
            ...halson(pelicula),
            link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
        };

        return res.json(respuesta);
    }

    const error = new Error('Película no encontrada');

    error.statusCode = 404;

    return next(error);
});

export default router;
