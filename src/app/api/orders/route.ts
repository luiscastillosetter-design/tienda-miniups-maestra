import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { applyAffiliateRules } from '@/lib/orderRules';
import { sendOrderWhatsAppNotifications } from '@/lib/whatsappCloud';
import { invalidateStoreKey } from '@/lib/storeCache';
import { rateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * POST /api/orders (público): crea UN pedido nuevo. Nunca devuelve ni acepta el listado de pedidos,
 * así un comprador no puede leer ni sobrescribir pedidos de otros clientes.
 * body: { order: { customer, shipping, payment, items, financials, attribution } }
 */
export async function POST(request: NextRequest) {
  try {
    if (rateLimited(request, 'orders', 10)) {
      return NextResponse.json({ success: false, error: 'Demasiadas solicitudes' }, { status: 429 });
    }
    const body = await request.json().catch(() => null);
    const o = body?.order;
    if (!o || typeof o !== 'object') {
      return NextResponse.json({ success: false, error: 'Pedido inválido' }, { status: 400 });
    }

    const customer = {
      nombre: str(o.customer?.nombre, 100),
      apellido: str(o.customer?.apellido, 100),
      cedula: str(o.customer?.cedula, 30),
      telefono: str(o.customer?.telefono, 30),
      email: str(o.customer?.email, 150),
    };
    const items = Array.isArray(o.items) ? o.items.slice(0, 100) : [];
    const total = Number(o.financials?.total);
    if (!customer.nombre || !customer.telefono || items.length === 0 || !Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ success: false, error: 'Datos del pedido incompletos' }, { status: 400 });
    }

    const receipt = o.payment?.receiptImage;
    if (receipt !== undefined && receipt !== null && receipt !== '') {
      if (typeof receipt !== 'string' || !receipt.startsWith('data:image/') || receipt.length > 4_000_000) {
        return NextResponse.json({ success: false, error: 'Comprobante inválido' }, { status: 400 });
      }
    }

    const existing = await dbService.get('store_orders');
    const orders: any[] = Array.isArray(existing) ? existing : [];
    const taken = new Set(orders.map((x) => x?.id));
    let id = /^TMX-\d{6}$/.test(String(o.id)) ? String(o.id) : '';
    while (!id || taken.has(id)) {
      id = `TMX-${(Date.now() + Math.floor(Math.random() * 1000)).toString().slice(-6)}`;
    }

    let order: any = {
      id,
      date: new Date().toISOString(),
      status: 'Pendiente de verificación',
      customer,
      shipping: {
        courier: str(o.shipping?.courier, 100),
        estado: str(o.shipping?.estado, 100),
        ciudad: str(o.shipping?.ciudad, 100),
        direccion: str(o.shipping?.direccion, 500),
        isFreeShipping: !!o.shipping?.isFreeShipping,
      },
      payment: {
        method: str(o.payment?.method, 50),
        reference: str(o.payment?.reference, 100),
        hasReceipt: !!receipt,
        receiptImage: receipt || undefined,
      },
      items,
      financials: {
        total,
        cost: Number(o.financials?.cost) || 0,
        commission: Number(o.financials?.commission) || 0,
        utility: Number(o.financials?.utility) || 0,
      },
      attribution: {
        affiliateCode: str(o.attribution?.affiliateCode, 50) || 'DIRECTO',
        channel: str(o.attribution?.channel, 50) || 'Directo',
        sessionAffiliateCode: str(o.attribution?.sessionAffiliateCode, 50) || undefined,
        ...(o.attribution?.selfPurchaseBlocked
          ? { selfPurchaseBlocked: true, blockedCode: str(o.attribution?.blockedCode, 50) }
          : {}),
      },
    };
    order = await applyAffiliateRules(order);

    const saved = await dbService.set('store_orders', [order, ...orders]);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'No se pudo guardar el pedido' }, { status: 500 });
    }
    invalidateStoreKey('store_orders');

    let whatsappNotified = false;
    try {
      const status = await sendOrderWhatsAppNotifications(order);
      whatsappNotified = !!status.sent;
    } catch (e) {
      console.error('Error notificando pedido por WhatsApp:', e);
    }
    return NextResponse.json({ success: true, orderId: id, whatsappNotified });
  } catch (error) {
    console.error('Error en POST /api/orders:', error);
    return NextResponse.json({ success: false, error: 'Error creando pedido' }, { status: 500 });
  }
}
