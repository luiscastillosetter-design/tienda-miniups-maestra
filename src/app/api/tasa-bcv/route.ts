import { NextResponse } from 'next/server';
import { obtenerTasaBcv } from '@/lib/tasaBcv';

export const revalidate = 900;

export async function GET() {
  const data = await obtenerTasaBcv();
  if (!data) {
    return NextResponse.json({ tasa: null, fechaActualizacion: null }, { status: 503 });
  }
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
  });
}
