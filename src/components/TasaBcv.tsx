'use client';

import { useEffect, useState } from 'react';

interface Tasa {
  tasa: number;
  fechaActualizacion: string;
}

export default function TasaBcv() {
  const [data, setData] = useState<Tasa | null>(null);

  useEffect(() => {
    let activo = true;
    const cargar = () =>
      fetch('/api/tasa-bcv')
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (activo && j?.tasa) setData(j);
        })
        .catch(() => {});
    cargar();
    const id = setInterval(cargar, 15 * 60 * 1000);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, []);

  // Sin datos: no se muestra nada (sin errores visibles ni saltos de diseño)
  if (!data) return null;

  const monto = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(data.tasa);

  const fecha = new Date(data.fechaActualizacion);
  const hora = isNaN(fecha.getTime())
    ? ''
    : fecha.toLocaleString('es-VE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] md:text-xs font-medium text-emerald-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      <span>
        Tasa Oficial BCV: <strong>Bs. {monto}</strong>
      </span>
      {hora && <span className="hidden sm:inline text-slate-400">· act. {hora}</span>}
    </div>
  );
}
