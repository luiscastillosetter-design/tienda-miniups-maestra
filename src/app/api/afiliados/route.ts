import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/data/products'; // Simulamos la lectura de DB

// Este archivo sirve como Webhook oficial para Meta / WhatsApp Business API
// Documentación Meta: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

export async function GET(request: NextRequest) {
  // Verificación del Webhook solicitada por Meta (Facebook)
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'TODOMAX_SECURE_TOKEN_2024';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Verificamos si es un mensaje de WhatsApp válido
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const telefonoRemitente = message.from;
        const textoCliente = message.text.body.toLowerCase();
        
        console.log(`Mensaje recibido de ${telefonoRemitente}: ${textoCliente}`);

        // 2. Lógica del Bot IA "Sofía"
        let respuestaBot = "¡Hola! Soy Sofía, la asistente IA de TodoMax 🤖.\n¿En qué producto estás interesado para enviarte tu Kit de Afiliado? (Ej: 'Quiero vender freidora')";

        // Buscamos coincidencia de productos
        const foundProduct = products.find(p => 
          textoCliente.includes(p.title.split(' ')[0].toLowerCase()) || 
          textoCliente.includes(p.category.toLowerCase())
        );

        if (foundProduct) {
          respuestaBot = `¡Excelente elección! Aquí tienes tu kit para *${foundProduct.title}*:\n\n` +
          `📸 *Material Visual:* ${foundProduct.images[0]}\n\n` +
          `📝 *Texto sugerido:* ${foundProduct.adCopy || '¡Compra este increíble producto hoy mismo con envío gratis!'}\n\n` +
          `🔗 Recuerda agregar tu enlace personalizado (?ref=TU_CODIGO) al final de tus publicaciones.`;
        } else if (textoCliente.includes('comision') || textoCliente.includes('ganancia')) {
          respuestaBot = "Tus comisiones están seguras. Puedes revisar tu balance actualizado directamente en tu Panel Privado web en todomax.com/afiliados 💰";
        } else if (textoCliente.includes('humano') || textoCliente.includes('ayuda')) {
          respuestaBot = "En un momento te transferiré con uno de nuestros asesores humanos. Por favor, aguarda en la línea. 👨‍💻";
        }

        // 3. Envío de Respuesta vía Meta Graph API
        const metaPhoneId = process.env.META_PHONE_ID;
        const metaAccessToken = process.env.META_ACCESS_TOKEN;

        // Si tenemos los tokens configurados en .env, disparamos el mensaje real
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

    // Respuesta genérica si no es un mensaje de texto de WA
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Error en Webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}