import { createClient } from 'redis';

let redisClient: any = null;

async function getClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    redisClient.on('error', (err: any) => console.error('Error en cliente Redis:', err));
    await redisClient.connect();
  }
  return redisClient;
}

export const dbService = {
  async get(key: string) {
    try {
      const client = await getClient();
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
      await client.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error guardando ${key} en Redis:`, error);
      return false;
    }
  }
};