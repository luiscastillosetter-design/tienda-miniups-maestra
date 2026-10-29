import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const SELLIBRI_SECRET = process.env.SELLIBRI_API_KEY;

    if (!SELLIBRI_SECRET) {
      console.error('[Sellibrí Webhook] CLAVE API NO CONFIGURADA EN EL SERVIDOR');
      return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${SELLIBRI_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await request.json();
    const { action, orderId, trackingNumber, products } = payload;

    if (action === 'update_tracking' && orderId && trackingNumber) {
      const orders = await dbService.get('store_orders') || [];
      const updatedOrders = orders.map((o: any) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'Despachado',
            shipping: { ...o.shipping, trackingNumber }
          };
        }
        return o;
      });
      
      await dbService.set('store_orders', updatedOrders);
      console.log(`[Sellibrí Webhook] Orden ${orderId} despachada con guía: ${trackingNumber}`);
      
      return NextResponse.json({
        success: true,
        message: `Orden ${orderId} actualizada con guía ${trackingNumber}`,
      }, { status: 200 });
    }

    if (action === 'sync_stock' && products && Array.isArray(products)) {
      const storeProducts = await dbService.get('store_products') || [];
      const updatedProducts = storeProducts.map((p: any) => {
        const updatedStock = products.find((newP: any) => String(newP.id) === String(p.id));
        if (updatedStock && typeof updatedStock.stock === 'number') {
          return { ...p, stock: updatedStock.stock };
        }
        return p;
      });
      
      await dbService.set('store_products', updatedProducts);
      console.log('[Sellibrí Webhook] Sincronización de stock recibida');
      return NextResponse.json({
        success: true,
        message: 'Inventario sincronizado',
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Acción no válida o parámetros faltantes' }, { status: 400 });
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