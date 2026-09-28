export function authMiddleware(req, res, next) {
    const authorization = req.get('authorization') ?? '';
    const match = authorization.match(/^Bearer\s+(.+)$/i);

    if (!match || match[1] !== process.env.API_TOKEN) {
        return res
            .status(401)
            .set('WWW-Authenticate', 'Bearer')
            .json({ mensaje: 'Token inválido o faltante' });
    }

    next();
}