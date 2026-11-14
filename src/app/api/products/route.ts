import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { products as defaultProducts } from '@/data/products';
import { PUBLIC_CACHE_HEADERS, getCachedStoreValue, invalidateStoreKey } from '@/lib/storeCache';

export async function GET() {
  try {
    const products = await getCachedStoreValue('store_products');

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(defaultProducts, { headers: PUBLIC_CACHE_HEADERS });
    }

    return NextResponse.json(products, { headers: PUBLIC_CACHE_HEADERS });
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
    invalidateStoreKey('store_products');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving products:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}
