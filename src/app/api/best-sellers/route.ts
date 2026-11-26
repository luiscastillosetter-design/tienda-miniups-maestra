import { NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

export const dynamic = 'force-dynamic';

const COUNTED_STATUSES = new Set(['Pago Aprobado', 'En Preparación', 'Despachado', 'Entregado']);

/**
 * GET /api/best-sellers (público): cantidades vendidas por producto a partir de pedidos reales
 * confirmados. Solo devuelve ids y conteos (nunca datos de clientes, teléfonos ni montos).
 * Ante cualquier fallo responde vacío con 200 para no romper la portada.
 */
export async function GET() {
  try {
    const stored = await dbService.get('store_orders');
    const orders: any[] = Array.isArray(stored) ? stored : [];
    const counts: Record<string, number> = {};

    for (const order of orders) {
      if (!order || !COUNTED_STATUSES.has(order.status) || !Array.isArray(order.items)) continue;
      for (const item of order.items) {
        const rawId = item?.productId ?? item?.id;
        if (rawId === undefined || rawId === null || rawId === '') continue;
        const qty = Number(item?.quantity);
        const add = Number.isFinite(qty) && qty > 0 ? qty : 1;
        const id = String(rawId);
        counts[id] = (counts[id] || 0) + add;
      }
    }

    const bestSellerIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return NextResponse.json({ bestSellerIds, counts });
  } catch (error) {
    console.error('Error en GET /api/best-sellers:', error);
    return NextResponse.json({ bestSellerIds: [], counts: {} });
  }
}
