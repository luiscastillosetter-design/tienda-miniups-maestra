import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { products as defaultProducts, type Product } from '@/data/products';
import { siteConfig } from '@/config/site';
import { obtenerTasaBcv } from '@/lib/tasaBcv';
import { normalizeSearchText } from '@/lib/search';
import { getAdminRole, type AdminRole } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const LOW_STOCK = 5; // mismo umbral de "Últimas unidades" que usa la tienda

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const caracasDay = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas' }).format(d);

const usd = (n: number) => `$${(Number(n) || 0).toFixed(2)}`;
const bsFmt = (n: number) =>
  `Bs. ${(Number(n) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ───────────────────────────── Datos reales (Supabase: tabla store_data) ─────────────────────────────

async function loadData() {
  const [orders, products, affiliates, paid, visits, marketing, bcv] = await Promise.all([
    dbService.get('store_orders'),
    dbService.get('store_products'),
    dbService.get('store_affiliates'),
    dbService.get('store_paid_affiliates'),
    dbService.get('store_visits'),
    dbService.get('store_marketing_config'),
    obtenerTasaBcv(),
  ]);
  return {
    orders: (Array.isArray(orders) ? orders : []) as any[],
    products: (Array.isArray(products) && products.length > 0 ? products : defaultProducts) as Product[],
    affiliates: (Array.isArray(affiliates) ? affiliates : []) as any[],
    paid: (paid && typeof paid === 'object' ? paid : {}) as Record<string, number>,
    visits: visits as any,
    marketing: (marketing && typeof marketing === 'object' ? marketing : {}) as Record<string, any>,
    bcv,
  };
}

type Data = Awaited<ReturnType<typeof loadData>>;

const total = (o: any) => Number(o?.financials?.total) || 0;
const commission = (o: any) =>
  o?.financials?.commission !== undefined
    ? Number(o.financials.commission) || 0
    : total(o) * siteConfig.affiliateCommissionRate;

const PENDING = 'Pendiente de verificación';
const isConfirmed = (o: any) => o.status !== 'Cancelado' && o.status !== PENDING;

function permissions(role: AdminRole) {
  return {
    sales: role === 'Super Admin' || role === 'Logística y Pagos',
    marketing: role === 'Super Admin' || role === 'Marketing y Afiliados',
    profit: role === 'Super Admin',
  };
}

function buildSnapshot(d: Data, role: AdminRole) {
  const perm = permissions(role);
  const today = caracasDay(new Date());
  const tasa = d.bcv?.tasa ?? null;
  const toBs = (n: number) => (tasa ? Math.round(n * tasa * 100) / 100 : null);
  const money = (n: number) => ({ usd: Math.round(n * 100) / 100, bs: toBs(n) });

  const todayOrders = d.orders.filter((o) => o?.date && caracasDay(new Date(o.date)) === today);

  const byStatus: Record<string, { pedidos: number; usd: number }> = {};
  for (const o of todayOrders) {
    const s = byStatus[o.status] || (byStatus[o.status] = { pedidos: 0, usd: 0 });
    s.pedidos += 1;
    s.usd += total(o);
  }

  const confirmedToday = todayOrders.filter(isConfirmed);
  const pendingAll = d.orders.filter((o) => o.status === PENDING);

  // Productos movidos hoy (pedidos de hoy no cancelados)
  const movido = new Map<string, { nombre: string; unidades: number; usd: number }>();
  for (const o of todayOrders.filter((x) => x.status !== 'Cancelado')) {
    for (const it of Array.isArray(o.items) ? o.items : []) {
      const k = String(it.id);
      const cur = movido.get(k) || { nombre: String(it.title), unidades: 0, usd: 0 };
      cur.unidades += Number(it.quantity) || 0;
      cur.usd += (Number(it.price) || 0) * (Number(it.quantity) || 0);
      movido.set(k, cur);
    }
  }
  const topHoy = [...movido.values()].sort((a, b) => b.unidades - a.unidades).slice(0, 5);

  const agotados = d.products.filter((p) => p.stock <= 0).map((p) => ({ nombre: p.title, stock: 0 }));
  const stockBajo = d.products
    .filter((p) => p.stock > 0 && p.stock <= LOW_STOCK)
    .sort((a, b) => a.stock - b.stock)
    .map((p) => ({ nombre: p.title, stock: p.stock }));

  const ventas = {
    fecha: today,
    pedidosHoy: todayOrders.length,
    desglosePorEstado: Object.entries(byStatus).map(([estado, v]) => ({ estado, pedidos: v.pedidos, ...money(v.usd) })),
    ventasConfirmadasHoy: { pedidos: confirmedToday.length, ...money(confirmedToday.reduce((a, o) => a + total(o), 0)) },
    pendientesDeVerificacionHoy: {
      pedidos: byStatus[PENDING]?.pedidos || 0,
      ...money(byStatus[PENDING]?.usd || 0),
    },
    productosMasMovidosHoy: topHoy.map((p) => ({ nombre: p.nombre, unidades: p.unidades, usd: Math.round(p.usd * 100) / 100 })),
    ...(perm.profit
      ? {
          utilidadBrutaConfirmadaHoy: Math.round(
            confirmedToday.reduce((a, o) => a + total(o) - (Number(o?.financials?.cost) || 0), 0) * 100
          ) / 100,
        }
      : {}),
  };

  const pendientes = {
    totalPendientes: pendingAll.length,
    montoUsd: Math.round(pendingAll.reduce((a, o) => a + total(o), 0) * 100) / 100,
    pedidos: pendingAll
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 10)
      .map((o) => ({
        id: o.id,
        fecha: o.date,
        cliente: `${o.customer?.nombre || ''} ${o.customer?.apellido || ''}`.trim(),
        metodoPago: o.payment?.method || null,
        comprobante: !!o.payment?.hasReceipt,
        ...money(total(o)),
      })),
  };

  const visitsToday = Number(d.visits?.days?.[today]) || 0;
  const now = Date.now();
  const activos = d.visits?.sessions
    ? Object.values(d.visits.sessions).filter((ts: any) => now - Number(ts) <= 10 * 60 * 1000).length
    : 0;
  const adSpend = Number(d.marketing?.adSpend) || 0;

  const canales: Record<string, { pedidos: number; usd: number }> = {};
  for (const o of d.orders.filter(isConfirmed)) {
    const ch = o.attribution?.channel || 'Directo';
    const c = canales[ch] || (canales[ch] = { pedidos: 0, usd: 0 });
    c.pedidos += 1;
    c.usd += total(o);
  }

  const codes = new Set<string>();
  d.affiliates.forEach((a) => a?.codigo && codes.add(a.codigo));
  d.orders.forEach((o) => {
    const c = o?.attribution?.affiliateCode;
    if (c && c !== 'DIRECTO') codes.add(c);
  });
  const afiliados = [...codes]
    .map((code) => {
      const reg = d.affiliates.find((a) => a?.codigo === code);
      const ords = d.orders.filter((o) => o?.attribution?.affiliateCode === code);
      const entregadas = ords.filter((o) => o.status === 'Entregado');
      const acumulada = entregadas.reduce((a, o) => a + commission(o), 0);
      const pagado = Number(d.paid[code] || 0);
      return {
        codigo: code,
        nombre: reg?.nombre || 'Afiliado Independiente',
        pedidos: ords.length,
        entregadas: entregadas.length,
        vendidoUsd: Math.round(entregadas.reduce((a, o) => a + total(o), 0) * 100) / 100,
        comisionDisponibleUsd: Math.round(Math.max(0, acumulada - pagado) * 100) / 100,
      };
    })
    .sort((a, b) => b.vendidoUsd - a.vendidoUsd);

  const marketing = {
    visitas: {
      hoy: visitsToday,
      total: Number(d.visits?.total) || 0,
      activasAhora: activos,
      datosDisponibles: !!d.visits,
    },
    gastoPublicidadAcumuladoUsd: adSpend,
    conversionHoyPct: visitsToday > 0 ? Math.round((todayOrders.length / visitsToday) * 1000) / 10 : null,
    ventasConfirmadasPorCanal: Object.entries(canales).map(([canal, v]) => ({
      canal,
      pedidos: v.pedidos,
      usd: Math.round(v.usd * 100) / 100,
    })),
    afiliadosRegistrados: d.affiliates.length,
    afiliadosTop: afiliados.slice(0, 5),
  };

  const inventario = {
    umbralStockBajo: LOW_STOCK,
    agotados,
    stockBajo,
    totalProductos: d.products.length,
  };

  return {
    tasaBcv: d.bcv ? { bsPorUsd: d.bcv.tasa, actualizada: d.bcv.fechaActualizacion } : null,
    permisos: perm,
    ...(perm.sales ? { ventas, pedidosPendientes: pendientes, inventario } : {}),
    ...(perm.marketing ? { marketing } : {}),
  };
}

type Snapshot = ReturnType<typeof buildSnapshot>;

// ───────────────────────────── Reportes determinísticos (sin IA, 100% datos reales) ─────────────────────────────

const money = (m: { usd: number; bs: number | null }) => `${usd(m.usd)}${m.bs !== null ? ` (≈ ${bsFmt(m.bs)})` : ''}`;
const DENIED = '🔒 Tu rol de acceso no incluye esta información en el panel, por lo que no puedo mostrártela.';

function tasaLine(s: Snapshot) {
  return s.tasaBcv
    ? `Tasa BCV: **Bs. ${s.tasaBcv.bsPorUsd.toFixed(2)}** por USD`
    : 'Tasa BCV: no pude consultarla ahora; solo muestro USD.';
}

function reportSales(s: Snapshot): string {
  if (!s.ventas) return DENIED;
  const v = s.ventas;
  const L = [`**📊 Reporte del día — ${v.fecha}**`, tasaLine(s), ''];
  L.push(`- Pedidos recibidos hoy: **${v.pedidosHoy}**`);
  L.push(`- Ventas confirmadas (pago aprobado en adelante): **${v.ventasConfirmadasHoy.pedidos}** pedidos → **${money(v.ventasConfirmadasHoy)}**`);
  L.push(`- Pendientes de verificación hoy: **${v.pendientesDeVerificacionHoy.pedidos}** → ${money(v.pendientesDeVerificacionHoy)}`);
  if (v.desglosePorEstado.length) {
    L.push('', '**Por estado:**');
    v.desglosePorEstado.forEach((e) => L.push(`- ${e.estado}: ${e.pedidos} pedido(s) → ${money(e)}`));
  } else {
    L.push('', 'Aún no hay pedidos registrados hoy.');
  }
  if ('utilidadBrutaConfirmadaHoy' in v) L.push('', `Utilidad bruta (venta − costo) de lo confirmado hoy: **${usd(v.utilidadBrutaConfirmadaHoy as number)}**`);
  L.push('', '**Productos más movidos hoy:**');
  if (v.productosMasMovidosHoy.length) v.productosMasMovidosHoy.forEach((p) => L.push(`- ${p.nombre}: ${p.unidades} und. (${usd(p.usd)})`));
  else L.push('- Sin movimiento de productos hoy.');
  if (s.inventario) {
    const inv = s.inventario;
    if (inv.agotados.length || inv.stockBajo.length)
      L.push('', `⚠️ Alertas de stock: **${inv.agotados.length}** agotado(s) y **${inv.stockBajo.length}** con stock bajo (≤ ${inv.umbralStockBajo}). Pídeme "stock bajo" para el detalle.`);
    else L.push('', '✅ Sin alertas de stock.');
  }
  return L.join('\n');
}

function reportPending(s: Snapshot): string {
  if (!s.pedidosPendientes) return DENIED;
  const p = s.pedidosPendientes;
  if (p.totalPendientes === 0) return '✅ No hay pedidos pendientes de verificación en este momento.';
  const L = [`**⏳ Pedidos pendientes de verificación: ${p.totalPendientes}** (total ${usd(p.montoUsd)})`, tasaLine(s), ''];
  p.pedidos.forEach((o) =>
    L.push(
      `- **${o.id}** · ${o.cliente || 'Sin nombre'} · ${money(o)} · ${o.metodoPago || 'método s/d'} · ${o.comprobante ? 'con comprobante' : 'SIN comprobante'}`
    )
  );
  if (p.totalPendientes > p.pedidos.length) L.push('', `…y ${p.totalPendientes - p.pedidos.length} más en el panel (pestaña Pedidos).`);
  return L.join('\n');
}

function reportMarketing(s: Snapshot): string {
  if (!s.marketing) return DENIED;
  const m = s.marketing;
  const L = ['**📣 Resumen de marketing y tráfico**', ''];
  if (m.visitas.datosDisponibles) {
    L.push(`- Visitas reales hoy: **${m.visitas.hoy}** · totales: **${m.visitas.total}** · activas ahora: **${m.visitas.activasAhora}**`);
  } else {
    L.push('- Visitas: no hay datos de visitas registrados todavía.');
  }
  L.push(
    m.conversionHoyPct !== null
      ? `- Conversión de hoy (pedidos ÷ visitas): **${m.conversionHoyPct}%**`
      : '- Conversión de hoy: no calculable (sin visitas hoy).'
  );
  L.push(`- Gasto en publicidad acumulado (configurado en el panel): **${usd(m.gastoPublicidadAcumuladoUsd)}**`);
  L.push('', '**Ventas confirmadas por canal:**');
  if (m.ventasConfirmadasPorCanal.length) m.ventasConfirmadasPorCanal.forEach((c) => L.push(`- ${c.canal}: ${c.pedidos} pedido(s) · ${usd(c.usd)}`));
  else L.push('- Aún no hay ventas confirmadas atribuidas.');
  L.push('', `**Afiliados:** ${m.afiliadosRegistrados} registrado(s)`);
  if (m.afiliadosTop.length)
    m.afiliadosTop.forEach((a) =>
      L.push(`- ${a.nombre} (${a.codigo}): ${a.pedidos} pedidos, ${a.entregadas} entregadas, vendido ${usd(a.vendidoUsd)}, comisión disponible ${usd(a.comisionDisponibleUsd)}`)
    );
  else L.push('- Sin actividad de afiliados.');
  return L.join('\n');
}

function reportStock(s: Snapshot): string {
  if (!s.inventario) return DENIED;
  const inv = s.inventario;
  if (!inv.agotados.length && !inv.stockBajo.length)
    return `✅ Inventario sano: ningún producto agotado ni con stock ≤ ${inv.umbralStockBajo} (de ${inv.totalProductos} productos).`;
  const L = [`**📦 Alertas de inventario** (umbral stock bajo: ≤ ${inv.umbralStockBajo})`, ''];
  if (inv.agotados.length) {
    L.push(`🔴 **Agotados (${inv.agotados.length}):**`);
    inv.agotados.forEach((p) => L.push(`- ${p.nombre}`));
    L.push('');
  }
  if (inv.stockBajo.length) {
    L.push(`🟠 **Stock bajo (${inv.stockBajo.length}):**`);
    inv.stockBajo.forEach((p) => L.push(`- ${p.nombre}: ${p.stock} und.`));
  }
  return L.join('\n');
}

const norm = (t: string) => normalizeSearchText(t).replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Atajos que se responden directo con datos reales, sin IA. Solo si el mensaje es una consulta corta/directa. */
function directReport(s: Snapshot, text: string): string | null {
  const q = norm(text);
  if (q.split(' ').length > 6) return null;
  if (/\b(pendiente|pendientes)\b/.test(q) && /\b(pedido|pedidos|pago|pagos|verificacion)\b/.test(q)) return reportPending(s);
  if (/\b(stock|agotado|agotados|inventario)\b/.test(q)) return reportStock(s);
  if (/\b(marketing|trafico|visitas|afiliados|publicidad)\b/.test(q)) return reportMarketing(s);
  if (/\b(reporte|resumen|ventas|vendido|vendimos|cierre|balance)\b/.test(q) && !/\b(marketing|afiliados)\b/.test(q))
    return reportSales(s);
  return null;
}

// ───────────────────────────── IA (solo redacta sobre datos reales del snapshot) ─────────────────────────────

function systemPrompt(role: AdminRole, s: Snapshot) {
  return `Eres "Sofía Admin", asistente interna de reportes y gestión de ${siteConfig.storeName}. Hablas solo con el administrador autenticado (rol: ${role}). Español claro, directo y ejecutivo; usa listas cortas y **negritas** para cifras.

REGLAS ESTRICTAS (CERO ALUCINACIONES)
- Responde ÚNICAMENTE con los datos del SNAPSHOT JSON de abajo (datos reales y en vivo de la base de datos). Nunca inventes cifras, pedidos, productos, clientes ni porcentajes.
- Si el dato pedido no está en el snapshot, dilo con claridad ("ese dato no existe/no está disponible en el panel") y no lo estimes.
- Si una sección no aparece en el snapshot es porque el rol no tiene acceso: indícalo.
- Montos: USD y, cuando exista tasaBcv, equivalente en Bs. (usd × bsPorUsd). Si no hay tasa, solo USD.
- No des contraseñas, datos de pago ni cédulas. No ejecutas acciones: solo informas.
- "Hoy" se calcula en hora de Caracas (campo ventas.fecha).

SNAPSHOT (JSON):
${JSON.stringify(s)}`;
}

async function callAnthropic(system: string, messages: ChatMessage[]): Promise<string | null> {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']+|["']+$/g, '').trim();
  if (!key) return null;
  const clean: ChatMessage[] = [];
  for (const m of messages) {
    const content = m.content.trim();
    if (!content) continue;
    const prev = clean[clean.length - 1];
    if (prev && prev.role === m.role) prev.content += `\n${content}`;
    else if (prev || m.role === 'user') clean.push({ role: m.role, content });
  }
  if (!clean.length) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 800, system, messages: clean }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      console.error(`[/api/admin/chat] anthropic respondió ${res.status}`);
      return null;
    }
    const json = await res.json();
    const text = Array.isArray(json?.content)
      ? json.content.filter((b: any) => b?.type === 'text').map((b: any) => b.text).join('')
      : '';
    return text.trim() || null;
  } catch (err) {
    console.error('[/api/admin/chat] Error consultando anthropic:', err);
    return null;
  }
}

// ───────────────────────────── Handler ─────────────────────────────

export async function POST(request: NextRequest) {
  // Autenticación obligatoria en servidor (cookie firmada emitida por /api/admin/login).
  const role = getAdminRole(request);
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });

  let messages: ChatMessage[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body?.messages)) {
      messages = body.messages
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-16)
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    }
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400, headers: NO_STORE });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content;
  if (!lastUser) return NextResponse.json({ error: 'Falta el mensaje' }, { status: 400, headers: NO_STORE });

  try {
    const snapshot = buildSnapshot(await loadData(), role);

    const direct = directReport(snapshot, lastUser);
    if (direct) return NextResponse.json({ reply: direct }, { headers: NO_STORE });

    const ai = await callAnthropic(systemPrompt(role, snapshot), messages);
    if (ai) return NextResponse.json({ reply: ai }, { headers: NO_STORE });

    // Sin IA disponible: entrega el reporte del día con datos reales.
    return NextResponse.json(
      { reply: `No pude redactar una respuesta personalizada ahora; te dejo el reporte con datos reales:\n\n${reportSales(snapshot)}` },
      { headers: NO_STORE }
    );
  } catch (err) {
    console.error('[/api/admin/chat] Error:', err);
    return NextResponse.json({ error: 'Error generando el reporte' }, { status: 500, headers: NO_STORE });
  }
}
