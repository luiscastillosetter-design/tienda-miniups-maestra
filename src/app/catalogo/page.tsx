'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { 
  ShoppingBag, ArrowRight, Home as HomeIcon, Cpu, 
  Utensils, Car, Sparkles, Flame 
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const categoriesList = [
  { name: 'Hogar', icon: HomeIcon, desc: 'Espacios modernos' },
  { name: 'Tecnología', icon: Cpu, desc: 'Energía y gadgets' },
  { name: 'Cocina', icon: Utensils, desc: 'Equipos prácticos' },
  { name: 'Automóvil', icon: Car, desc: 'Accesorios y cuidado' },
  { name: 'Belleza', icon: Sparkles, desc: 'Cuidado personal' },
  { name: 'Productos Virales', icon: Flame, desc: 'Tendencia en redes' },
];

function normalizeCatName(val: string) {
  return (val || 'Todos')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function filterValidCatBanners(rawSlides: any[]): any[] {
  if (!Array.isArray(rawSlides)) return [];
  return rawSlides.filter((s) => {
    const dImg = String(s?.desktopImg || '').trim();
    const mImg = String(s?.mobileImg || '').trim();
    return Boolean(dImg || mImg);
  });
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const [catSlides, setCatSlides] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('store_cat_slides');
        if (local) {
          const parsed = filterValidCatBanners(JSON.parse(local));
          if (parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('Todos');
    }
  }, [searchParams]);

  useEffect(() => {
    productService.getProducts().then((prods) => {
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
      }
    });

    fetch(`/api/store?key=store_cat_slides&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) {
          const cleanSlides = filterValidCatBanners(json.data);
          setCatSlides(cleanSlides);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('store_cat_slides', JSON.stringify(cleanSlides));
            } catch (_) {}
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.reInit();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, catSlides.length]);

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory.toLowerCase() === catName.toLowerCase()) {
      setSelectedCategory('Todos');
      router.push('/catalogo');
    } else {
      setSelectedCategory(catName);
      router.push(`/catalogo?category=${encodeURIComponent(catName)}`);
    }
  };

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

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter((p) => normalizeCatName(p.category) === normalizeCatName(selectedCategory));

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-[180px] md:pt-[160px] pb-28">
      <div className="w-full px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16">

        {/* 1. HERO CARRUSEL DE CATEGORÍAS */}
        {catSlides.length > 0 && (
          <section className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 bg-slate-950">
            <div ref={emblaRef} className="overflow-hidden w-full">
              <div className="flex w-full">
                {catSlides.map((slide: any, idx: number) => {
                  const dImg = slide.desktopImg || slide.mobileImg || '';
                  const mImg = slide.mobileImg || slide.desktopImg || '';

                  return (
                    <div
                      key={slide.id || idx}
                      className="flex-[0_0_100%] min-w-0 relative h-[42vh] md:h-[54vh] min-h-[300px] md:min-h-[440px] bg-slate-950 text-white flex flex-col justify-center items-start overflow-hidden group"
                    >
                      {dImg && (
                        <img
                          src={dImg}
                          alt={slide.category || 'Banner Categoría'}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          fetchPriority={idx === 0 ? 'high' : 'auto'}
                          className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {mImg && (
                        <img
                          src={mImg}
                          alt={slide.category || 'Banner Categoría'}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          fetchPriority={idx === 0 ? 'high' : 'auto'}
                          className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
                        />
                      )}

                      <Link
                        href={slide.link || `/catalogo?category=${encodeURIComponent(slide.category || 'Todos')}`}
                        className="absolute inset-0 z-10 cursor-pointer"
                        aria-label={`Ver ${slide.category || 'Categoría'}`}
                      />

                      {/* Botón CTA esquina inferior izquierda */}
                      {slide.showBtn !== false && (
                        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-12 z-20 pointer-events-auto">
                          <Link
                            href={slide.link || `/catalogo?category=${encodeURIComponent(slide.category || 'Todos')}`}
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-2.5 md:px-7 md:py-3.5 rounded-2xl shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 transition-all duration-300 text-xs md:text-sm active:scale-95 cursor-pointer group/btn"
                          >
                            <ShoppingBag className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                            <span>{slide.btnText || 'Ver Departamento'}</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {catSlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
                {catSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === selectedIndex ? 'w-10 bg-white shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Ir al banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. BOTONES DE CATEGORÍAS */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <span className="text-orange-500 font-black text-xs uppercase tracking-wider">
                Departamentos TodoMax
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                Explora por Categoría
              </h2>
            </div>
            {selectedCategory !== 'Todos' && (
              <button
                onClick={() => {
                  setSelectedCategory('Todos');
                  router.push('/catalogo');
                }}
                className="text-xs font-bold text-orange-500 hover:underline cursor-pointer"
              >
                Ver Todas
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
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex-shrink-0 w-[140px] md:w-auto snap-start p-4 md:p-5 rounded-3xl border text-center transition-all duration-300 ease-out flex flex-col items-center justify-center gap-3 cursor-pointer group hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/50 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-300/60 scale-105'
                      : 'bg-white border-gray-200/80 text-slate-800 hover:border-orange-200'
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                    }`}
                  >
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

        {/* 3. GRILLA DE PRODUCTOS */}
        <section className="w-full" id="catalogo-grilla">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <span className="text-orange-500 font-black text-xs uppercase tracking-wider">
                Inventario Disponible
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                {selectedCategory === 'Todos' ? 'Catálogo Completo' : `Departamento: ${selectedCategory}`} ({filteredProducts.length})
              </h2>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-gray-200/80 p-4 aspect-square bg-slate-200/60 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-200/80">
              <p className="text-sm text-gray-500 font-bold mb-4">
                No hay productos disponibles en esta categoría.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Todos');
                  router.push('/catalogo');
                }}
                className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-xs cursor-pointer"
              >
                Ver Todos los Productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const outOfStock = product.stock <= 0;
                const coverMedia = product.images?.[0] || '';
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
                  >
                    <Link
                      href={`/product/${product.id}`}
                      className="block relative aspect-square bg-slate-50/80 p-4 overflow-hidden"
                    >
                      {isVideo(coverMedia) ? (
                        <video
                          src={coverMedia}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <img
                          src={coverMedia}
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                        />
                      )}
                      {outOfStock ? (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                          Agotado
                        </span>
                      ) : product.badge ? (
                        <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                          {product.badge}
                        </span>
                      ) : null}
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-orange-500 tracking-wider">
                          {product.category}
                        </span>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-orange-500 transition-colors mt-0.5">
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
                          title={outOfStock ? 'Sin stock disponible' : 'Comprar ahora'}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 disabled:shadow-none transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-1 hover:shadow-orange-500/50 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando Catálogo...</div>}>
      <CatalogoContent />
    </Suspense>
  );
}