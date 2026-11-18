'use client';

import { useCurrencyStore } from '@/store/currencyStore';

export default function CurrencySwitch({ compact = false }: { compact?: boolean }) {
  const { divisa, tasaBcv, setDivisa } = useCurrencyStore();

  const base =
    'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer';
  const activo = 'bg-white text-slate-900 shadow-xs';
  const inactivo = 'text-slate-300 hover:text-white';

  return (
    <div
      className="inline-flex items-center gap-0.5 bg-slate-700/70 rounded-lg p-0.5 border border-slate-600/60"
      title={tasaBcv ? `Tasa BCV: Bs. ${tasaBcv.toFixed(2)}` : 'Cargando tasa BCV...'}
      role="group"
      aria-label="Moneda de visualización"
    >
      <button
        type="button"
        onClick={() => setDivisa('USD')}
        aria-pressed={divisa === 'USD'}
        className={`${base} ${divisa === 'USD' ? activo : inactivo}`}
      >
        USD
      </button>
      <button
        type="button"
        onClick={() => setDivisa('VES')}
        aria-pressed={divisa === 'VES'}
        disabled={!tasaBcv}
        className={`${base} ${divisa === 'VES' ? activo : inactivo} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {compact ? 'Bs' : 'VES'}
      </button>
    </div>
  );
}
