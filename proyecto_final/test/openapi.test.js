import assert from 'node:assert/strict';
import test from 'node:test';
import { generarOpenapi } from '../scripts/generarOpenapi.js';

test('la especificación OpenAPI incluye las rutas de películas', () => {
    const especificacion = generarOpenapi();

    assert.ok(especificacion.paths['/peliculas/'].get);
    assert.ok(especificacion.paths['/peliculas/'].post);
    assert.ok(especificacion.paths['/peliculas/{id}'].get);
    assert.ok(especificacion.paths['/peliculas/{id}'].put);
    assert.ok(especificacion.paths['/peliculas/{id}'].delete);
});
