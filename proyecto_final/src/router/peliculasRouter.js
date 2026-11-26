import express from 'express';
import halson from 'halson';
import { validarPelicula } from '../middleware/validarMiddleware.js';
import {
    actualizarPelicula,
    buscarPelicula,
    crearPelicula,
    eliminarPelicula,
    listarPeliculas
} from '../services/peliculasService.js';

const router = express.Router();

// Helper para formatear la respuesta con HALSON
const formatearPelicula = (req, pelicula) => ({
    ...halson(pelicula),
    link: `${req.protocol}://${req.get('host')}${req.baseUrl}/${pelicula.id}`
});

// Helper para validar el ID numérico de la URL
const parsearId = (paramId) => {
    const id = parseInt(paramId, 10);
    if (Number.isNaN(id)) {
        const error = new Error('El id de la película debe ser un número válido');
        error.statusCode = 400;
        throw error;
    }
    return id;
};

/**
 * @swagger
 * /peliculas/:
 *   post:
 *     tags:
 *       - Películas
 *     summary: Registrar una nueva película
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PeliculaInput'
 *     responses:
 *       '201':
 *         description: Película creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pelicula'
 *       '400':
 *         description: Datos de entrada inválidos.
 *       '401':
 *         description: API key inválida o faltante.
 */
router.post('/', validarPelicula, async (req, res, next) => {
    try {
        const nuevaPelicula = await crearPelicula(req.body);
        res.status(201).json(formatearPelicula(req, nuevaPelicula));
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /peliculas/:
 *   get:
 *     tags:
 *       - Películas
 *     summary: Listar y filtrar películas
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
 *       '404':
 *         description: No se encontraron películas.
 */
router.get('/', async (req, res, next) => {
    try {
        const resultado = await listarPeliculas(req.query);

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'Película no encontrada'
            });
        }

        const respuesta = resultado.map(p => formatearPelicula(req, p));
        res.json(respuesta);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /peliculas/{id}:
 *   get:
 *     tags:
 *       - Películas
 *     summary: Buscar película por ID
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
 *       '404':
 *         description: Película no encontrada.
 */
router.get('/:id', async (req, res, next) => {
    try {
        const id = parsearId(req.params.id);
        const pelicula = await buscarPelicula(id);

        if (!pelicula) {
            const error = new Error('Película no encontrada');
            error.statusCode = 404;
            return next(error);
        }

        res.json(formatearPelicula(req, pelicula));
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /peliculas/{id}:
 *   put:
 *     tags:
 *       - Películas
 *     summary: Actualizar una película existente
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PeliculaInput'
 *     responses:
 *       '200':
 *         description: Película actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pelicula'
 *       '400':
 *         description: ID o datos inválidos.
 *       '404':
 *         description: Película no encontrada.
 */
router.put('/:id', validarPelicula, async (req, res, next) => {
    try {
        const id = parsearId(req.params.id);
        const actualizada = await actualizarPelicula(id, req.body);

        if (!actualizada) {
            const error = new Error('Película no encontrada');
            error.statusCode = 404;
            return next(error);
        }

        res.json(formatearPelicula(req, actualizada));
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /peliculas/{id}:
 *   delete:
 *     tags:
 *       - Películas
 *     summary: Eliminar una película por ID
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: Película eliminada correctamente (sin contenido).
 *       '400':
 *         description: El ID no es un número válido.
 *       '404':
 *         description: Película no encontrada.
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const id = parsearId(req.params.id);
        const eliminada = await eliminarPelicula(id);

        if (!eliminada) {
            const error = new Error('Película no encontrada');
            error.statusCode = 404;
            return next(error);
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;

/**
 * @swagger
 * tags:
 *   - name: Películas
 *     description: Consulta, creación, actualización y eliminación de películas.
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *       description: Usa el valor configurado en la variable de entorno API_KEY.
 *   schemas:
 *     PeliculaInput:
 *       type: object
 *       required:
 *         - titulo
 *         - director
 *         - anio
 *       properties:
 *         titulo:
 *           type: string
 *           example: Dune
 *         director:
 *           type: string
 *           example: Denis Villeneuve
 *         anio:
 *           type: integer
 *           example: 2021
 *     Pelicula:
 *       allOf:
 *         - $ref: '#/components/schemas/PeliculaInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             link:
 *               type: string
 *               format: uri
 *               example: https://localhost:3000/peliculas/1
 *     Error:
 *       type: object
 *       required:
 *         - mensaje
 *       properties:
 *         mensaje:
 *           type: string
 *           example: Película no encontrada
 */