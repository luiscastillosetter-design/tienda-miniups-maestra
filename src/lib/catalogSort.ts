// Orden único de la tienda: 2 productos por categoría en rondas (categorías A→Z, productos A→Z).
// No usa createdAt ni reverse(): el orden de publicación no influye.

type Sortable = { title?: string; category?: string };

const collator = (a: string, b: string) => a.localeCompare(b, 'es');

const normCat = (v?: string) => String(v || '').replace(/\s+/g, ' ').trim() || 'Sin categoría';

/** Ordena alfabéticamente por título (A→Z) sin mutar el arreglo original. */
export function sortByTitle<T extends Sortable>(products: T[]): T[] {
  return [...products].sort((a, b) => collator(String(a.title || '').trim(), String(b.title || '').trim()));
}

/** Intercala 2 productos por categoría en rondas sucesivas. */
export function sortCatalogTwoByTwo<T extends Sortable>(products: T[]): T[] {
  const groups = new Map<string, { label: string; items: T[] }>();
  for (const p of products) {
    const label = normCat(p.category);
    const key = label.toLowerCase();
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(p);
  }
  const queues = Array.from(groups.values())
    .sort((a, b) => collator(a.label, b.label))
    .map((g) => sortByTitle(g.items));

  const result: T[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const q of queues) {
      if (q.length > 0) {
        result.push(...q.splice(0, 2));
        if (q.length > 0) remaining = true;
      }
    }
  }
  return result;
}
