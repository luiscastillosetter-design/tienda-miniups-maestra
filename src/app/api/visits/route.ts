import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { invalidateStoreKey } from '@/lib/storeCache';

const KEY = 'store_visits';
const ACTIVE_WINDOW_MS = 10 * 60 * 1000;
const NO_STORE = { 'Cache-Control': 'private, no-store' };

interface VisitsData {
  total: number;
  days: Record<string, number>;
  sessions: Record<string, number>; // sessionId -> último latido (ms)
}

const caracasDay = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas' }).format(d); // YYYY-MM-DD

async function load(): Promise<VisitsData> {
  const raw: any = await dbService.get(KEY);
  return {
    total: Number(raw?.total) || 0,
    days: raw?.days && typeof raw.days === 'object' ? raw.days : {},
    sessions: raw?.sessions && typeof raw.sessions === 'object' ? raw.sessions : {},
  };
}

function prune(data: VisitsData, now: number) {
  for (const [sid, ts] of Object.entries(data.sessions)) {
    if (now - Number(ts) > ACTIVE_WINDOW_MS) delete data.sessions[sid];
  }
  const dayKeys = Object.keys(data.days).sort();
  while (dayKeys.length > 60) delete data.days[dayKeys.shift()!];
}

function stats(data: VisitsData, now: number) {
  const activeNowReal = Object.values(data.sessions).filter((ts) => now - Number(ts) <= ACTIVE_WINDOW_MS).length;
  return {
    totalReal: data.total,
    todayReal: data.days[caracasDay()] || 0,
    activeNowReal,
  };
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, ...stats(await load(), Date.now()) }, { headers: NO_STORE });
  } catch (error) {
    console.error('Error en GET /api/visits:', error);
    return NextResponse.json({ success: false, totalReal: 0, todayReal: 0, activeNowReal: 0 }, { status: 500 });
  }
}

// body: { sid: string, isNew: boolean, path?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sid = typeof body?.sid === 'string' ? body.sid.slice(0, 64) : '';
    const path = typeof body?.path === 'string' ? body.path : '/';
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(sid)) {
      return NextResponse.json({ success: false, error: 'sid inválido' }, { status: 400 });
    }
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ success: true, ignored: true }, { headers: NO_STORE });
    }

    const now = Date.now();
    const data = await load();
    const known = sid in data.sessions;
    if (body?.isNew === true && !known) {
      data.total += 1;
      const today = caracasDay();
      data.days[today] = (data.days[today] || 0) + 1;
    }
    data.sessions[sid] = now;
    prune(data, now);

    const saved = await dbService.set(KEY, data);
    if (!saved) return NextResponse.json({ success: false }, { status: 500 });
    invalidateStoreKey(KEY);
    return NextResponse.json({ success: true, ...stats(data, now) }, { headers: NO_STORE });
  } catch (error) {
    console.error('Error en POST /api/visits:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
