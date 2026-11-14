'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Home as HomeIcon, Cpu, Utensils, Car, Sparkles, Flame, Tag,
  type LucideIcon,
} from 'lucide-react';

export const DEFAULT_CATEGORIES = [
  'Hogar',
  'Tecnología',
  'Cocina',
  'Automóvil',
  'Belleza',
  'Productos Virales',
];

const ICONS: Record<string, LucideIcon> = {
  hogar: HomeIcon,
  tecnologia: Cpu,
  cocina: Utensils,
  automovil: Car,
  belleza: Sparkles,
  'productos virales': Flame,
};

const norm = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function categoryIcon(name: string): LucideIcon {
  return ICONS[norm(name)] || Tag;
}

/** Une la lista guardada (o por defecto) con las categorías que ya usan los productos. */
export function mergeCategories(stored: string[] | null | undefined, productCats: string[] = []): string[] {
  const base = Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_CATEGORIES;
  const result = [...base];
  for (const c of productCats) {
    if (c && !result.some((r) => norm(r) === norm(c))) result.push(c);
  }
  return result;
}

/** Categorías dinámicas guardadas en Supabase (store_data → store_categories). */
export function useCategories(productCats: string[] = []) {
  const [stored, setStored] = useState<string[] | null>(null);

  useEffect(() => {
    fetch(`/api/store?key=store_categories`)
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.data)) setStored(j.data.filter((x: unknown) => typeof x === 'string'));
      })
      .catch(() => {});
  }, []);

  const key = productCats.join('|');
  return useMemo(
    () =>
      mergeCategories(stored, productCats).map((name) => ({ name, icon: categoryIcon(name) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stored, key]
  );
}
