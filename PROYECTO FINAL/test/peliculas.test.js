import { expect, use } from 'chai';
import chaiHttp, { request } from 'chai-http';
import test from 'node:test';
import app from '../src/index.js';

use(chaiHttp);

const apiKey = 'clave-de-prueba';

const prepararSolicitud = (t) => {
    const apiKeyAnterior = process.env.API_KEY;
    process.env.API_KEY = apiKey;
    t.after(() => {
        if (apiKeyAnterior === undefined) {
            delete process.env.API_KEY;
        } else {
            process.env.API_KEY = apiKeyAnterior;
        }
    });
    t.mock.timers.enable({
        apis: ['Date'],
        now: new Date(2026, 10, 2, 12)
    });
};

test('GET /peliculas devuelve la lista de películas', async (t) => {
    prepararSolicitud(t);

    const respuesta = await request.execute(app)
        .get('/peliculas')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(200);
    expect(respuesta).to.be.json;
    expect(respuesta.body).to.be.an('array').that.is.not.empty;
    expect(respuesta.body.map((pelicula) => pelicula.titulo))
        .to.include('Inception');
});

test('GET /peliculas filtra por director', async (t) => {
    prepararSolicitud(t);

    const respuesta = await request.execute(app)
        .get('/peliculas?director=nolan')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(200);
    expect(respuesta.body.map((pelicula) => pelicula.titulo))
        .to.have.members(['Inception', 'Interstellar']);
});

test('GET /peliculas/:id devuelve la película solicitada', async (t) => {
    prepararSolicitud(t);

    const respuesta = await request.execute(app)
        .get('/peliculas/1')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(200);
    expect(respuesta.body).to.include({
        id: 1,
        titulo: 'Inception',
        director: 'Christopher Nolan',
        anio: 2010
    });
});

test('GET /peliculas/:id rechaza una solicitud sin API key', async (t) => {
    prepararSolicitud(t);

    const respuesta = await request.execute(app)
        .get('/peliculas/1');

    expect(respuesta).to.have.status(401);
    expect(respuesta.body).to.deep.equal({
        mensaje: 'API key inválida o faltante'
    });
});
