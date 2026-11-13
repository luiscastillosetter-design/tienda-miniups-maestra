'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
import type { Product } from '@/data/products';
import { useCategories } from '@/hooks/useCategories';

const norm = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

interface HoverState {
  name: string;
  left: number;
  top: number;
}

export default function CategoryBar({ products }: { products: Product[] }) {
  const router = useRouter();
  const categories = useCategories(products.map((p) => p.category));
  const [hover, setHover] = useState<HoverState | null>(null);

  const firstByCategory = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      const key = norm(p.category);
      const cur = map.get(key);
      if (!cur || p.title.localeCompare(cur.title, 'es', { sensitivity: 'base' }) < 0) map.set(key, p);
    }
    return map;
  }, [products]);

  const hoverProduct = hover ? firstByCategory.get(norm(hover.name)) : undefined;

  const open = (e: React.MouseEvent<HTMLElement>, name: string) => {
    const r = e.currentTarget.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.left, window.innerWidth - 248));
    setHover({ name, left, top: r.bottom });
  };

  return (
    <section className="w-full" onMouseLeave={() => setHover(null)}>
      <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide bg-white border border-gray-200/80 rounded-2xl px-2 py-1.5 shadow-xs">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              type="button"
              onMouseEnter={(e) => open(e, cat.name)}
              onClick={() => router.push(`/catalogo?category=${encodeURIComponent(cat.name)}`)}
              className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-slate-800 hover:bg-orange-50 hover:text-orange-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Icon className="w-4 h-4 text-orange-500" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {hover && hoverProduct && (
        <div
          style={{ left: hover.left, top: hover.top }}
          className="hidden md:block fixed z-50 w-60 pt-2"
        >
          <Link href={`/product/${hoverProduct.id}`} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-2xl p-3">
            <img
              src={hoverProduct.images?.find((i) => !/\.mp4/.test(i)) || hoverProduct.images?.[0] || ''}
              alt={hoverProduct.title}
              className="w-16 h-16 object-contain rounded-lg bg-slate-50 flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-800 line-clamp-2">{hoverProduct.title}</h3>
              <span className="text-base font-black text-slate-900">
                {siteConfig.currencySymbol}{hoverProduct.price.toFixed(2)}
              </span>
              <span className="block text-[10px] font-bold text-orange-500">Ver producto →</span>
            </div>
          </Link>
        </div>
      )}
    </section>
  );
}
