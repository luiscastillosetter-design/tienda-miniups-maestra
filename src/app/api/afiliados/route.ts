import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { nombre, telefono, codigo } = await request.json();

    if (!nombre || !telefono || !codigo) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const telefonoLimpio = telefono.replace(/\D/g, '');

    // Validar código en la BD del cliente
    try {
      const apiUbuntu = process.env.NEXT_PUBLIC_API_UBUNTU;
      if (apiUbuntu) {
        await fetch(`${apiUbuntu}/api/validar_afiliado`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo }),
        });
      }
    } catch (e) {
      // Continuar aunque falle
    }

    const mensajeBienvenida = `¡Hola ${nombre}! 🚀 Soy Sofía, asistente de Importadora Todomax. Tu solicitud de embajador fue recibida. Tu código oficial es: ${codigo}. Aquí tienes tu acceso al Google Drive con el material: https://drive.google.com/drive/folders/TU_ENLACE_AQUI ¡Cualquier duda, escríbeme!`;

    const metaPhoneId = process.env.META_PHONE_ID;
    const metaAccessToken = process.env.META_ACCESS_TOKEN;

    if (!metaPhoneId || !metaAccessToken) {
      return NextResponse.json({ error: 'Config incompleta' }, { status: 500 });
    }

    const metaResponse = await fetch(
      `https://graph.facebook.com/v17.0/${metaPhoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: telefonoLimpio,
          type: 'text',
          text: { body: mensajeBienvenida },
        }),
      }
    );

    if (!metaResponse.ok) {
      const errorData = await metaResponse.json();
      console.error('Error Meta API:', errorData);
      return NextResponse.json({ error: 'Error WhatsApp' }, { status: metaResponse.status });
    }

    const metaData = await metaResponse.json();

    return NextResponse.json(
      { success: true, messageId: metaData.messages?.[0]?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
