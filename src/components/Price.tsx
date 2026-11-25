'use client';

import { siteConfig } from '@/config/site';
import { convertirPrecio, formatearMonto, useCurrencyStore } from '@/store/currencyStore';

interface PriceProps {
  value: number;
  className?: string;
  /** Muestra el monto USD de referencia debajo cuando se está en bolívares. */
  showSecondary?: boolean;
  secondaryClassName?: string;
  /** Precio anterior (USD). Si es mayor al actual se muestra tachado con la etiqueta de oferta. */
  original?: number;
  /** Etiqueta corta junto al precio anterior. */
  offerLabel?: boolean;
}

/** Precio 100% referencial: el valor recibido siempre es el precio en USD. */
export default function Price({
  value,
  className = '',
  showSecondary = false,
  secondaryClassName = '',
  original,
  offerLabel = true,
}: PriceProps) {
  const { divisa, tasaBcv } = useCurrencyStore();
  const enVes = divisa === 'VES' && !!tasaBcv;
  const monto = convertirPrecio(value, divisa, tasaBcv);
  const originalNum = Number(original);
  const enOferta = Number.isFinite(originalNum) && originalNum > Number(value);
  const montoAnterior = enOferta ? convertirPrecio(originalNum, divisa, tasaBcv) : 0;

  return (
    <span className="inline-flex flex-col leading-none gap-1">
      {enOferta && (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] md:text-xs font-semibold text-gray-400 line-through decoration-gray-300 tabular-nums">
            {enVes ? 'Bs. ' : siteConfig.currencySymbol}
            {formatearMonto(montoAnterior, divisa)}
          </span>
          {offerLabel && (
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wide text-white bg-orange-500 px-1.5 py-0.5 rounded">
              Oferta
            </span>
          )}
        </span>
      )}
      <span className={className}>
        {enVes ? 'Bs. ' : siteConfig.currencySymbol}
        {formatearMonto(monto, divisa)}
      </span>
      {enVes && showSecondary && (
        <span className={`${secondaryClassName} font-semibold text-gray-400`}>
          {siteConfig.currencySymbol}{value.toFixed(2)}
        </span>
      )}
    </span>
  );
}
