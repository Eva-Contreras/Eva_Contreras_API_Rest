import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const inspeccionarConexion = (variables) => {
    const env = { ...process.env, DB_HOST: 'prueba.aivencloud.com', ...variables };
    delete env.DB_SSL_CA;
    if (variables.DB_SSL_CA !== undefined) env.DB_SSL_CA = variables.DB_SSL_CA;
    if (variables.DB_SSL === undefined) delete env.DB_SSL;

    return spawnSync(process.execPath, ['--input-type=module', '-e', `
        import conexion from './src/database/conexion.js';
        console.log(JSON.stringify(conexion.pool.config.connectionConfig.ssl || null));
        await conexion.end();
    `], {
        cwd: fileURLToPath(new URL('..', import.meta.url)),
        env,
        encoding: 'utf8'
    });
};

test('Aiven utiliza TLS y permite verificar el certificado CA', () => {
    const sinCa = inspeccionarConexion({});
    assert.equal(sinCa.status, 0);
    assert.equal(JSON.parse(sinCa.stdout).rejectUnauthorized, false);

    const conCa = inspeccionarConexion({ DB_SSL_CA: 'certificado-de-prueba' });
    assert.equal(conCa.status, 0);
    assert.deepEqual(JSON.parse(conCa.stdout), {
        rejectUnauthorized: true,
        ca: 'certificado-de-prueba'
    });
});

test('DB_SSL permite desactivar TLS y rechaza valores inválidos', () => {
    const activado = inspeccionarConexion({ DB_HOST: 'localhost', DB_SSL: 'true' });
    assert.equal(activado.status, 0);
    assert.equal(JSON.parse(activado.stdout).rejectUnauthorized, false);

    const desactivado = inspeccionarConexion({ DB_SSL: 'false' });
    assert.equal(desactivado.status, 0);
    assert.equal(JSON.parse(desactivado.stdout), null);

    const invalido = inspeccionarConexion({ DB_SSL: 'otro' });
    assert.notEqual(invalido.status, 0);
    assert.match(invalido.stderr, /DB_SSL debe ser true o false/);
});
