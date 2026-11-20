import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { siteConfig } from '@/config/site';
import { isSelfPurchase } from '@/lib/affiliateGuard';
import { sendOrderWhatsAppNotifications } from '@/lib/whatsappCloud';
import {
  PRIVATE_KEYS,
  PUBLIC_CACHE_HEADERS,
  PRIVATE_CACHE_HEADERS,
  getCachedStoreValue,
  invalidateStoreKey,
} from '@/lib/storeCache';

// Quita el comprobante Base64 (muy pesado) de cada pedido; se pide bajo demanda por orderId.
function stripReceipts(orders: any[]) {
  return orders.map((o) =>
    o?.payment?.receiptImage
      ? { ...o, payment: { ...o.payment, receiptImage: undefined, hasReceipt: true } }
      : o
  );
}

// Pedidos NUEVOS con código de afiliado: fija la comisión en 10% y bloquea la autocompra.
async function enforceAffiliateRules(value: any[]) {
  const existing = await dbService.get('store_orders');
  const knownIds = new Set<string>(Array.isArray(existing) ? existing.map((o: any) => o?.id) : []);
  const isNewAffiliateOrder = (o: any) =>
    o?.id && !knownIds.has(o.id) && o?.attribution?.affiliateCode && o.attribution.affiliateCode !== 'DIRECTO';
  if (!value.some(isNewAffiliateOrder)) return value;

  const affiliates = await dbService.get('store_affiliates');
  const list: any[] = Array.isArray(affiliates) ? affiliates : [];

  return value.map((o: any) => {
    if (!isNewAffiliateOrder(o)) return o;
    const code = String(o.attribution.affiliateCode).toUpperCase();
    const affiliate = list.find((a) => String(a?.codigo).toUpperCase() === code);
    const blocked =
      o.attribution.selfPurchaseBlocked === true ||
      isSelfPurchase(
        { telefono: o.customer?.telefono, email: o.customer?.email, cedula: o.customer?.cedula },
        affiliate,
        o.attribution.sessionAffiliateCode,
        code
      );
    const total = Number(o.financials?.total) || 0;
    const cost = Number(o.financials?.cost || 0);
    if (blocked) {
      return {
        ...o,
        financials: { ...o.financials, commission: 0, utility: total - cost },
        attribution: { ...o.attribution, affiliateCode: 'DIRECTO', channel: 'Directo', selfPurchaseBlocked: true, blockedCode: code },
      };
    }
    const commission = total * siteConfig.affiliateCommissionRate;
    return { ...o, financials: { ...o.financials, commission, utility: total - cost - commission } };
  });
}

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Falta parámetro key' }, { status: 400 });
    }

    if (!PRIVATE_KEYS.has(key)) {
      const data = await getCachedStoreValue(key);
      return NextResponse.json({ success: true, data }, { headers: PUBLIC_CACHE_HEADERS });
    }

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

export async function POST(request: NextRequest) {
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

    let newOrders: any[] = [];
    if (key === 'store_orders' && Array.isArray(value)) {
      const existingForIds = await dbService.get('store_orders');
      const known = new Set<string>(
        Array.isArray(existingForIds) ? existingForIds.map((o: any) => o?.id) : []
      );
      newOrders = value.filter((o: any) => o?.id && !known.has(o.id));
      value = await enforceAffiliateRules(value);
    }

    const saved = await dbService.set(key, value);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'No se pudo escribir en la base de datos' },
        { status: 500 }
      );
    }
    invalidateStoreKey(key);

    let whatsappNotified = false;
    if (newOrders.length > 0) {
      const statuses = await Promise.all(newOrders.map((o) => sendOrderWhatsAppNotifications(o)));
      whatsappNotified = statuses.every((s) => s.sent);
    }
    return NextResponse.json({ success: true, whatsappNotified });
  } catch (error) {
    console.error('Error en POST /api/store:', error);
    return NextResponse.json({ error: 'Error guardando datos' }, { status: 500 });
  }
}
