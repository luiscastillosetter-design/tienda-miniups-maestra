import { siteConfig } from '@/config/site';

const GRAPH_VERSION = 'v21.0';

export interface WhatsAppSendResult {
  to: string;
  template: string;
  ok: boolean;
  error?: string;
}

export interface WhatsAppNotifyStatus {
  sent: boolean;
  results: WhatsAppSendResult[];
}

/** Normaliza teléfonos a solo dígitos con código de país (Venezuela: 04xx / 4xx -> 584xx). */
export function normalizePhone(raw: unknown): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('04') && digits.length === 11) return `58${digits.slice(1)}`;
  if (digits.startsWith('4') && digits.length === 10) return `58${digits}`;
  return digits;
}

/** Limpia un parámetro de plantilla: sin saltos de línea/tabs/espacios múltiples y nunca vacío (evita error 132018). */
function cleanParam(value: unknown): string {
  const t = String(value ?? '').replace(/\s+/g, ' ').trim();
  return t || 'N/A';
}

/** Número de pedido sin '#' inicial (la plantilla ya incluye #{{n}}). */
function cleanOrderId(value: unknown): string {
  return cleanParam(String(value ?? '').trim().replace(/^#+/, ''));
}

/** Productos en una sola línea: "2x Título (Color, Talla) | 1x Otro". */
function formatItems(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return 'N/A';
  const parts = items
    .map((it: any) => {
      const title = cleanParam(it?.title);
      const qty = Number(it?.quantity) > 0 ? Number(it.quantity) : 1;
      const opts = [it?.selectedColor, it?.selectedSize]
        .map((v) => String(v ?? '').trim())
        .filter(Boolean)
        .join(', ');
      return `${qty}x ${title}${opts ? ` (${opts})` : ''}`;
    });
  return cleanParam(parts.join(' | '));
}

async function sendTemplate(
  to: string,
  template: string,
  params: string[]
): Promise<WhatsAppSendResult> {
  const token = (process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN || '').trim();
  const phoneId = (process.env.WHATSAPP_PHONE_ID || process.env.META_PHONE_ID || '').trim();

  if (!token || !phoneId) {
    const error = 'Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_ID';
    console.error(`[whatsappCloud] ${template}: ${error}`);
    return { to, template, ok: false, error };
  }
  if (!to) {
    const error = 'Teléfono destino vacío o inválido';
    console.error(`[whatsappCloud] ${template}: ${error}`);
    return { to, template, ok: false, error };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters: params.map((text) => ({ type: 'text', text: cleanParam(text) })),
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const error = `Meta respondió ${res.status}: ${detail.slice(0, 300)}`;
      console.error(`[whatsappCloud] ${template} -> ${to}: ${error}`);
      return { to, template, ok: false, error };
    }
    return { to, template, ok: true };
  } catch (e: any) {
    const error = e?.message || 'Error de red';
    console.error(`[whatsappCloud] ${template} -> ${to}: ${error}`);
    return { to, template, ok: false, error };
  }
}

function deliverySummary(order: any): string {
  const courier = String(order?.shipping?.courier || '').trim();
  const ciudad = String(order?.shipping?.ciudad || '').trim();
  if (!courier || /retiro/i.test(courier)) return 'Retiro en Tienda';
  return ciudad ? `Envío vía ${courier} - ${ciudad}` : `Envío vía ${courier}`;
}

/** Envía confirmación al cliente y aviso a administración. Nunca lanza excepción. */
export async function sendOrderWhatsAppNotifications(order: any): Promise<WhatsAppNotifyStatus> {
  try {
    const orderId = cleanOrderId(order?.id);
    const fullName = [order?.customer?.nombre, order?.customer?.apellido].filter(Boolean).join(' ');
    const customerName = cleanParam(fullName || 'Cliente');
    const customerPhone = normalizePhone(order?.customer?.telefono);
    const totalAmount = `${siteConfig.currencySymbol}${(Number(order?.financials?.total) || 0).toFixed(2)} USD`;
    const method = cleanParam(order?.payment?.method);
    const products = formatItems(order?.items);
    const adminPhone = normalizePhone(siteConfig.whatsapp.number);

    const CLIENT_TPL = 'confirmacion_pedido_cliente_v5';
    const ADMIN_TPL = 'aviso_pedido_admin_v3';

    const settled = await Promise.allSettled([
      sendTemplate(customerPhone, CLIENT_TPL, [
        customerName,
        orderId,
        products,
        `${totalAmount} (${method})`,
      ]),
      sendTemplate(adminPhone, ADMIN_TPL, [
        orderId,
        customerName,
        customerPhone || String(order?.customer?.telefono || 'N/A'),
        products,
        totalAmount,
        method,
        deliverySummary(order),
      ]),
    ]);

    const results = settled.map((s, i) =>
      s.status === 'fulfilled'
        ? s.value
        : {
            to: '',
            template: i === 0 ? CLIENT_TPL : ADMIN_TPL,
            ok: false,
            error: String(s.reason),
          }
    );
    return { sent: results.every((r) => r.ok), results };
  } catch (e) {
    console.error('[whatsappCloud] Error inesperado:', e instanceof Error ? e.message : 'desconocido');
    return { sent: false, results: [] };
  }
}
