// Script puntual: comprime a WebP 1080px las imágenes del bucket 'media' que pesen > 180 KB
// y las re-sube con cacheControl de 1 año. Uso: node scripts/optimize-storage-images.mjs
import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const BUCKET = 'media';
const MAX_BYTES = 180 * 1024;
const MAX_DIM = 1080;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Cargar .env.local sin imprimir valores
const env = {};
for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}
console.log(`Usando clave: ${env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'}`);
const supabase = createClient(url, key);

async function listAll(prefix = '') {
  const out = [];
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error) throw new Error(`list(${prefix || '/'}): ${error.message}`);
  for (const entry of data ?? []) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) out.push(...(await listAll(path)));
    else out.push({ path, size: entry.metadata?.size ?? 0 });
  }
  return out;
}

const files = (await listAll()).filter(f => IMAGE_EXT.has(extname(f.path).toLowerCase()));
console.log(`Imágenes encontradas: ${files.length}`);

let optimized = 0, skipped = 0, failed = 0, savedBytes = 0;
for (const f of files) {
  if (f.size <= MAX_BYTES) { skipped++; continue; }
  try {
    const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(f.path);
    if (dlErr) throw new Error(dlErr.message);
    const input = Buffer.from(await blob.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    if (output.length >= input.length) { skipped++; continue; }

    // Se re-sube en la MISMA ruta para no romper URLs ya guardadas en productos/banners
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(f.path, output, {
      cacheControl: '31536000',
      upsert: true,
      contentType: 'image/webp',
    });
    if (upErr) throw new Error(upErr.message);
    optimized++;
    savedBytes += input.length - output.length;
    console.log(`OK  ${f.path}: ${(input.length / 1024).toFixed(0)} KB -> ${(output.length / 1024).toFixed(0)} KB`);
  } catch (e) {
    failed++;
    console.error(`ERR ${f.path}: ${e.message}`);
  }
}
console.log(`\nOptimizadas: ${optimized} | Omitidas (<=180KB): ${skipped} | Fallidas: ${failed} | Ahorro: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
