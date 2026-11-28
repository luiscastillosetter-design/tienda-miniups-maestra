import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { products as defaultProducts, type Product } from '@/data/products';
import { siteConfig } from '@/config/site';
import { obtenerTasaBcv } from '@/lib/tasaBcv';
import { normalizeSearchText } from '@/lib/search';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WaEntry {
  numero: string;
  etiqueta: string;
  relevancia: string;
  es_principal_admin: boolean;
}

interface Provider {
  name: string;
  url: string;
  key: string;
  model: string;
  extraHeaders?: Record<string, string>;
  timeoutMs: number;
}

/**
 * Cadena de proveedores compatibles con OpenAI, en orden de prioridad:
 * 1) OmniRoute, 2) Groq, 3) OpenRouter / OpenAI / Gemini.
 */
function resolveProviders(): Provider[] {
  const model = process.env.AI_MODEL;
  const chain: Provider[] = [];

  const omni = process.env.OMNIROUTE_BASE_URL?.trim().replace(/\/+$/, '');
  if (omni) {
    chain.push({
      name: 'omniroute',
      url: `${omni}/chat/completions`,
      key: process.env.OMNIROUTE_API_KEY || 'sk-local',
      model: process.env.OMNIROUTE_MODEL || 'auto/best-free',
      timeoutMs: 10000,
    });
  }
  if (process.env.GROQ_API_KEY) {
    chain.push({
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      timeoutMs: 15000,
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    chain.push({
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY,
      model: model || 'openai/gpt-4o-mini',
      extraHeaders: { 'X-Title': siteConfig.storeName },
      timeoutMs: 25000,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    chain.push({
      name: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      key: process.env.OPENAI_API_KEY,
      model: model || 'gpt-4o-mini',
      timeoutMs: 25000,
    });
  }
  if (process.env.GEMINI_API_KEY) {
    chain.push({
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      key: process.env.GEMINI_API_KEY,
      model: model || 'gemini-2.0-flash',
      timeoutMs: 25000,
    });
  }
  return chain;
}

const digits = (s: string) => String(s || '').replace(/\D/g, '');

/** WhatsApp de la oficina/administración (atención humana y cierre de pedidos). */
const OFFICE_NUMBER = '584225160057';
/** WhatsApp del bot Sofía: jamás se entrega como contacto humano. */
const BOT_NUMBER = digits(siteConfig.whatsapp.sofiaNumber);

const ADMIN_WA = `https://wa.me/${OFFICE_NUMBER}`;
const CASHEA_WA = `https://api.whatsapp.com/send?phone=${OFFICE_NUMBER}`;
const CATALOG_URL = `${siteConfig.storeUrl}/catalogo`;
const STORE_URL = siteConfig.storeUrl;

const waLink = (numero: string, texto = 'Hola, vengo de Importadora TodoMax y quisiera ayuda') =>
  `https://wa.me/${digits(numero)}?text=${encodeURIComponent(texto)}`;

const resumen = (t: string, n = 140) => {
  const s = (t || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n)}…` : s;
};

async function loadContext() {
  const [rawProducts, rawConfig, bcv] = await Promise.all([
    dbService.get('store_products'),
    dbService.get('store_site_config'),
    obtenerTasaBcv(),
  ]);

  const all: Product[] = Array.isArray(rawProducts) && rawProducts.length > 0 ? rawProducts : defaultProducts;
  const catalogo = all
    .filter((p) => p.stock > 0)
    .map((p) => {
      const variantes = (p.colors || [])
        .map((c) => {
          const tallasStock = c.sizeStock
            ? Object.entries(c.sizeStock)
                .filter(([, n]) => Number(n) > 0)
                .map(([talla]) => talla)
            : null;
          const colorAgotado = tallasStock
            ? tallasStock.length === 0
            : typeof c.stock === 'number' && c.stock <= 0;
          if (colorAgotado) return null;
          return { color: c.name, ...(tallasStock && tallasStock.length ? { tallas: tallasStock } : {}) };
        })
        .filter((v): v is { color: string; tallas?: string[] } => v !== null);
      const tallasGenerales =
        !p.colors?.some((c) => c.sizeStock) && Array.isArray(p.sizes) && p.sizes.length ? p.sizes : null;
      return {
      id: p.id,
      nombre: p.title,
      categoria: p.category,
      precioUSD: p.price,
      precioDivisasUSD: p.divisaPrice && p.divisaPrice > 0 && p.divisaPrice < p.price ? p.divisaPrice : null,
      coloresYTallasDisponibles: variantes.length ? variantes : null,
      tallasDisponibles: tallasGenerales,
      precioAnteriorUSD: p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null,
      descuentoPct:
        p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : null,
      disponibilidad: p.stock > 5 ? 'Disponible' : `Últimas ${p.stock} unidades`,
      resumen: resumen(p.description),
      };
    });

  // Derivación exclusiva a Administración (+58 422-5160057); nunca el bot ni números anteriores.
  const numeros: WaEntry[] = [
    {
      numero: OFFICE_NUMBER,
      etiqueta: 'Administración',
      relevancia: 'Atención humana directa, confirmación de pagos y soporte de pedidos',
      es_principal_admin: true,
    },
  ];

  return { catalogo, numeros, bcv, cfg: (rawConfig && typeof rawConfig === 'object' ? rawConfig : {}) as Record<string, any> };
}

type Ctx = Awaited<ReturnType<typeof loadContext>>;

function buildSystemPrompt(ctx: Ctx) {
  const tasa = ctx.bcv
    ? `Tasa oficial BCV actual: Bs. ${ctx.bcv.tasa.toFixed(2)} por USD (actualizada ${ctx.bcv.fechaActualizacion}). Para dar equivalentes en Bs., multiplica el precio USD por esta tasa y redondea a 2 decimales.`
    : 'La tasa BCV no está disponible en este momento; si la piden, indica que no pudiste consultarla y que la verán en la barra superior de la web.';

  const numeros = ctx.numeros
    .map(
      (n) =>
        `- ${n.etiqueta}${n.es_principal_admin ? ' (PRINCIPAL ADMINISTRACIÓN)' : ''}: +${n.numero} — ${n.relevancia || 'Sin descripción'} → ${waLink(n.numero)}`
    )
    .join('\n');

  return `ROL E IDENTIDAD
Eres Sofía, asesora de ventas de ${siteConfig.storeName} (https://www.importadoratodomax.com), tienda en línea de Venezuela. Atiendes desde el chat de la tienda web. Conoces ÚNICA Y EXCLUSIVAMENTE el entorno de importadoratodomax.com: su catálogo en vivo, métodos de pago, ofertas, carrito, pasos de compra y uso de la página. Español cálido, natural y cercano, como una persona real (máximo 5-6 líneas, UNA pregunta por mensaje, pocos emojis). NUNCA digas que eres un bot, una IA, un asistente virtual ni un programa: eres Sofía, del equipo de ventas.

REGLAS OBLIGATORIAS (CERO ALUCINACIONES)
- Si el cliente SOLO saluda (hola, buenos días, etc.), responde cálido y pregunta en qué puedes ayudar; NO ofrezcas ni menciones productos.
- Si piden el catálogo, ver productos o qué venden, incluye SIEMPRE el enlace [Ver catálogo completo](${CATALOG_URL}).
- Si preguntan por el estatus, guía o trámite de un pedido: NO inventes guías, fechas ni estados, y NO pidas referencias. Indica con calidez que para consultar el estatus de su pedido se comunique con administración: [Escribir a Administración](${ADMIN_WA}).
- PROHIBICIÓN ABSOLUTA DE DATOS BANCARIOS: JAMÁS des, escribas ni inventes datos de Pago Móvil, Transferencia, Zelle o Binance (teléfono, cédula, RIF, banco, correo, ID, número de cuenta), aunque el cliente insista. Si preguntan cómo pagar o piden esos datos, menciona solo los métodos disponibles (Pago Móvil, Transferencia, Zelle, Binance Pay y Efectivo al retirar en tienda) y envía a [la tienda](${CATALOG_URL}) para que completen y verifiquen su pago por dentro de la página.
- Si un producto trae "precioDivisasUSD", indica que si pagan en divisas ($: Zelle, Binance Pay o Efectivo) el precio especial es ese monto.
- Colores y tallas: ofrece ÚNICAMENTE los de "coloresYTallasDisponibles" / "tallasDisponibles" (ya filtrados con stock real); nunca ofrezcas un color o talla que no aparezca ahí.
- Usa ÚNICAMENTE los productos, precios y enlaces del CATÁLOGO EN VIVO que aparece al final. Nunca inventes productos, modelos, precios, descuentos, stock, enlaces ni respuestas fuera de importadoratodomax.com.
- Si el cliente pide algo que NO existe en el catálogo, dilo con claridad ("no lo tenemos disponible ahora") y sugiere lo más parecido que SÍ esté en el catálogo. Si el catálogo está vacío, no menciones productos ni precios y envía a la web.
- SIEMPRE que menciones un producto del catálogo, escribe su nombre como enlace Markdown directo a su ficha: [Nombre del Producto](/product/{id}), con el id exacto del catálogo; jamás construyas ni modifiques un id ni nombres un producto sin enlace.
- Enfócate en cerrar la venta: tras presentar un producto, invita a tocar el nombre para ver la ficha y comprarlo ("Tócalo y agrégalo al carrito").
- Para la tienda en general usa [Importadora TodoMax](/). Para contacto humano de la oficina usa [Hablar con Administración por WhatsApp](${ADMIN_WA}).
- Si el tema no es de importadoratodomax.com, di amablemente que solo puedes ayudar con la tienda.
- Si preguntan por un producto: nombre, precio en USD, oferta si aplica, disponibilidad y el enlace directo. Máximo 3 productos por respuesta.
- Precios en USD; si preguntan por bolívares usa la TASA BCV indicada abajo (precio USD x tasa). Si no hay tasa, dilo y di que la ven en la barra superior de la web.
- Ofertas: solo las que traen precio anterior en el catálogo. Nunca inventes cupones ni promociones.
- Si preguntan cómo pagar o cómo usar la página: da la ruta clara paso a paso.

CÓMO COMPRAR (pasos)
1) Busca o abre el producto en la web. 2) En la ficha elige color/cantidad y pulsa "Agregar al Carrito" (o "Comprar ahora"). 3) Abre el carrito y revisa tu pedido. 4) Ve al checkout, completa tus datos de envío y elige el método de pago. 5) Realiza el pago, escribe el número de referencia y adjunta el comprobante. 6) Confirma el pedido: al final se abre WhatsApp para finalizar la atención con el equipo de la oficina.

MÉTODOS DE PAGO (en el checkout)
Pago Móvil, Transferencia, Zelle, Binance Pay y Efectivo al retirar en tienda. Cada producto indica en su ficha cuáles acepta. Los datos de la cuenta se muestran solo dentro del checkout: NO los inventes ni los des tú bajo ninguna circunstancia. Efectivo al retirar en tienda es el ÚNICO método que no pide comprobante previo; todos los demás se pagan y verifican en el checkout (referencia y comprobante).
Envío gratis en compras desde ${siteConfig.currencySymbol}${siteConfig.shipping.freeShippingThreshold}. Empresas de envío: ${siteConfig.shipping.companies.join(', ')}.

DERIVACIÓN A HUMANO (REGLA ESTRICTA)
Si el cliente pide hablar con una persona, asesor, personal administrativo, la oficina, tiene un reclamo o quiere confirmar un pago, entrega DE INMEDIATO, sin preguntas previas, el número de Administración +58 422-5160057 y el enlace Markdown [Hablar por WhatsApp con Administración](${ADMIN_WA}). Es el ÚNICO número permitido; jamás des ni inventes otro. Prohibido dar el número del bot (+${BOT_NUMBER}) o el número anterior terminado en 56. No muestres enlaces de WhatsApp si no hacen falta.
${numeros}
REFUERZO: cualquier contacto humano, duda especial o compra asistida va EXCLUSIVAMENTE al WhatsApp de Administración +58 422-5160057. Jamás des el número del bot (+${BOT_NUMBER}).

CASHEA (compra en cuotas)
Importadora TodoMax SÍ acepta Cashea: contamos con tienda virtual oficial en Cashea para comprar en cuotas. Si el cliente pregunta por Cashea, explícale que las compras con Cashea NO se procesan por el checkout web, sino directamente con un asesor de Administración por WhatsApp al +58 422-5160057: [Comprar con Cashea por WhatsApp](${CASHEA_WA}). No inventes condiciones, porcentajes de inicial ni plazos de Cashea.

CONFIANZA Y OPINIONES
Si el cliente pregunta por referencias, seguridad o muestra dudas por estafas, tranquilízalo con calidez y menciona: contamos con tienda física/retiro personal, opción de pago en Efectivo al retirar, atención humana directa con Administración en el +58 422-5160057 ([Hablar con Administración](${ADMIN_WA})) y una sección visible de "Opiniones de Clientes" en la portada de la web, donde puede leer experiencias reales y dejar su propia reseña. No inventes testimonios, cifras ni direcciones.

${tasa}

CATÁLOGO ACTUAL EN VIVO (JSON, solo productos con stock):
${JSON.stringify(ctx.catalogo)}`;
}

/** Respuesta cuando la IA falla o hace timeout. */
function fallbackReply() {
  return `Disculpa, tuve un breve inconveniente para responderte 🙏 Mientras tanto, puedes ver todo lo que tenemos aquí: [Ver catálogo](${CATALOG_URL}) o escribirle directo a administración: [Hablar por WhatsApp](${ADMIN_WA})`;
}

const MAX_AI_MESSAGES = 6;
const WINDOW_MS = 24 * 60 * 60 * 1000;

const LIMIT_NOTICE = `\n\nHas alcanzado el límite de mensajes del chat 💛 A partir de ahora puedes continuar directamente con administración: [Hablar por WhatsApp](${ADMIN_WA})`;
const LIMIT_REPLY = `Con mucho gusto te seguimos atendiendo 💛 Ya alcanzaste el límite de mensajes de este chat, pero puedes continuar directamente con administración aquí: [Hablar por WhatsApp](${ADMIN_WA})`;

const norm = (t: string) =>
  normalizeSearchText(t).replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

function isGreeting(t: string) {
  const q = norm(t);
  if (!q || q.split(' ').length > 5) return false;
  return (
    /^(hola+|buenas|buenos dias|buen dia|buenas tardes|buenas noches|hey|saludos|hello|hi|ola|que tal|como estas|como esta)( .*)?$/.test(q) &&
    !/(precio|cuanto|tienen|producto|catalogo|pedido|pago)/.test(q)
  );
}

function isCatalogRequest(t: string) {
  const q = norm(t);
  return /\b(catalogo|ver productos|productos disponibles|que venden|que vende|que tienen|que ofrecen|que productos)\b/.test(q);
}

function isOrderStatus(t: string) {
  const q = norm(t);
  return (
    (/\b(pedido|orden|compra)\b/.test(q) &&
      /(estatus|estado|status|tramite|guia|rastre|seguimiento|donde esta|cuando llega|llego|tracking)/.test(q)) ||
    /\b(mi guia|numero de guia|estatus de mi|estado de mi)\b/.test(q)
  );
}

function paymentReply(ctx: Ctx, t: string): string | null {
  const q = norm(t);
  const wantsData =
    /(pago movil|binance|zelle|transferencia|datos (de|para) (pago|pagar)|numero de cuenta|como (pago|pagar|se paga)|metodos? de pago)/.test(q);
  if (!wantsData) return null;
  // Nunca se entregan datos bancarios por chat: el pago se completa y verifica en la tienda.
  void ctx;
  return `Con gusto 😊 Aceptamos Pago Móvil, Transferencia, Zelle, Binance Pay y Efectivo al retirar en tienda. Para tu seguridad, los datos de pago no se envían por el chat: completa tu pedido y verifica tu pago directamente dentro de la tienda aquí: [Ir al catálogo](${CATALOG_URL})`;
}

/** Respuestas fijas sin IA (no consumen cupo). */
function deterministicReply(ctx: Ctx, t: string): string | null {
  if (isOrderStatus(t))
    return `Con gusto te ayudamos 😊 Para consultar el estatus de tu pedido, por favor comunícate con administración: [Hablar por WhatsApp](${ADMIN_WA})`;
  const pay = paymentReply(ctx, t);
  if (pay) return pay;
  if (isCatalogRequest(t))
    return `¡Con gusto! 😊 Aquí puedes ver todo nuestro catálogo con precios y disponibilidad: [Ver catálogo completo](${CATALOG_URL})\n\nSi algo te llama la atención, cuéntame y te ayudo.`;
  if (isGreeting(t)) return '¡Hola! 😊 Qué gusto saludarte. ¿En qué puedo ayudarte hoy?';
  return null;
}

/** Antispam: máx. MAX_AI_MESSAGES respuestas de IA por sesión cada 24h. */
async function checkLimit(sessionId: string, consume: boolean): Promise<{ allowed: boolean; count: number }> {
  const key = `chat_rl_${sessionId}`;
  const now = Date.now();
  const raw: any = await dbService.get(key);
  let rec: { count: number; start: number } =
    raw && typeof raw.start === 'number' && typeof raw.count === 'number' && now - raw.start < WINDOW_MS
      ? raw
      : { count: 0, start: now };
  if (rec.count >= MAX_AI_MESSAGES) return { allowed: false, count: rec.count };
  if (consume) {
    rec = { ...rec, count: rec.count + 1 };
    await dbService.set(key, rec);
  }
  return { allowed: true, count: rec.count };
}

/** Historial válido para Anthropic: empieza con 'user', roles alternados, sin vacíos. */
function sanitizeForAnthropic(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    const content = (m.content || '').trim();
    if (!content) continue;
    const prev = out[out.length - 1];
    if (prev && prev.role === m.role) prev.content += `
${content}`;
    else if (prev || m.role === 'user') out.push({ role: m.role, content });
  }
  return out;
}

/** null = sin clave configurada; '' = Anthropic falló; texto = respuesta. */
async function callAnthropic(systemPrompt: string, messages: ChatMessage[]): Promise<string | null> {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']+|["']+$/g, '').trim();
  if (!key) return null;
  const clean = sanitizeForAnthropic(messages);
  if (clean.length === 0) return '';
  try {
    // Sin 'temperature': Haiku 5.5 responde HTTP 400 si se envía.
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 500,
        system: systemPrompt,
        messages: clean,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`[/api/chat] anthropic respondió ${res.status}: ${errBody.slice(0, 1000)}`);
      return '';
    }
    const json = await res.json();
    const text = Array.isArray(json?.content)
      ? json.content.filter((b: any) => b?.type === 'text').map((b: any) => b.text).join('')
      : '';
    return text.trim();
  } catch (err) {
    console.error('[/api/chat] Error consultando anthropic:', err);
    return '';
  }
}

export async function POST(request: NextRequest) {
  let messages: ChatMessage[] = [];
  let body0: any = null;
  try {
    const body = await request.json();
    body0 = body;
    if (Array.isArray(body?.messages)) {
      messages = body.messages
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-12)
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1000) }));
    }
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const rawSession = String(body0?.sessionId || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  const sessionId =
    rawSession || `ip-${(request.headers.get('x-forwarded-for') || 'x').split(',')[0].trim().replace(/[^a-zA-Z0-9.:]/g, '')}`;

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content;
  if (!lastUser) {
    return NextResponse.json({ error: 'Falta el mensaje' }, { status: 400 });
  }

  const ctx = await loadContext();

  const lim = await checkLimit(sessionId, false);
  if (!lim.allowed) return NextResponse.json({ reply: LIMIT_REPLY, limitReached: true });

  const fixed = deterministicReply(ctx, lastUser);
  if (fixed) return NextResponse.json({ reply: fixed });

  const used = await checkLimit(sessionId, true);
  const finalNotice = used.count >= MAX_AI_MESSAGES ? LIMIT_NOTICE : '';
  const systemPrompt = buildSystemPrompt(ctx);
  const respond = (reply: string) => NextResponse.json({ reply: reply + finalNotice, limitReached: !!finalNotice });

  // Prioridad 1: Anthropic Haiku 5.5. Groq y demás solo actúan si falta la clave de Anthropic.
  const anthropicReply = await callAnthropic(systemPrompt, messages);
  if (anthropicReply) return respond(anthropicReply);
  // Si Anthropic falla (error HTTP/timeout), se continúa con la cadena de respaldo.

  for (const provider of resolveProviders()) {
    try {
      const res = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.key}`,
          ...provider.extraHeaders,
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.4,
          max_tokens: 500,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
        signal: AbortSignal.timeout(provider.timeoutMs),
      });
      if (res.ok) {
        const json = await res.json();
        const reply = json?.choices?.[0]?.message?.content;
        if (typeof reply === 'string' && reply.trim()) {
          return respond(reply.trim());
        }
      } else {
        console.error(`[/api/chat] ${provider.name} respondió ${res.status}`);
      }
    } catch (err) {
      console.error(`[/api/chat] Error consultando ${provider.name}:`, err);
    }
  }

  return respond(fallbackReply());
}
