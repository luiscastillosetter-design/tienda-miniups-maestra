import { createClient } from 'redis';

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: any;
  // eslint-disable-next-line no-var
  var __redisUnavailableUntil: number | undefined;
  // eslint-disable-next-line no-var
  var __memoryDb: Record<string, any> | undefined;
}

function getMemoryDb(): Record<string, any> {
  if (!global.__memoryDb) {
    global.__memoryDb = {};
  }
  return global.__memoryDb;
}

async function getClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (global.__redisUnavailableUntil && Date.now() < global.__redisUnavailableUntil) {
    return null;
  }

  try {
    if (global.__redisClient && global.__redisClient.isOpen) {
      return global.__redisClient;
    }

    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: false,
      },
    });

    client.on('error', () => {
      global.__redisUnavailableUntil = Date.now() + 60000;
    });

    await client.connect();
    global.__redisClient = client;
    global.__redisUnavailableUntil = 0;
    return client;
  } catch (error) {
    global.__redisUnavailableUntil = Date.now() + 60000;
    global.__redisClient = null;
    return null;
  }
}

export const dbService = {
  async get(key: string) {
    const memoryDb = getMemoryDb();

    try {
      const client = await getClient();
      if (client) {
        const data = await client.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          memoryDb[key] = parsed;
          return parsed;
        }
      }
    } catch (error) {
      global.__redisUnavailableUntil = Date.now() + 60000;
    }

    return memoryDb[key] !== undefined ? memoryDb[key] : null;
  },

  async set(key: string, value: any): Promise<boolean> {
    let saved = false;
    const memoryDb = getMemoryDb();
    memoryDb[key] = value;

    try {
      const client = await getClient();
      if (client) {
        await client.set(key, JSON.stringify(value));
        saved = true;
      }
    } catch (error) {
      global.__redisUnavailableUntil = Date.now() + 60000;
    }

    return saved || !!memoryDb[key];
  },
};