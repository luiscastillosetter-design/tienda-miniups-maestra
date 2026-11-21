import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { invalidateStoreKey } from '@/lib/storeCache';
import { isSelfPurchase } from '@/lib/affiliateGuard';
import { siteConfig } from '@/config/site';
import { rateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'private, no-store' };

const clean = (v: unknown) => String(v ?? '').toUpperCase().replace(/\s+/g, '').slice(0, 40);
const s = (v: unknown, max = 150) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function loadAffiliates(): Promise<any[]> {
  const a = await dbService.get('store_affiliates');
  return Array.isArray(a) ? a : [];
}

/** Métricas del afiliado calculadas en servidor: solo agregados de SUS pedidos, sin datos de clientes. */
async function metricsFor(codigo: string) {
  const [orders, paid] = await Promise.all([dbService.get('store_orders'), dbService.get('store_paid_affiliates')]);
  let paidAmount = 0;
  if (paid && typeof paid === 'object' && !Array.isArray(paid)) paidAmount = Number((paid as any)[codigo] || 0);
  else if (Array.isArray(paid) && paid.includes(codigo)) paidAmount = 999999;

  let ventasPendientes = 0;
  let ventasConfirmadas = 0;
  let comisiones = 0;
  (Array.isArray(orders) ? orders : []).forEach((order: any) => {
    if (order?.attribution?.affiliateCode !== codigo) return;
    if (order.status === 'Entregado' || order.status === 'Completado') {
      ventasConfirmadas++;
      comisiones +=
        order.financials?.commission !== undefined
          ? Number(order.financials.commission)
          : Number(order.financials?.total || 0) * siteConfig.affiliateCommissionRate;
    } else if (order.status !== 'Cancelado') {
      ventasPendientes++;
    }
  });
  return { ventasPendientes, ventasConfirmadas, comisionesDisponibles: Math.max(0, comisiones - paidAmount) };
}

/**
 * API pública de afiliados (nunca expone el listado completo):
 *  - register: { nombre, email, telefono, cedula, codigo } → crea el afiliado si el código está libre
 *  - login:    { codigo } → perfil propio + métricas
 *  - metrics:  { codigo } → métricas propias
 *  - check:    { codigo, telefono, email, cedula, sessionAffiliateCode } → { selfPurchase } (autocompra)
 */
export async function POST(request: NextRequest) {
  try {
    if (rateLimited(request, 'affiliate', 40)) {
      return NextResponse.json({ success: false, error: 'Demasiadas solicitudes' }, { status: 429 });
    }
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    const codigo = clean(body?.codigo);
    if (!codigo) return NextResponse.json({ success: false, error: 'Falta código' }, { status: 400 });

    if (action === 'register') {
      const list = await loadAffiliates();
      if (list.some((a) => clean(a?.codigo) === codigo)) {
        return NextResponse.json({ success: false, error: 'CODE_TAKEN' }, { status: 409, headers: NO_STORE });
      }
      const user = {
        nombre: s(body.nombre, 100),
        email: s(body.email),
        telefono: String(body.telefono ?? '').replace(/\D/g, '').slice(0, 20),
        cedula: s(body.cedula, 30),
        codigo,
        joinedAt: new Date().toISOString(),
      };
      if (!user.nombre || !user.email) {
        return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
      }
      if (!(await dbService.set('store_affiliates', [user, ...list]))) {
        return NextResponse.json({ success: false, error: 'No se pudo registrar' }, { status: 500 });
      }
      invalidateStoreKey('store_affiliates');
      return NextResponse.json({ success: true, user, metrics: await metricsFor(codigo) }, { headers: NO_STORE });
    }

    const found = (await loadAffiliates()).find((a) => clean(a?.codigo) === codigo) || null;

    if (action === 'login') {
      if (!found) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404, headers: NO_STORE });
      return NextResponse.json({ success: true, user: found, metrics: await metricsFor(found.codigo) }, { headers: NO_STORE });
    }

    if (action === 'metrics') {
      if (!found) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404, headers: NO_STORE });
      return NextResponse.json({ success: true, metrics: await metricsFor(found.codigo) }, { headers: NO_STORE });
    }

    if (action === 'check') {
      const selfPurchase = isSelfPurchase(
        { telefono: s(body.telefono, 30), email: s(body.email), cedula: s(body.cedula, 30) },
        found,
        s(body.sessionAffiliateCode, 50) || null,
        codigo
      );
      return NextResponse.json({ success: true, selfPurchase }, { headers: NO_STORE });
    }

    return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    console.error('Error en POST /api/affiliate:', error);
    return NextResponse.json({ success: false, error: 'Error procesando solicitud' }, { status: 500 });
  }
}
