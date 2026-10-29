import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

const LOCAL_DB_PATH = path.join(process.cwd(), '.todomax-db.json');

function readLocalFileDb(): Record<string, any> {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error leyendo respaldo local .todomax-db.json:', e);
  }
  return {};
}

function writeLocalFileDb(data: Record<string, any>) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Entornos serverless de solo lectura
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: any;
}

async function getClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  try {
    if (global.__redisClient && global.__redisClient.isOpen) {
      return global.__redisClient;
    }

    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 8000,
        reconnectStrategy: (retries) => {
          if (retries > 5) return false;
          return Math.min(retries * 200, 1000);
        },
      },
    });

    client.on('error', (err: any) => {
      console.error('Aviso de socket Redis:', err?.message || err);
    });

    await client.connect();
    global.__redisClient = client;
    return client;
  } catch (error) {
    console.error('No se pudo conectar a Redis en este intento:', error);
    global.__redisClient = null;
    return null;
  }
}

export const dbService = {
  async get(key: string) {
    try {
      const client = await getClient();
      if (client) {
        const data = await client.get(key);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error(`Error leyendo ${key} de Redis:`, error);
    }

    const localDb = readLocalFileDb();
    return localDb[key] !== undefined ? localDb[key] : null;
  },

  async set(key: string, value: any): Promise<boolean> {
    let savedInCloud = false;

    try {
      const client = await getClient();
      if (client) {
        await client.set(key, JSON.stringify(value));
        savedInCloud = true;
      }
    } catch (error) {
      console.error(`Error guardando ${key} en Redis:`, error);
    }

    try {
      const localDb = readLocalFileDb();
      localDb[key] = value;
      writeLocalFileDb(localDb);
      if (!process.env.REDIS_URL) {
        savedInCloud = true;
      }
    } catch (e) {}

    return savedInCloud;
  }
};