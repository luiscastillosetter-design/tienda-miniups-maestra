import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { applyAffiliateRules } from '@/lib/orderRules';
import { sendOrderWhatsAppNotifications } from '@/lib/whatsappCloud';
import { invalidateStoreKey } from '@/lib/storeCache';
import { rateLimited } from '@/lib/rateLimit';
import { siteConfig } from '@/config/site';
import { products as defaultProducts } from '@/data/products';
import { obtenerTasaBcv } from '@/lib/tasaBcv';

export const dynamic = 'force-dynamic';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const MAX_QTY = 999;

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * POST /api/orders (público): crea UN pedido nuevo. Nunca devuelve ni acepta el listado de pedidos,
 * así un comprador no puede leer ni sobrescribir pedidos de otros clientes.
 * body: { order: { customer, shipping, payment, items: [{id, quantity, selectedColor?, selectedSize?}], attribution } }
 * Los precios, subtotales, total, costo, utilidad y comisión que envíe el navegador se IGNORAN:
 * todo se recalcula aquí con los productos reales de `store_products`.
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
    const rawItems: any[] = Array.isArray(o.items) ? o.items.slice(0, 100) : [];
    if (!customer.nombre || !customer.telefono || rawItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Datos del pedido incompletos' }, { status: 400 });
    }

    // ── Recálculo en servidor con los productos reales ──
    const [storedProducts, siteCfg] = await Promise.all([dbService.get('store_products'), dbService.get('store_site_config')]);
    const catalog: any[] = Array.isArray(storedProducts) && storedProducts.length > 0 ? storedProducts : defaultProducts;
    const byId = new Map<string, any>(catalog.map((p) => [String(p?.id), p]));

    const lines = new Map<string, any>();
    for (const raw of rawItems) {
      const qty = Number(raw?.quantity);
      if (!raw || typeof raw !== 'object' || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        return NextResponse.json({ success: false, error: 'Cantidad inválida en el pedido' }, { status: 400 });
      }
      const product = byId.get(String(raw.id));
      if (!product) {
        return NextResponse.json({ success: false, error: 'Un producto del pedido ya no existe' }, { status: 400 });
      }
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ success: false, error: 'Producto sin precio válido' }, { status: 400 });
      }
      const color = str(raw.selectedColor, 50);
      const size = str(raw.selectedSize, 30);
      const key = `${product.id}|${color}|${size}`;
      const prev = lines.get(key);
      lines.set(key, {
        id: String(product.id),
        title: String(product.title ?? ''),
        price,
        image:
          (color && Array.isArray(product.colors) && product.colors.find((c: any) => c?.name === color)?.image) ||
          (Array.isArray(product.images) ? product.images[0] ?? '' : ''),
        quantity: (prev?.quantity || 0) + qty,
        ...(color ? { selectedColor: color } : {}),
        ...(size ? { selectedSize: size } : {}),
      });
    }

    const items = Array.from(lines.values());
    for (const it of items) {
      const stock = Number(byId.get(it.id)?.stock);
      if (Number.isFinite(stock) && it.quantity > stock) {
        return NextResponse.json(
          { success: false, error: `Stock insuficiente para "${it.title}" (disponible: ${Math.max(0, stock)})` },
          { status: 409 }
        );
      }
    }

    const total = round2(items.reduce((acc, it) => acc + it.price * it.quantity, 0));
    const totalCost = round2(
      items.reduce((acc, it) => acc + (Number(byId.get(it.id)?.cost) || 0) * it.quantity, 0)
    );
    const threshold = Number((siteCfg as any)?.freeShippingThreshold) || siteConfig.shipping.freeShippingThreshold;
    const isFreeShipping = total >= threshold;
    const bcv = await obtenerTasaBcv().catch(() => null);

    if (!Number.isFinite(total) || total <= 0) {
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
        isFreeShipping,
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
        cost: totalCost,
        commission: 0,
        utility: round2(total - totalCost),
        ...(bcv ? { tasaBcv: bcv.tasa, totalBs: round2(total * bcv.tasa) } : {}),
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
    order.financials.commission = round2(order.financials.commission);
    order.financials.utility = round2(order.financials.utility);

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
    return NextResponse.json({
      success: true,
      orderId: id,
      whatsappNotified,
      // Resumen para el comprador (sin costo/utilidad/comisión)
      summary: { items: order.items, total, isFreeShipping, ...(bcv ? { tasaBcv: bcv.tasa, totalBs: order.financials.totalBs } : {}) },
    });
  } catch (error) {
    console.error('Error en POST /api/orders:', error);
    return NextResponse.json({ success: false, error: 'Error creando pedido' }, { status: 500 });
  }
}
