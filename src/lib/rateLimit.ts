import type { NextRequest } from 'next/server';

// Límite simple en memoria por IP (best-effort en serverless; frena abuso básico).
const hits = new Map<string, number[]>();

export function rateLimited(request: NextRequest, bucket: string, max: number, windowMs = 60_000): boolean {
  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const k = `${bucket}:${ip}`;
  const now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(k, arr);
  if (hits.size > 5000) {
    for (const [key, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(key);
  }
  return arr.length > max;
}
