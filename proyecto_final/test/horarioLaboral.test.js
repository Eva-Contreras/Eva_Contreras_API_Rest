import assert from 'node:assert';
import test from 'node:test';
import { horarioLaboral } from '../src/middleware/horarioLaboral.js';

const crearRespuesta = () => ({
    statusCode: undefined,
    body: undefined,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

const fijarFecha = (t, year, month, day, hour, minute = 0) => {
    t.mock.timers.enable({
        apis: ['Date'],
        now: new Date(year, month, day, hour, minute)
    });
};

test('continúa las solicitudes de lunes a sábado dentro del horario laboral', (t) => {
    fijarFecha(t, 2026, 10, 2, 6);

    const req = {};
    const res = crearRespuesta();
    let llamadasNext = 0;

    horarioLaboral(req, res, () => {
        llamadasNext += 1;
    });

    assert.equal(llamadasNext, 1);
    assert.equal(res.statusCode, undefined);
    assert.equal(res.body, undefined);
});

test('acepta el último minuto del sábado', (t) => {
    fijarFecha(t, 2026, 10, 7, 19, 59);

    const res = crearRespuesta();
    let llamadasNext = 0;

    horarioLaboral({}, res, () => {
        llamadasNext += 1;
    });

    assert.equal(llamadasNext, 1);
    assert.equal(res.statusCode, undefined);
});

test('responde 503 los domingos', (t) => {
    fijarFecha(t, 2026, 10, 1, 12);

    const res = crearRespuesta();
    let llamadasNext = 0;

    horarioLaboral({}, res, () => {
        llamadasNext += 1;
    });

    assert.equal(llamadasNext, 0);
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, {
        mensaje: 'No se pueden ejecutar peticiones a esta hora'
    });
});

test('responde 503 antes de las 06:00', (t) => {
    fijarFecha(t, 2026, 10, 2, 5, 59);

    const res = crearRespuesta();
    let llamadasNext = 0;

    horarioLaboral({}, res, () => {
        llamadasNext += 1;
    });

    assert.equal(llamadasNext, 0);
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, {
        mensaje: 'No se pueden ejecutar peticiones a esta hora'
    });
});

test('responde 503 a partir de las 20:00', (t) => {
    fijarFecha(t, 2026, 10, 2, 20);

    const res = crearRespuesta();
    let llamadasNext = 0;

    horarioLaboral({}, res, () => {
        llamadasNext += 1;
    });

    assert.equal(llamadasNext, 0);
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, {
        mensaje: 'No se pueden ejecutar peticiones a esta hora'
    });
});