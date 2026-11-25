import express from 'express';
import halson from 'halson';
import { validarPelicula } from '../middleware/validarMiddleware.js';
import { buscarPelicula, crearPelicula, listarPeliculas } from '../services/peliculasService.js';

const router = express.Router();

router.post('/', validarPelicula, async (req, res) => {
    const pelicula = await crearPelicula(req.body);

    res.status(201).json({
        ...halson(pelicula),
        link: `${req.protocol}://${req.get('host')}${req.baseUrl}/${pelicula.id}`
    });
});

/**
 * @swagger
 * /peliculas/:
 *   get:
 *     tags:
 *       - Películas
 *     summary: Listar y filtrar películas
 *     description: |
 *       ### cURL
 *       ```bash
 *       curl -k "https://localhost:3000/peliculas/?titulo=matrix" -H "x-api-key: TU_API_KEY"
 *       ```
 *
 *       ### JavaScript
 *       ```js
 *       fetch("https://localhost:3000/peliculas/?titulo=matrix", {
 *         headers: { "x-api-key": "TU_API_KEY" }
 *       })
 *         .then((respuesta) => respuesta.json())
 *         .then((peliculas) => console.log(peliculas));
 *       ```
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: titulo
 *         in: query
 *         schema:
 *           type: string
 *         example: matrix
 *       - name: director
 *         in: query
 *         schema:
 *           type: string
 *         example: nolan
 *       - name: anio
 *         in: query
 *         schema:
 *           type: integer
 *         example: 2010
 *     responses:
 *       '200':
 *         description: Lista de películas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pelicula'
 *       '401':
 *         description: API key inválida o faltante.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: No se encontraron películas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '503':
 *         description: Fuera del horario de servicio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    const resultado = await listarPeliculas(req.query);

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

/**
 * @swagger
 * /peliculas/{id}:
 *   get:
 *     tags:
 *       - Películas
 *     summary: Buscar película por ID
 *     description: |
 *       ### cURL
 *       ```bash
 *       curl -k "https://localhost:3000/peliculas/1" -H "x-api-key: TU_API_KEY"
 *       ```
 *
 *       ### JavaScript
 *       ```js
 *       fetch("https://localhost:3000/peliculas/1", {
 *         headers: { "x-api-key": "TU_API_KEY" }
 *       })
 *         .then((respuesta) => respuesta.json())
 *         .then((pelicula) => console.log(pelicula));
 *       ```
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Película encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pelicula'
 *       '400':
 *         description: El ID no es un número válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: API key inválida o faltante.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Película no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '503':
 *         description: Fuera del horario de servicio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res, next) => {

    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        const error = new Error(
            'El id de la película debe ser un número válido'
        );

        error.statusCode = 400;

        return next(error);
    }

    const pelicula = await buscarPelicula(id);

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

/**
 * @swagger
 * tags:
 *   - name: Películas
 *     description: Consulta, filtrado y búsqueda de películas.
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *       description: Usa el valor configurado en la variable de entorno API_KEY.
 *   schemas:
 *     Pelicula:
 *       type: object
 *       required:
 *         - id
 *         - titulo
 *         - director
 *         - anio
 *         - link
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: Inception
 *         director:
 *           type: string
 *           example: Christopher Nolan
 *         anio:
 *           type: integer
 *           example: 2010
 *         link:
 *           type: string
 *           format: uri
 *           example: https://localhost:3000/peliculas/1
 *     Error:
 *       type: object
 *       required:
 *         - mensaje
 *       properties:
 *         mensaje:
 *           type: string
 *           example: Película no encontrada
 */
