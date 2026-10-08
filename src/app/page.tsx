'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { Smartphone, Headphones, Home as HomeIcon, Gamepad2, Zap, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { OffersCarousel } from '@/components/OffersCarousel';

const categories = [
  { id: 0, name: 'Todos', icon: LayoutGrid },
  { id: 1, name: 'Phones', icon: Smartphone },
  { id: 2, name: 'Audio', icon: Headphones },
  { id: 3, name: 'Smart Home', icon: HomeIcon },
  { id: 4, name: 'Gaming', icon: Gamepad2 },
  { id: 5, name: 'Gadgets', icon: Zap },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const trendsRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await productService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === null || selectedCategory === 0) {
      setFilteredProducts(products);
    } else {
      const categoryName = categories.find(c => c.id === selectedCategory)?.name || '';
      const filtered = products.filter(p => p.category?.toLowerCase() === categoryName.toLowerCase());
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('todomax_ref', ref);
    }
  }, [searchParams]);

  const getProductsByCategory = (categoryName: string) => {
    return products.filter(p => p.category?.toLowerCase() === categoryName.toLowerCase()).slice(0, 1);
  };

  const getCatalogProducts = () => {
    return products.slice(0, 5);
  };

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <>
      {/* ============================== */}
      {/* VISTA MÓVIL */}
      {/* ============================== */}
      <div className="md:hidden bg-white min-h-screen relative pb-28 pt-[140px]">
        
        <section className="w-full">
          <HeroCarousel />
        </section>

        <section className="w-full bg-white py-4 px-4">
          <div className="flex overflow-x-auto gap-4 scrollbar-hide">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isAll = category.id === 0;
              return (
                <Link
                  key={category.id}
                  href={isAll ? '/catalogo' : `/catalogo?category=${category.name}`}
                  onClick={() => setSelectedCategory(isAll ? 0 : category.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer"
                >
                  <div className="p-3 bg-gray-50 rounded-2xl drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300">
                    <IconComponent className="w-7 h-7 text-slate-800 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <span className="text-xs font-semibold text-center text-slate-700">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <main className="w-full px-4 py-4" id="productos">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Productos en tendencia</h2>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 font-medium">No hay productos</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 snap-x pb-4 scrollbar-hide">
              {categories.slice(1).map((cat) => {
                const catProducts = getProductsByCategory(cat.name);
                return catProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group flex-shrink-0 snap-start">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 h-full flex flex-col w-[170px]">
                      <div className="relative w-full aspect-[9/16] bg-[#F8FAFC] overflow-hidden rounded-t-3xl">
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          sizes="170px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                        />
                        {product.badge && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase">
                            {product.badge}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-3">
                        <h3 className="text-xs font-bold text-slate-900 mb-1.5 line-clamp-2 leading-snug">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-sm font-black text-slate-900">
                            {siteConfig.currencySymbol}{product.price}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg">
                            Ver
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ));
              })}
            </div>
          )}
        </main>

        <section className="w-full mt-6" id="ofertas">
          <OffersCarousel />
        </section>

        <section className="w-full px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Catálogo</h2>
            <Link href="/catalogo" className="text-xs font-bold text-orange-500">Ver todo</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 snap-x pb-4 scrollbar-hide">
            {getCatalogProducts().map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group flex-shrink-0 snap-start">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 h-full flex flex-col w-[170px]">
                  <div className="relative w-full aspect-[9/16] bg-[#F8FAFC] overflow-hidden rounded-t-3xl">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="170px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase">
                        {product.badge}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-3">
                    <h3 className="text-xs font-bold text-slate-900 mb-1.5 line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-sm font-black text-slate-900">
                        {siteConfig.currencySymbol}{product.price}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg">
                        Ver
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ============================== */}
      {/* VISTA DESKTOP (PC) */}
      {/* ============================== */}
      <div className="hidden md:block bg-slate-50 min-h-screen py-8 pt-[140px]">
        <div className="w-full">
          
          <section className="w-full mb-12">
            <HeroCarousel />
          </section>

          <section className="w-full px-8 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Categorías</h2>
            <div className="flex justify-center gap-16">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isAll = category.id === 0;
                return (
                  <Link
                    key={category.id}
                    href={isAll ? '/catalogo' : `/catalogo?category=${category.name}`}
                    onClick={() => setSelectedCategory(isAll ? 0 : category.id)}
                    className="flex flex-col items-center gap-3 group cursor-pointer"
                  >
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 text-slate-600 group-hover:bg-slate-50 group-hover:text-slate-900 transition-all duration-300">
                      <IconComponent className="w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-semibold text-center text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-widest">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <main className="w-full px-8 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Últimas Tendencias</h2>
              <Link href="/catalogo" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                Ver todo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
                <p className="text-base text-gray-500 font-medium">No hay productos</p>
              </div>
            ) : (
              <div className="relative group">
                <button onClick={() => scrollLeft(trendsRef)} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl p-4 rounded-full text-slate-900 hover:bg-orange-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div ref={trendsRef} className="flex overflow-x-auto gap-6 snap-x pb-4 scrollbar-hide px-2">
                  {categories.slice(1).map((cat) => {
                    const catProducts = getProductsByCategory(cat.name);
                    return catProducts.map((product) => (
                      <Link key={product.id} href={`/product/${product.id}`} className="group flex-shrink-0 snap-start block">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 h-full flex flex-col w-[260px] hover:-translate-y-1">
                          <div className="relative w-full aspect-[9/16] bg-[#F8FAFC] overflow-hidden rounded-t-3xl group-hover:shadow-md transition-shadow duration-300">
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              sizes="260px"
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
                            />
                            {product.badge && (
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
                                {product.badge}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1 p-5">
                            <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2">
                              {product.title}
                            </h3>
                            <div className="flex items-center justify-between mt-auto pt-3">
                              <span className="text-lg font-black text-slate-900">
                                {siteConfig.currencySymbol}{product.price}
                              </span>
                              <span className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl group-hover:bg-orange-500 transition-colors">
                                Ver Detalles
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ));
                  })}
                </div>

                <button onClick={() => scrollRight(trendsRef)} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl p-4 rounded-full text-slate-900 hover:bg-orange-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </main>

          <section className="w-full mb-16" id="ofertas">
            <OffersCarousel />
          </section>

          <section className="w-full px-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Catálogo</h2>
              <Link href="/catalogo" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                Ver catálogo completo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative group">
              <button onClick={() => scrollLeft(catalogRef)} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl p-4 rounded-full text-slate-900 hover:bg-orange-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div ref={catalogRef} className="flex overflow-x-auto gap-6 snap-x pb-4 scrollbar-hide px-2">
                {getCatalogProducts().map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group flex-shrink-0 snap-start block">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 h-full flex flex-col w-[260px] hover:-translate-y-1">
                      <div className="relative w-full aspect-[9/16] bg-[#F8FAFC] overflow-hidden rounded-t-3xl group-hover:shadow-md transition-shadow duration-300">
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          sizes="260px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
                        />
                        {product.badge && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
                            {product.badge}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between mt-auto pt-3">
                          <span className="text-lg font-black text-slate-900">
                            {siteConfig.currencySymbol}{product.price}
                          </span>
                          <span className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl group-hover:bg-orange-500 transition-colors">
                            Ver Detalles
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <button onClick={() => scrollRight(catalogRef)} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl p-4 rounded-full text-slate-900 hover:bg-orange-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}