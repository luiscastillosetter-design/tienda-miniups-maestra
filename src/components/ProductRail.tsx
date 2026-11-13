'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductRailProps {
  children: React.ReactNode;
  /** Cantidad de tarjetas; con 2 o menos se muestran en una sola fila. */
  count: number;
  /** Filas máximas cuando hay suficientes productos. */
  rows?: 1 | 2;
}

export default function ProductRail({ children, count, rows = 2 }: ProductRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, count]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const rowsClass = rows === 2 && count > 2 ? 'grid-rows-2' : 'grid-rows-1';

  const btn =
    'hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white text-slate-900 border border-gray-200 shadow-xl transition-all duration-200 cursor-pointer hover:bg-slate-900 hover:text-white disabled:opacity-0 disabled:pointer-events-none';

  return (
    <div className="relative">
      <button type="button" aria-label="Anterior" disabled={!canLeft} onClick={() => scroll(-1)} className={`${btn} left-0 -translate-x-1/2`}>
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div
        ref={ref}
        className={`grid grid-flow-col ${rowsClass} auto-cols-[240px] md:auto-cols-[260px] gap-4 md:gap-6 overflow-x-auto snap-x pb-6 pt-2 scrollbar-hide px-1 items-stretch content-start`}
      >
        {children}
      </div>
      <button type="button" aria-label="Siguiente" disabled={!canRight} onClick={() => scroll(1)} className={`${btn} right-0 translate-x-1/2`}>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
