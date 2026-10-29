'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { Truck, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';

const availableCategories = [
  'Todos',
  'Hogar',
  'Tecnología',
  'Cocina',
  'Automóvil',
  'Belleza',
  'Productos Virales'
];

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [catSlides, setCatSlides] = useState<any[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const data = await productService.getProducts();
      setProducts(data);

      try {
        const res = await fetch(`/api/store?key=store_cat_slides&t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setCatSlides(json.data);
            return;
          }
        }
      } catch (e) {}

      if (typeof window !== 'undefined') {
        const localSlides = localStorage.getItem('store_cat_slides');
        if (localSlides) {
          try {
            const parsed = JSON.parse(localSlides);
            if (Array.isArray(parsed)) setCatSlides(parsed);
          } catch (e) {}
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (products.length > 0) {
      if (!categoryParam || categoryParam.toLowerCase() === 'todos') {
        setActiveCategory('Todos');
        setFilteredProducts(products);
      } else {
        setActiveCategory(categoryParam);
        const filtered = products.filter(
          p => p.category?.toLowerCase() === categoryParam.toLowerCase()
        );
        setFilteredProducts(filtered);
      }
    }
  }, [searchParams, products]);

  const activeCategorySlides = (() => {
    const byCat = catSlides.filter((s: any) => s.category === activeCategory);
    if (byCat.length > 0) return byCat;
    return catSlides.filter((s: any) => s.category === 'Todos');
  })();

  useEffect(() => {
    setCurrentSlideIdx(0);
    if (activeCategorySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % activeCategorySlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeCategory, activeCategorySlides.length]);

  const handleCategorySelect = (cat: string) => {
    if (cat === 'Todos') {
      router.push('/catalogo');
    } else {
      router.push(`/catalogo?category=${encodeURIComponent(cat)}`);
    }
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images[0],
      },
      1
    );
    router.push('/checkout');
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-[180px] md:pt-[160px] pb-24">
      <div className="w-full px-4 md:px-10 lg:px-16 space-y-8">
        
        <div className="bg-white rounded-3xl p-6 md:p-12 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <span className="text-orange-500 font-black text-xs uppercase tracking-wider">
              {siteConfig.storeName}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mt-1 mb-3">
              Catálogo Completo
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
              Descubre oportunidades con precios directos de mayorista, garantía oficial en Venezuela y despacho gratuito a partir de ${siteConfig.shipping.freeShippingThreshold}.
            </p>
          </div>

          <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-2 md:pb-0 scrollbar-hide">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                  activeCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {activeCategorySlides.length > 0 ? (
          <div className="w-full rounded-3xl overflow-hidden shadow-sm bg-slate-900 aspect-square md:aspect-[21/9] lg:aspect-[4/1] relative border border-gray-200/80 group">
            {activeCategorySlides.map((slide: any, i: number) => {
              const dImg = slide.desktopImg || slide.mobileImg;
              const mImg = slide.mobileImg || slide.desktopImg;
              const isVisible = i === currentSlideIdx;
              return (
                <Link
                  key={slide.id || i}
                  href={slide.link || '/catalogo'}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                    isVisible ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {dImg && <img src={dImg} alt="Banner Catálogo PC" className="hidden md:block w-full h-full object-cover" />}
                  {mImg && <img src={mImg} alt="Banner Catálogo Móvil" className="block md:hidden w-full h-full object-cover" />}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="w-full rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 md:px-12 md:py-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-400 bg-white/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Departamento: {activeCategory}
              </span>
              <h2 className="text-xl md:text-2xl font-black">
                Envío Gratis en compras desde {siteConfig.currencySymbol}{siteConfig.shipping.freeShippingThreshold}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Despachos rápidos por {siteConfig.shipping.companies.slice(0, 3).join(', ')} con garantía directa de importadora.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10">
              <Truck className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span>Stock verificado y entrega inmediata</span>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200/80">
            <p className="text-sm text-gray-500 font-bold mb-4">No hay productos disponibles en esta categoría.</p>
            <button
              onClick={() => handleCategorySelect('Todos')}
              className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-xs cursor-pointer"
            >
              Ver Todos los Productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
              >
                <Link href={`/product/${product.id}`} className="block relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                      {product.badge}
                    </span>
                  )}
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

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-base md:text-lg font-black text-slate-900">
                      {siteConfig.currencySymbol}{product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => handleBuyNow(product, e)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-1 hover:shadow-orange-500/50 active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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