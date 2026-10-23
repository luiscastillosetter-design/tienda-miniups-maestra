import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const searchParams = request.nextUrl.searchParams;

  // 1. Cookie de Afiliado (30 días de persistencia)
  const refCode = searchParams.get('ref');
  if (refCode) {
    response.cookies.set({
      name: 'todomax_ref',
      value: refCode.toUpperCase().trim(),
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      sameSite: 'lax',
    });
  }

  // 2. Cookie de Atribución Publicitaria (Meta Ads / TikTok / Google)
  const fbclid = searchParams.get('fbclid');
  const ttclid = searchParams.get('ttclid');
  const gclid = searchParams.get('gclid');
  const utmSource = searchParams.get('utm_source');

  let canalPublicitario = '';
  if (fbclid || utmSource?.toLowerCase().includes('meta') || utmSource?.toLowerCase().includes('facebook')) {
    canalPublicitario = 'Meta Ads';
  } else if (ttclid || utmSource?.toLowerCase().includes('tiktok')) {
    canalPublicitario = 'TikTok Ads';
  } else if (gclid || utmSource?.toLowerCase().includes('google')) {
    canalPublicitario = 'Google Ads';
  }

  if (canalPublicitario) {
    response.cookies.set({
      name: 'todomax_ad_channel',
      value: canalPublicitario,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      sameSite: 'lax',
    });
  }

  return response;
}

// Optimización: No ejecutar middleware sobre imágenes, iconos o recursos estáticos
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|categories|hero|ofertas|products).*)',
};