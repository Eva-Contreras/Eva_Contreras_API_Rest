import Joi from 'joi';

const peliculaSchema = Joi.object({
    titulo: Joi.string().trim().min(1).max(255).required(),
    director: Joi.string().trim().min(1).max(150).required(),
    anio: Joi.number().integer().positive().max(2147483647).required()
}).unknown(false);

export function validarPelicula(req, res, next) {
    const { error, value } = peliculaSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({
            mensaje: 'Los datos de la película no son válidos',
            detalles: error.details.map(detalle => detalle.message)
        });
    }

    req.body = value;
    next();
}