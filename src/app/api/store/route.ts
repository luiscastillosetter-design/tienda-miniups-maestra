import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { requireAdmin } from '@/lib/adminAuth';
import {
  PUBLIC_STORE_KEYS,
  PUBLIC_CACHE_HEADERS,
  PRIVATE_CACHE_HEADERS,
  getCachedStoreValue,
  invalidateStoreKey,
} from '@/lib/storeCache';

export const dynamic = 'force-dynamic';

// Quita el comprobante Base64 (muy pesado) de cada pedido; se pide bajo demanda por orderId.
function stripReceipts(orders: any[]) {
  return orders.map((o) =>
    o?.payment?.receiptImage
      ? { ...o, payment: { ...o.payment, receiptImage: undefined, hasReceipt: true } }
      : o
  );
}

/**
 * GET /api/store?key=...
 * - Claves de PUBLIC_STORE_KEYS: públicas (con caché).
 * - store_marketing_config: sin sesión admin solo se devuelve el Pixel ID (dato público por naturaleza).
 * - Cualquier otra clave (pedidos, afiliados, pagos, visitas, ...): requiere cookie admin válida → 401.
 */
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Falta parámetro key' }, { status: 400 });
    }

    if (PUBLIC_STORE_KEYS.has(key)) {
      const data = await getCachedStoreValue(key);
      return NextResponse.json({ success: true, data }, { headers: PUBLIC_CACHE_HEADERS });
    }

    const denied = requireAdmin(request);

    if (key === 'store_marketing_config' && denied) {
      const cfg: any = await getCachedStoreValue(key);
      const metaPixelId = typeof cfg?.metaPixelId === 'string' ? cfg.metaPixelId : undefined;
      return NextResponse.json({ success: true, data: { metaPixelId } }, { headers: PUBLIC_CACHE_HEADERS });
    }

    if (denied) return denied;

    const data = await dbService.get(key);

    if (key === 'store_orders' && Array.isArray(data)) {
      const orderId = request.nextUrl.searchParams.get('orderId');
      if (orderId) {
        const order = data.find((o: any) => o?.id === orderId);
        return NextResponse.json(
          { success: true, data: order?.payment?.receiptImage ?? null },
          { headers: PRIVATE_CACHE_HEADERS }
        );
      }
      return NextResponse.json(
        { success: true, data: stripReceipts(data) },
        { headers: PRIVATE_CACHE_HEADERS }
      );
    }

    return NextResponse.json({ success: true, data }, { headers: PRIVATE_CACHE_HEADERS });
  } catch (error) {
    console.error('Error en GET /api/store:', error);
    return NextResponse.json({ error: 'Error leyendo datos' }, { status: 500 });
  }
}

/** POST /api/store: SOLO administrador. El checkout público usa /api/orders y los afiliados /api/affiliate. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { key } = body;
    let { value } = body;
    if (!key) {
      return NextResponse.json({ error: 'Falta parámetro key' }, { status: 400 });
    }

    // El listado llega sin comprobantes: restaurar los existentes para no perderlos al guardar.
    if (key === 'store_orders' && Array.isArray(value)) {
      const needsRestore = value.some((o: any) => o?.payment?.hasReceipt && !o.payment.receiptImage);
      if (needsRestore) {
        const existing = await dbService.get('store_orders');
        if (Array.isArray(existing)) {
          const receipts = new Map<string, string>();
          existing.forEach((o: any) => {
            if (o?.id && o?.payment?.receiptImage) receipts.set(o.id, o.payment.receiptImage);
          });
          value = value.map((o: any) =>
            o?.payment?.hasReceipt && !o.payment.receiptImage && receipts.has(o.id)
              ? { ...o, payment: { ...o.payment, receiptImage: receipts.get(o.id) } }
              : o
          );
        }
      }
    }

    const saved = await dbService.set(key, value);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'No se pudo escribir en la base de datos' },
        { status: 500 }
      );
    }
    invalidateStoreKey(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/store:', error);
    return NextResponse.json({ error: 'Error guardando datos' }, { status: 500 });
  }
}
