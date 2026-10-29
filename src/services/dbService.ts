import { createClient } from 'redis';

let redisClient: any = null;
let redisFailed = false;

async function getClient() {
  if (redisFailed || !process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      const client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 3000,
          reconnectStrategy: false,
        },
      });
      client.on('error', (err: any) => {
        console.error('Error en cliente Redis:', err);
        redisFailed = true;
      });
      await client.connect();
      redisClient = client;
    } catch (error) {
      console.error('No se pudo conectar a Redis, usando respaldo local:', error);
      redisFailed = true;
      redisClient = null;
      return null;
    }
  }
  return redisClient;
}

export const dbService = {
  async get(key: string) {
    try {
      const client = await getClient();
      if (!client) return null;
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error leyendo ${key} de Redis:`, error);
      return null;
    }
  },

  async set(key: string, value: any) {
    try {
      const client = await getClient();
      if (!client) return false;
      await client.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error guardando ${key} en Redis:`, error);
      return false;
    }
  }
};