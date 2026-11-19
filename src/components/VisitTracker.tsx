'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SID_KEY = 'todomax_visit_sid';
const HEARTBEAT_MS = 2 * 60 * 1000;

function newSid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Registra una visita real por sesión de navegador (sessionStorage) + latido para "activos ahora". */
export default function VisitTracker() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    let sid = '';
    let isNew = false;
    try {
      sid = sessionStorage.getItem(SID_KEY) || '';
      if (!sid) {
        sid = newSid();
        sessionStorage.setItem(SID_KEY, sid);
        isNew = true;
      }
    } catch {
      return;
    }

    const send = (first: boolean) =>
      fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, isNew: first, path: pathname }),
        keepalive: true,
      }).catch(() => {});

    // Solo la primera carga de la sesión cuenta como visita; el resto son latidos.
    send(isNew);

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') send(false);
    }, HEARTBEAT_MS);
    return () => clearInterval(timer);
  }, [pathname]);

  return null;
}
