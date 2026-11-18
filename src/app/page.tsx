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
import ProductCover from '@/components/ProductCover';
import Price from '@/components/Price';
import { useCartStore } from '@/store/cartStore';
import { Flame, ShoppingBag, ArrowRight } from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCartStore();

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

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    const firstValidImg = product.images?.find((img) => !isVideo(img)) || product.images?.[0] || '';
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: firstValidImg,
        stock: product.stock,
      },
      1
    );
    router.push('/checkout');
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
              products.map((product) => {
                const outOfStock = product.stock <= 0;
                return (
                  <div
                    key={product.id}
                    className="snap-start h-full bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
                  >
                    <Link href={`/product/${product.id}`} className="block relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
                      <ProductCover images={product.images} title={product.title} />
                      {outOfStock ? (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                          Agotado
                        </span>
                      ) : product.badge ? (
                        <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                          {product.badge}
                        </span>
                      ) : null}
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-400">{product.category}</span>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-orange-500 transition-colors">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <Price
                          value={product.price}
                          original={product.originalPrice}
                          className="text-base md:text-lg font-black text-slate-900"
                        />
                        <button
                          onClick={(e) => handleBuyNow(product, e)}
                          disabled={outOfStock}
                          title={outOfStock ? 'Sin stock disponible' : 'Comprar'}
                          className="bg-slate-900 hover:bg-orange-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {outOfStock ? 'Agotado' : 'Comprar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
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
              bestSellers.map((product) => {
                const outOfStock = product.stock <= 0;
                return (
                  <div
                    key={product.id}
                    className="snap-start h-full bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
                  >
                    <Link href={`/product/${product.id}`} className="block relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
                      <ProductCover images={product.images} title={product.title} />
                      {outOfStock ? (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">
                          Agotado
                        </span>
                      ) : product.badge ? (
                        <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">
                          {product.badge}
                        </span>
                      ) : null}
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-orange-500 tracking-wider">{product.category}</span>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-orange-500 transition-colors mt-0.5">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div>
                          <Price
                            value={product.price}
                            original={product.originalPrice}
                            className="text-lg md:text-xl font-black text-slate-900"
                          />
                        </div>
                        <button
                          onClick={(e) => handleBuyNow(product, e)}
                          disabled={outOfStock}
                          title={outOfStock ? 'Sin stock disponible' : 'Comprar ahora'}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 disabled:shadow-none transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-1 hover:shadow-orange-500/50 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
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
