import express from 'express';

const router = express.Router();

const peliculas = [
    { id: 1, titulo: "Inception", director: "Christopher Nolan", anio: 2010 },
    { id: 2, titulo: "Interstellar", director: "Christopher Nolan", anio: 2014 },
    { id: 3, titulo: "TinkerBell", director: "Bradley Raymond", anio: 2008 },
    { id: 4, titulo: "The Matrix", director: "Wachowski Sisters", anio: 1999 }
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

    res.json(resultado);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const pelicula = peliculas.find(p => p.id === id);

    if (pelicula) {
        res.json(pelicula);
    } else {
        res.status(404).json({
            mensaje: "Película no encontrada"
        });
    }
});

export default router;