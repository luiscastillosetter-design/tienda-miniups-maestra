'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { HeroCarousel } from '@/components/HeroCarousel';
import { OffersCarousel } from '@/components/OffersCarousel';
import TrustAndPolicies from '@/components/TrustAndPolicies';
import ProductRail from '@/components/ProductRail';
import CategoryBar from '@/components/CategoryBar';
import StoreLocationSection from '@/components/StoreLocationSection';
import ProductCard from '@/components/ProductCard';
import { sortCatalogTwoByTwo, sortByTitle } from '@/lib/catalogSort';
import { Flame, ArrowRight, Store, Banknote, MessageCircle } from 'lucide-react';
import { adminWaLink } from '@/lib/adminWhatsapp';
import CasheaBanner from '@/components/CasheaBanner';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('store_products');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    const load = async () => {
      const data = await productService.getProducts();
      setProducts(data);
    };
    load();
  }, []);

  const [salesRank, setSalesRank] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/best-sellers')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d && Array.isArray(d.bestSellerIds)) setSalesRank(d.bestSellerIds.map(String));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('todomax_ref', ref.toUpperCase());
    }
  }, [searchParams]);

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video');
  };

  const sortedProducts = useMemo(() => sortCatalogTwoByTwo(products), [products]);
  // Stock real: suma de variantes (sizeStock o stock por color) o stock general si no hay colores
  const getRealProductStock = (p: Product): number => {
    const colors = Array.isArray(p.colors) ? p.colors : [];
    if (colors.length > 0) {
      let defined = false;
      const total = colors.reduce((sum, c) => {
        if (c.sizeStock && typeof c.sizeStock === 'object' && Object.keys(c.sizeStock).length > 0) {
          defined = true;
          return sum + Object.values(c.sizeStock).reduce((a, b) => a + (Number(b) || 0), 0);
        }
        if (typeof c.stock === 'number') {
          defined = true;
          return sum + c.stock;
        }
        return sum;
      }, 0);
      if (defined) return total;
    }
    return Number(p.stock) || 0;
  };
  const bestSellers = useMemo(() => {
    const byId = new Map(products.map(p => [String(p.id), p]));
    const list: Product[] = [];
    const seen = new Set<string>();
    for (const id of salesRank) {
      const p = byId.get(String(id));
      if (p && getRealProductStock(p) > 0 && !seen.has(String(p.id))) {
        seen.add(String(p.id));
        list.push(p);
      }
    }
    for (const p of sortByTitle(products.filter(p => p.isBestSeller))) {
      if (getRealProductStock(p) > 0 && !seen.has(String(p.id))) {
        seen.add(String(p.id));
        list.push(p);
      }
    }
    return list.slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, salesRank]);

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-[180px] md:pt-[160px] pb-28">
      <div className="w-full px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16">

        {/* 1. BARRA FINA DE CATEGORÍAS */}
        <CategoryBar products={products} />

        {/* 2. CARRUSEL PRINCIPAL (3 segmentos) */}
        <section className="w-full">
          <HeroCarousel />
        </section>

        {/* Franja de confianza */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 -mt-4 md:-mt-6">
          <div className="flex items-center gap-3 bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-xs transition-all hover:-translate-y-1 hover:shadow-lg">
            <Store className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-xs md:text-sm font-bold text-slate-800">Tienda física · Retiro personal</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-xs transition-all hover:-translate-y-1 hover:shadow-lg">
            <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs md:text-sm font-bold text-slate-800">Efectivo al retirar disponible</p>
          </div>
          <a
            href={adminWaLink('Hola, vengo de la página web de TodoMax y quiero asesoría.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 shadow-xs no-underline transition-all hover:-translate-y-1 hover:shadow-lg hover:bg-emerald-100"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs md:text-sm font-bold text-emerald-800">Atención humana directa por WhatsApp</p>
          </a>
        </section>

        {/* Cashea */}
        <CasheaBanner />

        {/* 3. CATÁLOGO EN 2 FILAS */}
        <section className="w-full" id="catalogo-grilla">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <span className="text-orange-500 font-black text-xs uppercase tracking-wider">Inventario Disponible</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                Catálogo ({products.length})
              </h2>
            </div>
            <Link href="/catalogo" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ProductRail count={products.length === 0 ? 6 : products.length}>
            {products.length === 0 ? (
              [1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="w-full aspect-square rounded-3xl bg-slate-200/70 animate-pulse" />
              ))
            ) : (
              sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} buyStyle="text" className="snap-start h-full" />
              ))
            )}
          </ProductRail>
        </section>

        {/* 4. OFERTAS (2 segmentos) */}
        <section className="w-full">
          <OffersCarousel />
        </section>

        {/* 5. MÁS VENDIDOS */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <span className="text-orange-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-orange-500" /> Los preferidos
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">Más Vendidos</h2>
            </div>
          </div>

          <ProductRail count={products.length === 0 ? 4 : bestSellers.length}>
            {products.length === 0 ? (
              [1, 2, 3, 4].map(idx => (
                <div key={idx} className="w-full aspect-square rounded-3xl bg-slate-200/70 animate-pulse" />
              ))
            ) : (
              bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} className="snap-start h-full" />
              ))
            )}
          </ProductRail>
        </section>

        {/* 6. UBICACIÓN Y HORARIOS */}
        <StoreLocationSection />

        {/* 5. BLOQUE DE CONFIANZA Y POLÍTICAS DINÁMICAS */}
        <TrustAndPolicies />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando TodoMax...</div>}>
      <HomeContent />
    </Suspense>
  );
}
