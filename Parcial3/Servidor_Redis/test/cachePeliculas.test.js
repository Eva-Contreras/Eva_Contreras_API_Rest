import assert from 'node:assert/strict';
import test from 'node:test';
import {
    createCachePeliculasMiddleware,
    invalidatePeliculasCache
} from '../src/middleware/cachePeliculas.js';

function crearClienteRedis() {
    const valores = new Map();

    return {
        isReady: true,
        valores,
        async get(clave) {
            return valores.has(clave) ? valores.get(clave) : null;
        },
        async set(clave, valor, opciones) {
            valores.set(clave, valor);
            this.ultimaOpcionSet = opciones;
        },
        async incr(clave) {
            const valor = Number(valores.get(clave) || 0) + 1;
            valores.set(clave, String(valor));
            return valor;
        }
    };
}

function crearRequest(query = {}) {
    return {
        protocol: 'https',
        query,
        get(nombre) {
            return nombre === 'host' ? 'localhost:3000' : undefined;
        }
    };
}

function crearResponse(statusCode = 200) {
    return {
        statusCode,
        body: undefined,
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('guarda las respuestas exitosas durante 10 segundos y las reutiliza', async () => {
    const client = crearClienteRedis();
    const middleware = createCachePeliculasMiddleware(client);
    const respuesta = [{ id: 1, titulo: 'Inception' }];
    const primeraResponse = crearResponse();

    await middleware(crearRequest(), primeraResponse, () => {
        primeraResponse.json(respuesta);
    });

    assert.deepEqual(primeraResponse.body, respuesta);
    assert.deepEqual(client.ultimaOpcionSet, { EX: 10 });

    const segundaResponse = crearResponse();
    let continuoAlHandler = false;

    await middleware(crearRequest(), segundaResponse, () => {
        continuoAlHandler = true;
    });

    assert.deepEqual(segundaResponse.body, respuesta);
    assert.equal(continuoAlHandler, false);
});

test('usa claves distintas para filtros distintos e invalida versiones al crear películas', async () => {
    const client = crearClienteRedis();
    const middleware = createCachePeliculasMiddleware(client);

    for (const titulo of ['matrix', 'inception']) {
        const response = crearResponse();

        await middleware(crearRequest({ titulo }), response, () => {
            response.json([{ titulo }]);
        });
    }

    const clavesCache = [...client.valores.keys()].filter(clave =>
        clave.startsWith('peliculas-api:v1:list:0:')
    );

    assert.equal(clavesCache.length, 2);

    await invalidatePeliculasCache(client);

    const response = crearResponse();
    let continuoAlHandler = false;

    await middleware(crearRequest({ titulo: 'matrix' }), response, () => {
        continuoAlHandler = true;
    });

    assert.equal(continuoAlHandler, true);
});

test('continúa con la ruta si Redis no está listo o falla la lectura', async () => {
    let llamadasNext = 0;
    const middlewareSinConexion = createCachePeliculasMiddleware({
        isReady: false
    });

    await middlewareSinConexion(crearRequest(), crearResponse(), () => {
        llamadasNext += 1;
    });

    const middlewareConError = createCachePeliculasMiddleware({
        isReady: true,
        async get() {
            throw new Error('Redis no disponible');
        }
    });

    const consoleError = console.error;
    console.error = () => {};

    try {
        await middlewareConError(crearRequest(), crearResponse(), () => {
            llamadasNext += 1;
        });
    } finally {
        console.error = consoleError;
    }

    assert.equal(llamadasNext, 2);
});
