// Campos internos de costo/margen: solo visibles con sesión de administrador.
const INTERNAL_FIELD = /^(cost|costo|margin|margen|utility|utilidad|profit|ganancia)/i;

/** Devuelve el producto sin ningún campo interno de costo/margen (para respuestas públicas). */
export function stripInternalFields<T>(product: T): T {
  if (!product || typeof product !== 'object' || Array.isArray(product)) return product;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(product as Record<string, unknown>)) {
    if (!INTERNAL_FIELD.test(k)) clean[k] = v;
  }
  return clean as T;
}
