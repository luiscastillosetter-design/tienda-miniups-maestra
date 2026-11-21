import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseServer } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

const MAX_BYTES = 4 * 1024 * 1024; // Vercel limita el body de funciones a ~4.5 MB
const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400, headers: NO_STORE });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 4 MB)' }, { status: 413, headers: NO_STORE });
    }

    const isVideo = file.type === 'video/mp4';
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400, headers: NO_STORE });
    }

    const ext = isVideo ? 'mp4' : 'webp';
    const contentType = isVideo ? 'video/mp4' : 'image/webp';
    const filePath = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error } = await supabaseServer.storage
      .from('media')
      .upload(filePath, Buffer.from(await file.arrayBuffer()), {
        cacheControl: '31536000',
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('[admin/upload] Error de Storage:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500, headers: NO_STORE });
    }

    const { data } = supabaseServer.storage.from('media').getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl }, { headers: NO_STORE });
  } catch (err: any) {
    console.error('[admin/upload] Excepción:', err);
    return NextResponse.json({ error: 'Error inesperado al subir archivo' }, { status: 500, headers: NO_STORE });
  }
}
