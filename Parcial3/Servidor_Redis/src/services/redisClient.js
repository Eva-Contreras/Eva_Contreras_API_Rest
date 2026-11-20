import 'dotenv/config';
import { createClient } from 'redis';

export const redisClient = process.env.REDIS_URL
    ? createClient({ url: process.env.REDIS_URL })
    : null;

redisClient?.on('error', (error) => {
    console.error('Error de conexión con Redis:', error);
});

export async function connectRedis() {
    if (!redisClient) {
        console.warn('REDIS_URL no está configurada; la caché queda desactivada.');
        return false;
    }

    await redisClient.connect();
    return true;
}