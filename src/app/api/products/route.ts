import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { products as defaultProducts } from '@/data/products';
import { requireAdmin, getAdminRole } from '@/lib/adminAuth';
import { stripInternalFields } from '@/lib/productPrivacy';
import { PUBLIC_CACHE_HEADERS, getCachedStoreValue, invalidateStoreKey } from '@/lib/storeCache';

const PUBLIC_HEADERS = { ...PUBLIC_CACHE_HEADERS, Vary: 'Cookie' };
const ADMIN_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

export async function GET(request: NextRequest) {
  // Con cookie admin válida se devuelve todo (incluido cost); si no, se eliminan los campos de costo/margen.
  const isAdmin = !!getAdminRole(request);
  const respond = (list: any[]) =>
    isAdmin
      ? NextResponse.json(list, { headers: ADMIN_HEADERS })
      : NextResponse.json(list.map(stripInternalFields), { headers: PUBLIC_HEADERS });
  try {
    const products = await getCachedStoreValue('store_products');

    if (!products || !Array.isArray(products) || products.length === 0) {
      return respond(defaultProducts);
    }

    return respond(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return respond(defaultProducts);
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
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
