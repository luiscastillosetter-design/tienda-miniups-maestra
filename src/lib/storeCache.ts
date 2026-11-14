import { unstable_cache, revalidateTag } from 'next/cache';
import { dbService } from '@/services/dbService';

// Claves con datos sensibles/privados: nunca se cachean en CDN ni en Data Cache.
export const PRIVATE_KEYS = new Set(['store_orders', 'store_affiliates', 'store_paid_affiliates']);

export const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};
export const PRIVATE_CACHE_HEADERS = {
  'Cache-Control': 'private, no-store',
};

const tagFor = (key: string) => `store:${key}`;

/** Lectura compartida: una sola consulta a Supabase por clave cada 60 s (o hasta invalidación). */
export function getCachedStoreValue(key: string) {
  return unstable_cache(() => dbService.get(key), ['store_data', key], {
    tags: [tagFor(key)],
    revalidate: 60,
  })();
}

/** Invalida la caché de una clave; llamar solo tras guardar desde /admin. */
export function invalidateStoreKey(key: string) {
  revalidateTag(tagFor(key), { expire: 0 });
}
