import { expect, use } from 'chai';
import chaiHttp, { request } from 'chai-http';
import test from 'node:test';
import app from '../src/index.js';
import conexion from '../src/database/conexion.js';

use(chaiHttp);

const apiKey = 'clave-de-prueba';
const inception = { id: 1, titulo: 'Inception', director: 'Christopher Nolan', anio: 2010 };
const interstellar = { id: 2, titulo: 'Interstellar', director: 'Christopher Nolan', anio: 2014 };

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
    t.mock.method(conexion, 'execute', async () => [[inception, interstellar]]);

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
    const consulta = t.mock.method(conexion, 'execute', async () => [[inception, interstellar]]);

    const respuesta = await request.execute(app)
        .get('/peliculas?director=nolan')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(200);
    expect(respuesta.body.map((pelicula) => pelicula.titulo))
        .to.have.members(['Inception', 'Interstellar']);
    expect(consulta.mock.calls[0].arguments[1]).to.deep.equal(['nolan']);
});

test('GET /peliculas/:id devuelve la película solicitada', async (t) => {
    prepararSolicitud(t);
    t.mock.method(conexion, 'execute', async () => [[inception]]);

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

test('POST /peliculas guarda los datos y devuelve el ID generado', async (t) => {
    prepararSolicitud(t);
    const consulta = t.mock.method(conexion, 'execute', async () => [{ insertId: 7 }]);

    const respuesta = await request.execute(app)
        .post('/peliculas')
        .set('x-api-key', apiKey)
        .send({ titulo: ' Arrival ', director: 'Denis Villeneuve', anio: 2016 });

    expect(respuesta).to.have.status(201);
    expect(respuesta.body).to.include({
        id: 7, titulo: 'Arrival', director: 'Denis Villeneuve', anio: 2016
    });
    expect(respuesta.body.link).to.match(/\/peliculas\/7$/);
    expect(consulta.mock.calls[0].arguments[1])
        .to.deep.equal(['Arrival', 'Denis Villeneuve', 2016]);
});

test('GET /peliculas combina filtros sin interpolar sus valores', async (t) => {
    prepararSolicitud(t);
    const consulta = t.mock.method(conexion, 'execute', async () => [[]]);

    const respuesta = await request.execute(app)
        .get('/peliculas')
        .query({ titulo: "a%' OR 1=1", director: 'Nolan', anio: '2010' })
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(404);
    expect(consulta.mock.calls[0].arguments[0]).not.to.include("a%' OR 1=1");
    expect(consulta.mock.calls[0].arguments[1]).to.deep.equal(["a%' OR 1=1", 'Nolan', 2010]);
});

test('GET /peliculas/:id informa si no existe', async (t) => {
    prepararSolicitud(t);
    t.mock.method(conexion, 'execute', async () => [[]]);

    const respuesta = await request.execute(app)
        .get('/peliculas/999')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(404);
    expect(respuesta.body.mensaje).to.equal('Película no encontrada');
});

test('POST /peliculas rechaza datos que no caben en la tabla', async (t) => {
    prepararSolicitud(t);
    const consulta = t.mock.method(conexion, 'execute', async () => []);

    const respuesta = await request.execute(app)
        .post('/peliculas')
        .set('x-api-key', apiKey)
        .send({ titulo: 'a'.repeat(256), director: 'Director', anio: 2016 });

    expect(respuesta).to.have.status(400);
    expect(consulta.mock.callCount()).to.equal(0);
});

test('GET /peliculas comunica errores de la base de datos', async (t) => {
    prepararSolicitud(t);
    t.mock.method(conexion, 'execute', async () => {
        throw new Error('Error de prueba de base de datos');
    });

    const respuesta = await request.execute(app)
        .get('/peliculas')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(500);
});

test('PUT /peliculas/:id actualiza y devuelve la película', async (t) => {
    prepararSolicitud(t);
    const consulta = t.mock.method(conexion, 'execute', async () => [{ affectedRows: 1 }]);

    const respuesta = await request.execute(app)
        .put('/peliculas/1')
        .set('x-api-key', apiKey)
        .send({ titulo: ' Arrival ', director: 'Denis Villeneuve', anio: 2016 });

    expect(respuesta).to.have.status(200);
    expect(respuesta.body).to.include({
        id: 1, titulo: 'Arrival', director: 'Denis Villeneuve', anio: 2016
    });
    expect(respuesta.body.link).to.match(/\/peliculas\/1$/);
    expect(consulta.mock.calls[0].arguments[1])
        .to.deep.equal(['Arrival', 'Denis Villeneuve', 2016, 1]);
});

test('PUT /peliculas/:id informa si la película no existe', async (t) => {
    prepararSolicitud(t);
    t.mock.method(conexion, 'execute', async () => [{ affectedRows: 0 }]);

    const respuesta = await request.execute(app)
        .put('/peliculas/999')
        .set('x-api-key', apiKey)
        .send({ titulo: 'Arrival', director: 'Denis Villeneuve', anio: 2016 });

    expect(respuesta).to.have.status(404);
    expect(respuesta.body.mensaje).to.equal('Película no encontrada');
});

test('PUT /peliculas/:id valida los datos antes de modificar la base', async (t) => {
    prepararSolicitud(t);
    const consulta = t.mock.method(conexion, 'execute', async () => []);

    const respuesta = await request.execute(app)
        .put('/peliculas/1')
        .set('x-api-key', apiKey)
        .send({ titulo: '', director: 'Director', anio: 2016 });

    expect(respuesta).to.have.status(400);
    expect(consulta.mock.callCount()).to.equal(0);
});

test('DELETE /peliculas/:id elimina la película sin devolver contenido', async (t) => {
    prepararSolicitud(t);
    const consulta = t.mock.method(conexion, 'execute', async () => [{ affectedRows: 1 }]);

    const respuesta = await request.execute(app)
        .delete('/peliculas/1')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(204);
    expect(respuesta.text).to.equal('');
    expect(consulta.mock.calls[0].arguments[1]).to.deep.equal([1]);
});

test('DELETE /peliculas/:id informa si la película no existe', async (t) => {
    prepararSolicitud(t);
    t.mock.method(conexion, 'execute', async () => [{ affectedRows: 0 }]);

    const respuesta = await request.execute(app)
        .delete('/peliculas/999')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(404);
    expect(respuesta.body.mensaje).to.equal('Película no encontrada');
});

test('DELETE /peliculas/:id rechaza un ID inválido', async (t) => {
    prepararSolicitud(t);
    const consulta = t.mock.method(conexion, 'execute', async () => []);

    const respuesta = await request.execute(app)
        .delete('/peliculas/no-es-numero')
        .set('x-api-key', apiKey);

    expect(respuesta).to.have.status(400);
    expect(consulta.mock.callCount()).to.equal(0);
});
