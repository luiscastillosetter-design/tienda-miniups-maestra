'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const availableCategories = [
  'Todos',
  'Hogar',
  'Tecnología',
  'Cocina',
  'Automóvil',
  'Belleza',
  'Productos Virales',
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
    const isLegacyFakePath =
      dImg.startsWith('/categories/') ||
      mImg.startsWith('/categories/');
    const hasRealImage = Boolean(dImg || mImg);
    return hasRealImage && !isLegacyFakePath;
  });
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCartStore();

  // Inicialización limpia: lee caché de productos reales, NUNCA los cuadros naranjas por defecto
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

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    return searchParams.get('category') || 'Todos';
  });

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(() => {
    const cat = searchParams.get('category');
    if (!cat || cat.toLowerCase() === 'todos') return products;
    const targetNorm = normalizeCatName(cat);
    return products.filter((p) => normalizeCatName(p.category) === targetNorm);
  });

  const [catSlides, setCatSlides] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const localSlides = localStorage.getItem('store_cat_slides');
        if (localSlides) {
          const parsed = filterValidCatBanners(JSON.parse(localSlides));
          if (parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const currentCat = categoryParam || 'Todos';
    setActiveCategory(currentCat);

    if (!currentCat || currentCat.toLowerCase() === 'todos') {
      setFilteredProducts(products);
    } else {
      const targetNorm = normalizeCatName(currentCat);
      setFilteredProducts(products.filter((p) => normalizeCatName(p.category) === targetNorm));
    }
  }, [searchParams, products]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prods = await productService.getProducts();
        if (Array.isArray(prods) && prods.length > 0) {
          setProducts(prods);
          const currentCat = searchParams.get('category') || 'Todos';
          if (!currentCat || currentCat.toLowerCase() === 'todos') {
            setFilteredProducts(prods);
          } else {
            const targetNorm = normalizeCatName(currentCat);
            setFilteredProducts(prods.filter((p) => normalizeCatName(p.category) === targetNorm));
          }
        }

        const res = await fetch(`/api/store?key=store_cat_slides&t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            const cleanSlides = filterValidCatBanners(json.data);
            setCatSlides(cleanSlides);
            if (typeof window !== 'undefined') {
              localStorage.setItem('store_cat_slides', JSON.stringify(cleanSlides));
            }
          }
        }
      } catch (e) {}
    };

    loadData();
  }, [searchParams]);

  const activeCategorySlides = (() => {
    const normalizedActive = normalizeCatName(activeCategory);

    const exactMatches = catSlides.filter(
      (s: any) => normalizeCatName(s.category) === normalizedActive
    );
    if (exactMatches.length > 0) return exactMatches;

    if (normalizedActive === 'todos') {
      return catSlides.filter((s: any) => {
        const slideCat = normalizeCatName(s.category);
        return slideCat === 'todos' || slideCat === 'general';
      });
    }

    return [];
  })();

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.reInit();
    emblaApi.scrollTo(0);
    setSelectedIndex(0);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, activeCategory, activeCategorySlides.length]);

  const handleCategorySelect = (cat: string) => {
    if (cat === 'Todos') {
      router.push('/catalogo');
    } else {
      router.push(`/catalogo?category=${encodeURIComponent(cat)}`);
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

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-[180px] md:pt-[160px] pb-24">
      <div className="w-full px-4 md:px-10 lg:px-16 space-y-8">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <span className="text-orange-500 font-black text-xs uppercase tracking-wider">
              {siteConfig.storeName}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mt-1 mb-2">
              {activeCategory === 'Todos' ? 'Catálogo Completo' : `Departamento: ${activeCategory}`}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
              Precios directos de importadora, garantía oficial y envío gratis a partir de {siteConfig.currencySymbol}{siteConfig.shipping.freeShippingThreshold}.
            </p>
          </div>

          <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-2 md:pb-0 scrollbar-hide">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                  normalizeCatName(activeCategory) === normalizeCatName(cat)
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {activeCategorySlides.length > 0 && (
          <div className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 bg-slate-950">
            <div ref={emblaRef} className="overflow-hidden w-full">
              <div className="flex w-full">
                {activeCategorySlides.map((slide: any, idx: number) => {
                  const dImg = slide.desktopImg || slide.mobileImg || '';
                  const mImg = slide.mobileImg || slide.desktopImg || '';

                  return (
                    <div
                      key={slide.id || idx}
                      className="flex-[0_0_100%] min-w-0 relative h-[38vh] md:h-[48vh] min-h-[280px] md:min-h-[380px] py-10 pb-14 md:py-14 md:pb-16 bg-slate-950 text-white flex flex-col justify-center items-start overflow-hidden group"
                    >
                      {dImg && (
                        <img
                          src={dImg}
                          alt={`Banner ${slide.category || activeCategory}`}
                          className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {mImg && (
                        <img
                          src={mImg}
                          alt={`Banner ${slide.category || activeCategory}`}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          fetchPriority={idx === 0 ? 'high' : 'auto'}
                          className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
                        />
                      )}
                      <Link
                        href={slide.link || '/catalogo'}
                        className="absolute inset-0 z-10 cursor-pointer"
                        aria-label={`Banner ${slide.category || activeCategory}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {activeCategorySlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
                {activeCategorySlides.map((_, i) => (
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
          </div>
        )}

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
              onClick={() => handleCategorySelect('Todos')}
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