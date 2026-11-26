import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('producción inicia HTTP sin certificados locales y permite CORS', { timeout: 10000 }, async (t) => {
    const servidor = spawn(process.execPath, [
        fileURLToPath(new URL('../src/index.js', import.meta.url))
    ], {
        cwd: tmpdir(),
        env: { ...process.env, NODE_ENV: 'production', PORT: '0', DB_SSL: 'false' }
    });
    t.after(() => servidor.kill());

    const [salida] = await once(servidor.stdout, 'data');
    const puerto = salida.toString().match(/puerto (\d+)/)?.[1];
    assert.ok(puerto, 'El servidor no informó el puerto HTTP');

    const preflight = await fetch(`http://127.0.0.1:${puerto}/peliculas/1`, {
        method: 'OPTIONS',
        headers: {
            Origin: 'https://cliente.example',
            'Access-Control-Request-Method': 'PUT'
        }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), '*');

    const respuesta = await fetch(`http://127.0.0.1:${puerto}/api-spec`);
    assert.equal(respuesta.status, 200);
    const especificacion = await respuesta.json();
    assert.equal(especificacion.servers[0].url, '/');
});
