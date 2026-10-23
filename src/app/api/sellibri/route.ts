import { NextRequest, NextResponse } from 'next/server';

// Endpoint para comunicación con Sellibrí o ERP externo
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const SELLIBRI_SECRET = process.env.SELLIBRI_API_KEY || 'todomax_sellibri_secret_2024';

    // Verificación de seguridad
    if (authHeader !== `Bearer ${SELLIBRI_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await request.json();
    const { action, orderId, trackingNumber, status } = payload;

    // Acción 1: Sellibrí notifica que despachó un paquete y envía la guía
    if (action === 'update_tracking' && orderId && trackingNumber) {
      console.log(`[Sellibrí Webhook] Orden ${orderId} despachada con guía: ${trackingNumber}`);
      
      return NextResponse.json({
        success: true,
        message: `Orden ${orderId} actualizada con guía ${trackingNumber}`,
      }, { status: 200 });
    }

    // Acción 2: Sincronización de inventario desde almacén
    if (action === 'sync_stock' && payload.products) {
      console.log('[Sellibrí Webhook] Sincronización de stock recibida');
      return NextResponse.json({
        success: true,
        message: 'Inventario sincronizado',
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, received: payload }, { status: 200 });
  } catch (error) {
    console.error('Error en conector Sellibrí:', error);
    return NextResponse.json({ error: 'Error procesando solicitud de Sellibrí' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Conector Sellibrí activo',
    service: 'TodoMax Logistics Sync Gateway',
    version: '1.0.0',
  }, { status: 200 });
}