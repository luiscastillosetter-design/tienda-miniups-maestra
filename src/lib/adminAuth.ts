import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';

export type AdminRole = 'Super Admin' | 'Logística y Pagos' | 'Marketing y Afiliados';

export const ADMIN_COOKIE = 'todomax_admin_session';
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 h

/** Mismas credenciales que usa el panel /admin (sobrescribibles por variables de entorno). */
function credentials(): Array<{ password: string; role: AdminRole }> {
  return [
    { password: process.env.ADMIN_PASSWORD_SUPER || 'Admin1234.', role: 'Super Admin' },
    { password: process.env.ADMIN_PASSWORD_LOGISTICA || 'Logistica123.', role: 'Logística y Pagos' },
    { password: process.env.ADMIN_PASSWORD_MARKETING || 'Marketing123.', role: 'Marketing y Afiliados' },
  ];
}

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ANTHROPIC_API_KEY ||
    `todomax|${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}|${credentials().map((c) => c.password).join('|')}`
  );
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

const safeEq = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
};

export function roleForPassword(password: string): AdminRole | null {
  const found = credentials().find((c) => safeEq(c.password, String(password ?? '')));
  return found ? found.role : null;
}

export function createSessionToken(role: AdminRole): string {
  const payload = Buffer.from(JSON.stringify({ role, exp: Date.now() + SESSION_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export const SESSION_MAX_AGE_S = SESSION_MS / 1000;

/** Devuelve el rol si la cookie de sesión admin es válida y no ha expirado; si no, null. */
export function getAdminRole(request: NextRequest): AdminRole | null {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEq(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data?.exp !== 'number' || data.exp < Date.now()) return null;
    return credentials().some((c) => c.role === data.role) ? (data.role as AdminRole) : null;
  } catch {
    return null;
  }
}

/** Guard para rutas admin: devuelve una respuesta 401 si no hay sesión válida, o null si se puede continuar. */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (getAdminRole(request)) return null;
  return NextResponse.json(
    { error: 'Unauthorized', code: 'SESSION_REQUIRED' },
    { status: 401, headers: { 'Cache-Control': 'private, no-store' } }
  );
}
