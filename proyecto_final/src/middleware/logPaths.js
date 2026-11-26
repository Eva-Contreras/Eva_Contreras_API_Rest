import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const enVercel = Boolean(process.env.VERCEL);

const logsDirectory = fileURLToPath(new URL('../../logs', import.meta.url));

if (!enVercel) {
    mkdirSync(logsDirectory, { recursive: true });
}

export const accessLogPath = path.join(logsDirectory, 'accesos.log');
export const errorLogPath = path.join(logsDirectory, 'errores.log');
