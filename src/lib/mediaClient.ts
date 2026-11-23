'use client';

import { supabase } from '@/lib/supabase';

export const MAX_IMAGE_SIDE = 1200;
export const IMAGE_QUALITY = 0.85;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 15 MB

/** Redimensiona a máx 1200px y convierte a WebP (calidad 0.85) en el navegador. */
export async function optimizeImageToWebp(file: File): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('No se pudo leer la imagen'));
      el.src = objectUrl;
    });
    let { width, height } = img;
    if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) {
      const ratio = Math.min(MAX_IMAGE_SIDE / width, MAX_IMAGE_SIDE / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', IMAGE_QUALITY));
    if (!blob || blob.type !== 'image/webp') throw new Error('Tu navegador no pudo convertir a WebP');
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const isVideoFile = (file: File) =>
  file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');

/**
 * Sube un archivo a Supabase Storage.
 * - Imagen: se optimiza a WebP y pasa por /api/admin/upload.
 * - Video: sin recomprimir; límite 15 MB; sube directo con URL firmada (evita el límite de 4.5 MB de Vercel).
 * Lanza Error con mensaje legible si algo falla.
 */
export async function uploadMedia(file: File): Promise<string> {
  if (isVideoFile(file)) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(
        `El video pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es 15 MB. Comprímelo o pega un enlace (YouTube/TikTok/Instagram).`
      );
    }
    const signRes = await fetch('/api/admin/upload?action=sign', { method: 'POST', credentials: 'same-origin' });
    const sign = await signRes.json().catch(() => ({}));
    if (!signRes.ok || !sign?.token) throw new Error(sign?.error || 'No se pudo preparar la subida del video');
    const { error } = await supabase.storage
      .from('media')
      .uploadToSignedUrl(sign.path, sign.token, file, { contentType: 'video/mp4', cacheControl: '31536000' });
    if (error) throw new Error(error.message);
    return sign.publicUrl as string;
  }

  const blob = await optimizeImageToWebp(file);
  const body = new FormData();
  body.append('file', blob, 'upload.webp');
  const res = await fetch('/api/admin/upload', { method: 'POST', body, credentials: 'same-origin' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.url) throw new Error(json?.error || `Error ${res.status}`);
  return json.url as string;
}

/** Pide al servidor borrar archivos huérfanos (solo borra los que pertenecen a nuestro bucket). */
export async function deleteStorageUrls(urls: string[]): Promise<void> {
  const list = Array.from(new Set(urls.filter(Boolean)));
  if (list.length === 0) return;
  try {
    await fetch('/api/admin/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ urls: list }),
    });
  } catch (e) {
    console.error('No se pudo limpiar Storage:', e);
  }
}

/** URLs de medios referenciadas por una lista de productos (imágenes, videos, fotos de color, descripción). */
export function collectProductMediaUrls(products: any[]): Set<string> {
  const set = new Set<string>();
  for (const p of products || []) {
    (Array.isArray(p?.images) ? p.images : []).forEach((u: string) => u && set.add(u));
    if (p?.demoVideo) set.add(p.demoVideo);
    (Array.isArray(p?.colors) ? p.colors : []).forEach((c: any) => c?.image && set.add(c.image));
    const desc = typeof p?.description === 'string' ? p.description : '';
    for (const m of desc.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) set.add(m[1]);
  }
  return set;
}
