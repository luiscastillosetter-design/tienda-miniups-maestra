'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAMES = ['María', 'Carlos', 'Andrea', 'José', 'Luisa', 'Pedro', 'Daniela', 'Miguel', 'Carolina', 'Rafael', 'Yuleidy', 'Gabriel', 'Valentina', 'Jesús', 'Génesis', 'Alejandro'];
const CITIES = ['Caracas', 'Valencia', 'Barquisimeto', 'Maracaibo', 'Guanare', 'Acarigua', 'Barinas', 'Maracay'];
const BASE_VISITS = 14820;

interface P { id: string; title: string; stock: number }
interface Toast { name: string; city: string; product: P; mins: number }

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}
const fmt = (n: number) => n.toLocaleString('es-VE');

export default function SocialProofWidget() {
  const pathname = usePathname() || '/';
  const hidden = pathname.startsWith('/admin') || pathname.startsWith('/checkout');

  const [online, setOnline] = useState(31);
  const [totalReal, setTotalReal] = useState(0);
  const [products, setProducts] = useState<P[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const dismissed = useRef(false);

  useEffect(() => {
    if (hidden) return;
    fetch('/api/visits', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setTotalReal(Number(j?.totalReal) || 0))
      .catch(() => {});
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setProducts(d.filter((p) => p?.id && p?.title && Number(p.stock) > 0));
      })
      .catch(() => {});
  }, [hidden]);

  // Usuarios conectados: caminata aleatoria acotada entre 19 y 46.
  useEffect(() => {
    if (hidden) return;
    setOnline(rand(24, 40));
    const t = setInterval(() => {
      setOnline((v) => Math.min(46, Math.max(19, v + rand(-3, 3))));
    }, 5000);
    return () => clearInterval(t);
  }, [hidden]);

  // Toasts de compra cada 28–45 s.
  useEffect(() => {
    if (hidden || products.length === 0) return;
    let show: ReturnType<typeof setTimeout>;
    let hide: ReturnType<typeof setTimeout>;
    const schedule = (delay: number) => {
      show = setTimeout(() => {
        if (!dismissed.current) {
          setToast({ name: pick(NAMES), city: pick(CITIES), product: pick(products), mins: rand(1, 14) });
          hide = setTimeout(() => setToast(null), 9000);
        }
        schedule(rand(28, 45) * 1000);
      }, delay);
    };
    schedule(rand(8, 14) * 1000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [hidden, products]);

  if (hidden) return null;

  return (
    <>
      {/* Pill de tráfico (en flujo, sin tapar nada) */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-slate-50 border-y border-slate-100 px-4 py-2 text-[11px] sm:text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <strong className="text-slate-900">{online}</strong> personas viendo la tienda ahora
        </span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span>
          <strong className="text-slate-900">{fmt(BASE_VISITS + totalReal)}</strong> visitas acumuladas
        </span>
      </div>

      {/* Toast "Recién comprado": PC abajo-izquierda; móvil arriba bajo el header */}
      {toast && (
        <div
          role="status"
          className="fixed z-[60] top-28 left-3 right-3 md:top-auto md:right-auto md:bottom-4 md:left-4 md:w-80"
        >
          <div className="relative flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur px-3 py-2.5 shadow-lg">
            <Link href={`/product/${toast.product.id}`} className="min-w-0 flex-1" onClick={() => setToast(null)}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Recién comprado</p>
              <p className="text-xs text-slate-700 leading-snug line-clamp-2">
                <strong>{toast.name}</strong> de {toast.city} acaba de comprar{' '}
                <span className="font-bold text-slate-900">{toast.product.title}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">hace {toast.mins} min</p>
            </Link>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => {
                dismissed.current = true;
                setToast(null);
              }}
              className="shrink-0 self-start rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
