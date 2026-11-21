import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_S,
  createSessionToken,
  getAdminRole,
  roleForPassword,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const cookieBase = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/** Estado de la sesión de servidor del admin. */
export async function GET(request: NextRequest) {
  const role = getAdminRole(request);
  return NextResponse.json({ authenticated: !!role, role }, { headers: { 'Cache-Control': 'private, no-store' } });
}

/** Valida la contraseña en el servidor y emite la cookie firmada (httpOnly) de sesión admin. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const role = roleForPassword(body?.password);
  if (!role) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const res = NextResponse.json({ success: true, role });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(role), { ...cookieBase, maxAge: SESSION_MAX_AGE_S });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...cookieBase, maxAge: 0 });
  return res;
}
