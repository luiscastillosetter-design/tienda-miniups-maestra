import { NextRequest, NextResponse } from 'next/server';
import { products as defaultProducts, Product } from '@/data/products';
import { dbService } from '@/services/dbService';

const BASE_STORE_URL = 'https://tienda-miniups-maestra.vercel.app';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'TODOMAX_SECURE_TOKEN_2024';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const telefonoRemitente = message.from;
        const textoCliente = message.text.body.toLowerCase();

        // Leer catálogo actualizado desde Redis o respaldo local
        const storedProducts = await dbService.get('store_products');
        const activeProducts: Product[] = Array.isArray(storedProducts) && storedProducts.length > 0
          ? storedProducts
          : defaultProducts;

        let respuestaBot = "¡Hola! Soy Sofía, la asistente IA de TodoMax 🤖.\n¿En qué producto estás interesado para enviarte tu Kit de Afiliado? (Ej: 'Quiero vender freidora')";

        const foundProduct = activeProducts.find(p => 
          textoCliente.includes(p.title.split(' ')[0].toLowerCase()) || 
          textoCliente.includes(p.category.toLowerCase())
        );

        if (foundProduct) {
          respuestaBot = `¡Excelente elección! Aquí tienes tu kit para *${foundProduct.title}*:\n\n` +
          `📝 *Texto sugerido:* ${foundProduct.adCopy || '¡Compra este increíble producto hoy mismo con envío gratis!'}\n\n` +
          `🔗 Tu enlace base: ${BASE_STORE_URL}/product/${foundProduct.id}?ref=TU_CODIGO`;
        } else if (textoCliente.includes('comision') || textoCliente.includes('ganancia')) {
          respuestaBot = `Tus comisiones están seguras. Puedes revisar tu balance actualizado directamente en tu Panel Privado web en ${BASE_STORE_URL}/afiliados 💰`;
        } else if (textoCliente.includes('humano') || textoCliente.includes('ayuda')) {
          respuestaBot = "En un momento te transferiré con uno de nuestros asesores humanos. Por favor, aguarda en la línea. 👨‍💻";
        }

        const metaPhoneId = process.env.META_PHONE_ID;
        const metaAccessToken = process.env.META_ACCESS_TOKEN;

        if (metaPhoneId && metaAccessToken) {
          await fetch(`https://graph.facebook.com/v17.0/${metaPhoneId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${metaAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: telefonoRemitente,
              type: 'text',
              text: { body: respuestaBot },
            }),
          });
        }

        return NextResponse.json({ status: 'Mensaje procesado y respondido' }, { status: 200 });
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error en Webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}