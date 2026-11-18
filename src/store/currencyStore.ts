import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Divisa = 'USD' | 'VES';

type CurrencyState = {
  divisa: Divisa;
  tasaBcv: number | null;
  setDivisa: (divisa: Divisa) => void;
  toggleDivisa: () => void;
  setTasaBcv: (tasa: number | null) => void;
};

// Solo presentación: el carrito y los pedidos siempre guardan precios en USD.
export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      divisa: 'USD',
      tasaBcv: null,

      setDivisa: (divisa) => set({ divisa }),
      toggleDivisa: () => set((state) => ({ divisa: state.divisa === 'USD' ? 'VES' : 'USD' })),
      setTasaBcv: (tasaBcv) => set({ tasaBcv: tasaBcv && tasaBcv > 0 ? tasaBcv : null }),
    }),
    {
      name: 'todomax_currency',
      partialize: (state) => ({ divisa: state.divisa }),
    }
  )
);

export const formatearMonto = (monto: number, divisa: Divisa) =>
  divisa === 'VES'
    ? new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto)
    : monto.toFixed(2);

/** Convierte un precio USD al monto a mostrar. Nunca redondea el original. */
export const convertirPrecio = (precioUsd: number, divisa: Divisa, tasaBcv: number | null) =>
  divisa === 'VES' && tasaBcv ? precioUsd * tasaBcv : precioUsd;
