'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { HeroCarousel } from '@/components/HeroCarousel';
import { OffersCarousel } from '@/components/OffersCarousel';
import { useCartStore } from '@/store/cartStore';
import { 
  Home as HomeIcon, Cpu, Utensils, Car, Sparkles, Flame, 
  ShoppingBag, ShieldCheck, Truck, CreditCard, Star, ArrowRight
} from 'lucide-react';

const categoriesList = [
  { name: 'Hogar', icon: HomeIcon, desc: 'Espacios modernos' },
  { name: 'Tecnología', icon: Cpu, desc: 'Energía y gadgets' },
  { name: 'Cocina', icon: Utensils, desc: 'Equipos prácticos' },
  { name: 'Automóvil', icon: Car, desc: 'Accesorios y cuidado' },
  { name: 'Belleza', icon: Sparkles, desc: 'Cuidado personal' },
  { name: 'Productos Virales', icon: Flame, desc: 'Tendencia en redes' },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCartStore();

  // Lectura síncrona inmediata de la memoria local para cargar en 0ms sin saltos
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

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

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
  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-[180px] md:pt-[160px] pb-28">
      <div className="w-full px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16">
        
        {/* 1. HERO CAROUSEL */}
        <section className="w-full">
          <HeroCarousel />
        </section>

        {/* 2. CATEGORÍAS MULTIPRODUCTO */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <span className="text-orange-500 font-black text-xs uppercase tracking-wider">Departamentos TodoMax</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">Explora por Categoría</h2>
            </div>
            {selectedCategory !== 'Todos' && (
              <button
                onClick={() => setSelectedCategory('Todos')}
                className="text-xs font-bold text-orange-500 hover:underline cursor-pointer"
              >
                Limpiar Filtro
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5 snap-x pb-4 pt-3 scrollbar-hide px-1">
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'Todos' : cat.name);
                    document.getElementById('catalogo-grilla')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex-shrink-0 w-[140px] md:w-auto snap-start p-4 md:p-5 rounded-3xl border text-center transition-all duration-300 ease-out flex flex-col items-center justify-center gap-3 cursor-pointer group hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/50 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-300/60 scale-105'
                      : 'bg-white border-gray-200/80 text-slate-800 hover:border-orange-200'
                  }`}
                >
                  <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    isSelected ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">{cat.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. PRODUCTOS MÁS VENDIDOS */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <span className="text-orange-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-orange-500" /> Los preferidos
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">Más Vendidos</h2>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x pb-6 scrollbar-hide px-1">
            {products.length === 0 ? (
              [1, 2, 3, 4].map(idx => (
                <div key={idx} className="flex-shrink-0 w-[240px] md:w-[260px] aspect-square rounded-3xl bg-slate-200/70 animate-pulse" />
              ))
            ) : (
              bestSellers.map((product) => {
                const outOfStock = product.stock <= 0;
                const coverMedia = product.images?.[0] || '';
                return (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[240px] md:w-[260px] snap-start bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
                  >
                    <Link href={`/product/${product.id}`} className="block relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
                      {isVideo(coverMedia) ? (
                        <video src={coverMedia} muted loop autoPlay playsInline className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <img src={coverMedia} alt={product.title} className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500" />
                      )}
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
                          <span className="text-lg md:text-xl font-black text-slate-900">
                            {siteConfig.currencySymbol}{product.price.toFixed(2)}
                          </span>
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
          </div>
        </section>

        {/* 4. PROMOCIONES Y COMBOS */}
        <section className="w-full">
          <OffersCarousel />
        </section>

        {/* 5. CATÁLOGO GENERAL */}
        <section className="w-full" id="catalogo-grilla">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <span className="text-orange-500 font-black text-xs uppercase tracking-wider">Inventario Disponible</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                Catálogo: {selectedCategory} ({filteredProducts.length})
              </h2>
            </div>
            <Link href="/catalogo" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x pb-6 scrollbar-hide px-1">
            {products.length === 0 ? (
              [1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="flex-shrink-0 w-[240px] md:w-[260px] aspect-square rounded-3xl bg-slate-200/70 animate-pulse" />
              ))
            ) : (
              filteredProducts.map((product) => {
                const outOfStock = product.stock <= 0;
                const coverMedia = product.images?.[0] || '';
                return (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[240px] md:w-[260px] snap-start bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
                  >
                    <Link href={`/product/${product.id}`} className="block relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
                      {isVideo(coverMedia) ? (
                        <video src={coverMedia} muted loop autoPlay playsInline className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <img src={coverMedia} alt={product.title} className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500" />
                      )}
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
                        <span className="text-base md:text-lg font-black text-slate-900">
                          {siteConfig.currencySymbol}{product.price.toFixed(2)}
                        </span>
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
          </div>
        </section>

        {/* 6. BLOQUE DE CONFIANZA */}
        <section className="w-full bg-white rounded-3xl p-6 md:p-12 border border-gray-200/80 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="flex items-center gap-4 group">
              <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Envíos Nacionales</h4>
                <p className="text-xs text-gray-500">Por {siteConfig.shipping.companies.slice(0, 3).join(', ')}.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Pagos Seguros</h4>
                <p className="text-xs text-gray-500">Zelle, Pago Móvil y USDT.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Garantía Directa</h4>
                <p className="text-xs text-gray-500">Importadora con soporte.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">+1,500 Clientes</h4>
                <p className="text-xs text-gray-500">Opiniones verificadas.</p>
              </div>
            </div>
          </div>
        </section>

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