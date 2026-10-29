import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { products as defaultProducts } from '@/data/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await dbService.get('store_products');
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(defaultProducts, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }
    
    return NextResponse.json(products, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(defaultProducts);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Formato inválido' }, { status: 400 });
    }
    const saved = await dbService.set('store_products', body);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'No se pudo guardar en la base de datos' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving products:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}