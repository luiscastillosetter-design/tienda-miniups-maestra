import type { Product, ProductColor } from '@/data/products';

type StockProduct = Pick<Product, 'stock'> & { colors?: ProductColor[] };

/** Stock de una talla dentro de un color (undefined si no hay matriz definida para esa talla). */
export function sizeStockOf(color: ProductColor | undefined, size?: string | null): number | undefined {
  if (!color || !size || !color.sizeStock || typeof color.sizeStock !== 'object') return undefined;
  const v = color.sizeStock[size];
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : undefined;
}

/** Disponibilidad real: (color, talla) -> color.stock -> stock general. */
export function getAvailableStock(product: StockProduct, colorName?: string | null, size?: string | null): number {
  const color = colorName && Array.isArray(product.colors) ? product.colors.find((c) => c?.name === colorName) : undefined;
  const bySize = sizeStockOf(color, size);
  if (bySize !== undefined) return bySize;
  if (color && typeof color.stock === 'number') return Math.max(0, color.stock);
  return Math.max(0, Number(product.stock) || 0);
}

/** Total de piezas de un color a partir de su matriz de tallas (undefined si no tiene). */
export function sumSizeStock(sizeStock?: Record<string, number>): number | undefined {
  if (!sizeStock || typeof sizeStock !== 'object') return undefined;
  const vals = Object.values(sizeStock);
  if (vals.length === 0) return undefined;
  return vals.reduce((a, b) => a + (Number(b) || 0), 0);
}

/** Métodos de pago en divisas (usan divisaPrice). */
export const DIVISA_METHODS = ['Binance Pay', 'Zelle', 'Efectivo al retirar'];
export const isDivisaMethod = (m?: string) => DIVISA_METHODS.includes(String(m || ''));
export const effectiveDivisaPrice = (price: number, divisaPrice?: number) =>
  typeof divisaPrice === 'number' && divisaPrice > 0 && divisaPrice < price ? divisaPrice : price;
