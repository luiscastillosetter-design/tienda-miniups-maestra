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
              parameters: params.map((text) => ({ type: 'text', text: String(text) })),
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
  if (!courier || /retiro/i.test(courier)) return 'Retiro personal';
  return ciudad ? `Envío vía ${courier} - ${ciudad}` : `Envío vía ${courier}`;
}

/** Envía confirmación al cliente y aviso a administración. Nunca lanza excepción. */
export async function sendOrderWhatsAppNotifications(order: any): Promise<WhatsAppNotifyStatus> {
  try {
    const orderId = String(order?.id || '');
    const customerName = [order?.customer?.nombre, order?.customer?.apellido]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Cliente';
    const customerPhone = normalizePhone(order?.customer?.telefono);
    const total = `${siteConfig.currencySymbol}${(Number(order?.financials?.total) || 0).toFixed(2)} USD`;
    const method = String(order?.payment?.method || 'N/D');
    const adminPhone = normalizePhone(siteConfig.whatsapp.number);

    const settled = await Promise.allSettled([
      sendTemplate(customerPhone, 'confirmacion_pedido_cliente_v4', [
        customerName,
        orderId,
      ]),
      sendTemplate(adminPhone, 'aviso_pedido_admin_v2', [
        orderId,
        customerName,
        customerPhone || String(order?.customer?.telefono || 'N/D'),
        total,
        method,
        deliverySummary(order),
      ]),
    ]);

    const results = settled.map((s, i) =>
      s.status === 'fulfilled'
        ? s.value
        : {
            to: '',
            template: i === 0 ? 'confirmacion_pedido_cliente_v4' : 'aviso_pedido_admin_v2',
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
