import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

const LOCAL_DB_PATH = path.join(process.cwd(), '.todomax-db.json');

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: any;
  // eslint-disable-next-line no-var
  var __redisUnavailableUntil: number | undefined;
  // eslint-disable-next-line no-var
  var __memoryDb: Record<string, any> | undefined;
}

function readLocalFileDb(): Record<string, any> {
  if (global.__memoryDb) {
    return global.__memoryDb;
  }
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      global.__memoryDb = parsed;
      return parsed;
    }
  } catch (e) {
    console.error('Error leyendo respaldo local .todomax-db.json:', e);
  }
  global.__memoryDb = {};
  return global.__memoryDb;
}

function writeLocalFileDb(data: Record<string, any>) {
  global.__memoryDb = data;
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Entornos serverless de solo lectura mantienen los datos en memoria global
  }
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
        connectTimeout: 1200,
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
    const localDb = readLocalFileDb();

    try {
      const client = await getClient();
      if (client) {
        const data = await client.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          localDb[key] = parsed;
          global.__memoryDb = localDb;
          return parsed;
        }
      }
    } catch (error) {
      global.__redisUnavailableUntil = Date.now() + 60000;
    }

    return localDb[key] !== undefined ? localDb[key] : null;
  },

  async set(key: string, value: any): Promise<boolean> {
    let saved = false;

    try {
      const localDb = readLocalFileDb();
      localDb[key] = value;
      writeLocalFileDb(localDb);
      saved = true;
    } catch (e) {}

    try {
      const client = await getClient();
      if (client) {
        await client.set(key, JSON.stringify(value));
        saved = true;
      }
    } catch (error) {
      global.__redisUnavailableUntil = Date.now() + 60000;
    }

    return saved;
  },
};