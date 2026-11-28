import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const COLUMNS = 'id, customer_name, city, rating, comment, created_at';

/** GET /api/reviews (público): opiniones visibles. Ante fallo responde vacío con 200. */
export async function GET() {
  const empty = { reviews: [], averageRating: 0, totalCount: 0 };
  try {
    const { data, error } = await supabase
      .from('store_reviews')
      .select(COLUMNS)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !Array.isArray(data)) {
      if (error) console.error('Error en GET /api/reviews:', error.message);
      return NextResponse.json(empty);
    }

    const totalCount = data.length;
    const sum = data.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const averageRating = totalCount ? Math.round((sum / totalCount) * 10) / 10 : 0;
    return NextResponse.json({ reviews: data, averageRating, totalCount });
  } catch (err) {
    console.error('Excepción en GET /api/reviews:', err);
    return NextResponse.json(empty);
  }
}

/** POST /api/reviews (público): crea una opinión visible con validación y honeypot. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
    }

    // Honeypot: si viene lleno es un bot; responder 200 sin guardar.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ ok: true });
    }

    const customer_name = typeof body.customer_name === 'string' ? body.customer_name.trim() : '';
    const cityRaw = typeof body.city === 'string' ? body.city.trim() : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    const rating = Number(body.rating);

    if (customer_name.length < 2 || customer_name.length > 60) {
      return NextResponse.json({ error: 'El nombre debe tener entre 2 y 60 caracteres.' }, { status: 400 });
    }
    if (cityRaw.length > 40) {
      return NextResponse.json({ error: 'La ciudad no puede superar 40 caracteres.' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe ser un entero entre 1 y 5.' }, { status: 400 });
    }
    if (comment.length < 10 || comment.length > 400) {
      return NextResponse.json({ error: 'El comentario debe tener entre 10 y 400 caracteres.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('store_reviews')
      .insert({
        customer_name,
        city: cityRaw || null,
        rating,
        comment,
        is_visible: true,
      })
      .select(COLUMNS)
      .single();

    if (error || !data) {
      console.error('Error en POST /api/reviews:', error?.message);
      return NextResponse.json({ error: 'No se pudo guardar tu opinión. Intenta de nuevo.' }, { status: 500 });
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err) {
    console.error('Excepción en POST /api/reviews:', err);
    return NextResponse.json({ error: 'Error inesperado.' }, { status: 500 });
  }
}
