import 'dotenv/config';
import mysql from 'mysql2/promise';

const dbSsl = process.env.DB_SSL;
if (dbSsl !== undefined && dbSsl !== 'true' && dbSsl !== 'false') {
    throw new Error('DB_SSL debe ser true o false');
}

const usarSsl = dbSsl === 'true' ||
    (dbSsl === undefined && (process.env.DB_HOST || '').toLowerCase().endsWith('.aivencloud.com'));
const certificadoCa = process.env.DB_SSL_CA;

if (usarSsl && !certificadoCa) {
    console.warn('La conexión MySQL usa TLS sin verificar el certificado; configura DB_SSL_CA para verificarlo.');
}

const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: usarSsl ? { rejectUnauthorized: Boolean(certificadoCa), ...(certificadoCa && { ca: certificadoCa }) } : undefined,
    waitForConnections: true
});

export default conexion;
