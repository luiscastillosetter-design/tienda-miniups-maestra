/** Minúsculas y sin acentos/diacríticos: "Audífonos" → "audifonos". */
export function normalizeSearchText(text: string): string {
  return (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
