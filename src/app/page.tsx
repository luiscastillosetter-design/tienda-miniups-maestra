'use client';

import { useEffect, useState, Suspense } from 'react';
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
import { Flame, ArrowRight } from 'lucide-react';

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

  const bestSellers = products.filter(p => p.isBestSeller);

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-[180px] md:pt-[160px] pb-28">
      <div className="w-full px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16">

        {/* 1. BARRA FINA DE CATEGORÍAS */}
        <CategoryBar products={products} />

        {/* 2. CARRUSEL PRINCIPAL (3 segmentos) */}
        <section className="w-full">
          <HeroCarousel />
        </section>

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
              products.map((product) => (
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
