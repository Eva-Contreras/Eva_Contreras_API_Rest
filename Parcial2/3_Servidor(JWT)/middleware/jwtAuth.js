import jwt from 'jsonwebtoken';

export function jwtAuth(req, res, next) {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		return res.status(500).json({
			mensaje: 'La autenticación JWT no está configurada'
		});
	}

	const token = req.cookies?.jwt;

	if (!token) {
		return res
			.status(401)
			.json({ mensaje: 'Inicia sesión para continuar' });
	}

	try {
		req.usuario = jwt.verify(token, secret);
		return next();
	} catch {
		return res
			.status(401)
			.json({ mensaje: 'Token inválido o vencido' });
	}
}
