import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Falta parámetro key' }, { status: 400 });
    }
    const data = await dbService.get(key);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error en GET /api/store:', error);
    return NextResponse.json({ error: 'Error leyendo datos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ error: 'Falta parámetro key' }, { status: 400 });
    }
    await dbService.set(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/store:', error);
    return NextResponse.json({ error: 'Error guardando datos' }, { status: 500 });
  }
}