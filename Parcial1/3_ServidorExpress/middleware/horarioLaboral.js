export const horarioLaboral = (req, res, next) => {
    const fecha = new Date();
    const dia = fecha.getDay();
    const hora = fecha.getHours();

    const esDiaLaboral = dia >= 1 && dia <= 5;
    const estaEnHorario = hora >= 6 && hora < 20;

    if (!esDiaLaboral || !estaEnHorario) {
        return res.status(503).json({
            mensaje: 'No se pueden ejecutar peticiones a esta hora'
        });
    }

    next();
};