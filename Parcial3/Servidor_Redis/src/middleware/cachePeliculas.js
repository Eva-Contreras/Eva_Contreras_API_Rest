import { redisClient } from '../services/redisClient.js';

const CACHE_VERSION_KEY = 'peliculas-api:v1:list:version';
const CACHE_TTL_SECONDS = 60;
const FILTER_NAMES = ['titulo', 'director', 'anio'];

function crearClaveCache(req, version) {
    const filtros = {};

    for (const nombre of FILTER_NAMES) {
        const valor = req.query[nombre];

        if (typeof valor !== 'string' || valor === '') {
            if (valor !== undefined && valor !== '') {
                return null;
            }

            continue;
        }

        if (nombre === 'anio') {
            filtros[nombre] = Number.parseInt(valor, 10);
        } else {
            filtros[nombre] = valor.toLowerCase();
        }
    }

    return `peliculas-api:v1:list:${version}:${req.protocol}:${req.get('host')}:${JSON.stringify(filtros)}`;
}

export function createCachePeliculasMiddleware(client = redisClient) {
    return async function cachePeliculas(req, res, next) {
        if (!client || !client.isReady) {
            return next();
        }

        try {
            const version = (await client.get(CACHE_VERSION_KEY)) || '0';
            const cacheKey = crearClaveCache(req, version);

            if (!cacheKey) {
                return next();
            }

            const cachedResponse = await client.get(cacheKey);

            if (cachedResponse !== null) {
                return res.json(JSON.parse(cachedResponse));
            }

            const sendJson = res.json.bind(res);

            res.json = (body) => {
                if (res.statusCode === 200) {
                    client
                        .set(cacheKey, JSON.stringify(body), {
                            EX: CACHE_TTL_SECONDS
                        })
                        .catch((error) => {
                            console.error('No se pudo guardar la caché de películas:', error);
                        });
                }

                return sendJson(body);
            };

            return next();
        } catch (error) {
            console.error('No se pudo consultar la caché de películas:', error);
            return next();
        }
    };
}

export async function invalidatePeliculasCache(client = redisClient) {
    if (!client || !client.isReady) {
        return;
    }

    try {
        await client.incr(CACHE_VERSION_KEY);
    } catch (error) {
        console.error('No se pudo invalidar la caché de películas:', error);
    }
}
