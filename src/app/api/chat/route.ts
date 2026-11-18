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
const OFFICE_NUMBER = digits(siteConfig.whatsapp.number);
/** WhatsApp del bot Sofía: jamás se entrega como contacto humano. */
const BOT_NUMBER = digits(siteConfig.whatsapp.sofiaNumber);

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
    .map((p) => ({
      id: p.id,
      nombre: p.title,
      categoria: p.category,
      precioUSD: p.price,
      precioAnteriorUSD: p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null,
      descuentoPct:
        p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : null,
      disponibilidad: p.stock > 5 ? 'Disponible' : `Últimas ${p.stock} unidades`,
      resumen: resumen(p.description),
    }));

  let numeros: WaEntry[] = Array.isArray(rawConfig?.whatsappNumbers)
    ? rawConfig.whatsappNumbers
        .filter((w: any) => w?.activo && digits(w?.numero) && digits(w?.numero) !== BOT_NUMBER)
        .map((w: any) => ({
          numero: digits(w.numero),
          etiqueta: String(w.etiqueta || 'WhatsApp'),
          relevancia: String(w.relevancia || ''),
          es_principal_admin: !!w.es_principal_admin,
        }))
    : [];
  if (numeros.length === 0) {
    numeros = [
      {
        numero: OFFICE_NUMBER,
        etiqueta: 'Oficina / Administración',
        relevancia: 'Atención humana directa, confirmación de pagos y soporte de pedidos',
        es_principal_admin: true,
      },
    ];
  }
  if (!numeros.some((n) => n.es_principal_admin)) numeros[0].es_principal_admin = true;

  return { catalogo, numeros, bcv };
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
Eres Sofía, asesora de ventas de ${siteConfig.storeName} (https://www.importadoratodomax.com), tienda en línea de Venezuela. Atiendes desde el chat de la tienda web. Conoces ÚNICA Y EXCLUSIVAMENTE el entorno de importadoratodomax.com: su catálogo en vivo, métodos de pago, ofertas, carrito, pasos de compra y uso de la página. Español cálido, directo y breve (máximo 5-6 líneas, UNA pregunta por mensaje, pocos emojis).

REGLAS OBLIGATORIAS (CERO ALUCINACIONES)
- Usa ÚNICAMENTE los productos, precios y enlaces del CATÁLOGO EN VIVO que aparece al final. Nunca inventes productos, modelos, precios, descuentos, stock, enlaces ni respuestas fuera de importadoratodomax.com.
- Si el cliente pide algo que NO existe en el catálogo, dilo con claridad ("no lo tenemos disponible ahora") y sugiere lo más parecido que SÍ esté en el catálogo. Si el catálogo está vacío, no menciones productos ni precios y envía a la web.
- Todo enlace de producto debe ser exactamente [Nombre del producto](/product/<id>) con el id del catálogo; jamás construyas ni modifiques un id.
- Si el tema no es de importadoratodomax.com, di amablemente que solo puedes ayudar con la tienda.
- Si preguntan por un producto: nombre, precio en USD, oferta si aplica, disponibilidad y el enlace directo. Máximo 3 productos por respuesta.
- Precios en USD; si preguntan por bolívares usa la TASA BCV indicada abajo (precio USD x tasa). Si no hay tasa, dilo y di que la ven en la barra superior de la web.
- Ofertas: solo las que traen precio anterior en el catálogo. Nunca inventes cupones ni promociones.
- Si preguntan cómo pagar o cómo usar la página: da la ruta clara paso a paso.

CÓMO COMPRAR (pasos)
1) Busca o abre el producto en la web. 2) En la ficha elige color/cantidad y pulsa "Agregar al Carrito" (o "Comprar ahora"). 3) Abre el carrito y revisa tu pedido. 4) Ve al checkout, completa tus datos de envío y elige el método de pago. 5) Realiza el pago, escribe el número de referencia y adjunta el comprobante. 6) Confirma el pedido: al final se abre WhatsApp para finalizar la atención con el equipo de la oficina.

MÉTODOS DE PAGO (en el checkout)
Pago Móvil, Transferencia, Zelle, Binance Pay y Efectivo. Cada producto indica en su ficha cuáles acepta. Los datos de la cuenta (banco, teléfono, correo, Pay ID, cédula, RIF) se muestran en el checkout al elegir el método: NO los inventes ni los des tú bajo ninguna circunstancia. Excepto Efectivo, todos requieren referencia y comprobante.
Envío gratis en compras desde ${siteConfig.currencySymbol}${siteConfig.shipping.freeShippingThreshold}. Empresas de envío: ${siteConfig.shipping.companies.join(', ')}.

DERIVACIÓN A HUMANO (REGLA ESTRICTA)
Si el cliente pide hablar con una persona, asesor, personal administrativo, la oficina, tiene un reclamo o quiere confirmar un pago, entrega DE INMEDIATO, sin preguntas previas, el número y el botón de WhatsApp de la oficina/administración de esta lista. Formato: el número en texto (+<número>) y el enlace Markdown [Hablar por WhatsApp con <etiqueta>](<enlace>). Usa SOLO los contactos de esta lista; jamás des ni inventes otro número (en especial, nunca el número del bot). No muestres enlaces de WhatsApp si no hacen falta.
${numeros}

${tasa}

CATÁLOGO ACTUAL EN VIVO (JSON, solo productos con stock):
${JSON.stringify(ctx.catalogo)}`;
}

/** Respuesta básica sin IA, para cuando no hay clave configurada o el proveedor falla. */
function fallbackReply(ctx: Ctx, lastUser: string) {
  const q = lastUser.toLowerCase();
  const principal = ctx.numeros.find((n) => n.es_principal_admin) || ctx.numeros[0];

  if (/(humano|persona|asesor|oficina|administraci|pago|pagu|whatsapp|hablar)/.test(q)) {
    const match =
      ctx.numeros.find((n) => !n.es_principal_admin && n.relevancia && q.split(/\W+/).some((w) => w.length > 4 && n.relevancia.toLowerCase().includes(w))) ||
      principal;
    return `Con gusto te atiende una persona del equipo.\n\n[Hablar por WhatsApp con ${match.etiqueta}](${waLink(match.numero)})`;
  }
  if (/(tasa|bcv|bol[ií]var|bs\b|dolar|dólar)/.test(q)) {
    return ctx.bcv
      ? `La tasa oficial BCV hoy es **Bs. ${ctx.bcv.tasa.toFixed(2)}** por dólar.`
      : 'No pude consultar la tasa BCV ahora mismo; la verás en la barra superior de la web.';
  }
  const words = normalizeSearchText(lastUser).split(/\W+/).filter((w) => w.length > 3);
  let found = ctx.catalogo.filter((p) =>
    words.some((w) => normalizeSearchText(`${p.nombre} ${p.categoria}`).includes(w))
  );
  const intro = found.length > 0 ? 'Mira lo que tengo disponible para ti:' : 'Estos son algunos de nuestros productos disponibles:';
  if (found.length === 0) found = ctx.catalogo;
  const lista = found
    .slice(0, 3)
    .map((p) => `- [${p.nombre}](/product/${p.id}) — $${p.precioUSD.toFixed(2)}`)
    .join('\n');
  return `${intro}\n\n${lista}\n\nPara comprar, entra al producto y pulsa "Agregar al Carrito".`;
}

/** null = sin clave configurada; '' = Anthropic falló; texto = respuesta. */
async function callAnthropic(systemPrompt: string, messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
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
        messages,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      console.error(`[/api/chat] anthropic respondió ${res.status}`);
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
  try {
    const body = await request.json();
    if (Array.isArray(body?.messages)) {
      messages = body.messages
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-12)
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1000) }));
    }
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content;
  if (!lastUser) {
    return NextResponse.json({ error: 'Falta el mensaje' }, { status: 400 });
  }

  const ctx = await loadContext();
  const systemPrompt = buildSystemPrompt(ctx);

  // Prioridad 1: Anthropic Haiku 5.5. Groq y demás solo actúan si falta la clave de Anthropic.
  const anthropicReply = await callAnthropic(systemPrompt, messages);
  if (anthropicReply) return NextResponse.json({ reply: anthropicReply });
  if (anthropicReply === '') return NextResponse.json({ reply: fallbackReply(ctx, lastUser) });

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
          return NextResponse.json({ reply: reply.trim() });
        }
      } else {
        console.error(`[/api/chat] ${provider.name} respondió ${res.status}`);
      }
    } catch (err) {
      console.error(`[/api/chat] Error consultando ${provider.name}:`, err);
    }
  }

  return NextResponse.json({ reply: fallbackReply(ctx, lastUser) });
}
