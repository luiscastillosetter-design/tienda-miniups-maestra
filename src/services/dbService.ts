import { createClient } from 'redis';

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: any;
  // eslint-disable-next-line no-var
  var __redisUnavailableUntil: number | undefined;
  // eslint-disable-next-line no-var
  var __memoryDb: Record<string, any> | undefined;
  // eslint-disable-next-line no-var
  var __memoryDbExpiry: Record<string, number> | undefined;
  // eslint-disable-next-line no-var
  var __redisConnectingPromise: Promise<any> | null | undefined;
}

function getMemoryDb(): Record<string, any> {
  if (!global.__memoryDb) {
    global.__memoryDb = {};
  }
  return global.__memoryDb;
}

function getMemoryExpiry(): Record<string, number> {
  if (!global.__memoryDbExpiry) {
    global.__memoryDbExpiry = {};
  }
  return global.__memoryDbExpiry;
}

async function getClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (global.__redisUnavailableUntil && Date.now() < global.__redisUnavailableUntil) {
    return null;
  }

  if (global.__redisClient && global.__redisClient.isOpen) {
    return global.__redisClient;
  }

  // Si ya hay una conexión en curso, reutilizar la misma promesa para evitar saturación simultánea
  if (global.__redisConnectingPromise) {
    return await global.__redisConnectingPromise;
  }

  global.__redisConnectingPromise = (async () => {
    try {
      const client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: false,
        },
      });

      client.on('error', () => {
        global.__redisUnavailableUntil = Date.now() + 30000;
      });

      await client.connect();
      global.__redisClient = client;
      global.__redisUnavailableUntil = 0;
      return client;
    } catch (error) {
      global.__redisUnavailableUntil = Date.now() + 30000;
      global.__redisClient = null;
      return null;
    } finally {
      global.__redisConnectingPromise = null;
    }
  })();

  return await global.__redisConnectingPromise;
}

export const dbService = {
  async get(key: string) {
    const memoryDb = getMemoryDb();
    const memoryExpiry = getMemoryExpiry();
    const now = Date.now();

    // 1. Si el dato ya está en memoria RAM del servidor y es reciente (30s), responder en 0ms
    if (memoryDb[key] !== undefined && memoryExpiry[key] && now < memoryExpiry[key]) {
      return memoryDb[key];
    }

    try {
      const client = await getClient();
      if (client) {
        const data = await client.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          memoryDb[key] = parsed;
          memoryExpiry[key] = now + 30000; // Conservar en RAM 30 segundos
          return parsed;
        }
      }
    } catch (error) {
      global.__redisUnavailableUntil = Date.now() + 30000;
    }

    return memoryDb[key] !== undefined ? memoryDb[key] : null;
  },

  async set(key: string, value: any): Promise<boolean> {
    let saved = false;
    const memoryDb = getMemoryDb();
    const memoryExpiry = getMemoryExpiry();
    
    // Actualizar la memoria del servidor de inmediato
    memoryDb[key] = value;
    memoryExpiry[key] = Date.now() + 30000;

    try {
      const client = await getClient();
      if (client) {
        await client.set(key, JSON.stringify(value));
        saved = true;
      }
    } catch (error) {
      global.__redisUnavailableUntil = Date.now() + 30000;
    }

    return saved || !!memoryDb[key];
  },
};