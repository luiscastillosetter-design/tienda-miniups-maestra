import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect(
    'https://wa.me/584225160057?text=Hola%2C%20necesito%20soporte%20con%20mi%20pedido%20en%20Importadora%20TodoMax',
    307
  );
}
