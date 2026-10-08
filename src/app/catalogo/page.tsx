'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react';

// Aquí vinculamos las imágenes de las categorías que subiste a tu carpeta public/categories/
const categoryBanners = [
  { id: 'Todos', name: 'Catálogo Completo', image: '/categories/todos.png' }, // Usamos la del hero como general
  { id: 'Phones', name: 'Smartphones', image: '/categories/phone.png' },
  { id: 'Audio', name: 'Audio Profesional', image: '/categories/sonido.png' },
  { id: 'Smart Home', name: 'Hogar Inteligente', image: '/categories/smarthome.png' },
  { id: 'Gaming', name: 'Zona Gaming', image: '/categories/gaming.png' },
  { id: 'Gadgets', name: 'Accesorios y Gadgets', image: '/categories/gadgets.png' },
];

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Configuración del gran carrusel de categorías superior
  const autoplayOptions = { delay: 5000, stopOnInteraction: false, rootNode: (emblaRoot: any) => emblaRoot.parentElement };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay(autoplayOptions)]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await productService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    };
    loadProducts();
  }, []);

  // Lógica que filtra la grilla de abajo dependiendo de a qué categoría entraste
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    
    if (products.length > 0) {
      if (!categoryParam || categoryParam.toLowerCase() === 'todos') {
        setActiveCategory('Todos');
        setFilteredProducts(products);
      } else {
        const isKnownCategory = categoryBanners.some(c => c.id.toLowerCase() === categoryParam.toLowerCase());
        setActiveCategory(isKnownCategory ? categoryParam : 'Todos');
        const filtered = products.filter(p => p.category?.toLowerCase() === categoryParam.toLowerCase());
        setFilteredProducts(filtered);
      }
    }
  }, [searchParams, products]);

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'Todos') {
      router.push('/catalogo');
    } else {
      router.push(`/catalogo?category=${categoryId}`);
    }
  };

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24 md:pb-12 pt-36 md:pt-44">
      
      {/* 1. EL GRAN CARRUSEL DE CATEGORÍAS (Reemplaza el banner oscuro) */}
      <div className="w-full relative bg-white border-b border-gray-100 shadow-sm">
        <div ref={emblaRef} className="overflow-hidden w-full">
          <div className="flex w-full">
            {categoryBanners.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex-[0_0_100%] min-w-0 relative h-[30vh] md:h-[45vh] w-full cursor-pointer group"
              >
                {/* Imagen de la categoría como fondo */}
                <div 
                  className="w-full h-full bg-cover bg-center flex flex-col justify-center items-center relative transition-transform duration-700"
                  style={{ backgroundImage: `url(${cat.image})` }}
                >
                  {/* Capa oscura superpuesta para que el texto resalte */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                  
                  <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider drop-shadow-lg mb-2 transform group-hover:scale-105 transition-transform duration-300">
                      {cat.name}
                    </h1>
                    <span className="inline-block px-6 py-2 mt-4 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Explorar Categoría
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles laterales del carrusel */}
        <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all opacity-0 md:opacity-100 cursor-pointer">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all opacity-0 md:opacity-100 cursor-pointer">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 2. NAVEGADOR RÁPIDO DE PÍLDORAS (Debajo del banner) */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          {categoryBanners.map((cat) => (
             <button
               key={`pill-${cat.id}`}
               onClick={() => handleCategoryClick(cat.id)}
               className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                 activeCategory.toLowerCase() === cat.id.toLowerCase()
                   ? 'bg-slate-900 text-white shadow-md'
                   : 'bg-white text-slate-600 border border-gray-200 hover:border-slate-400 hover:text-slate-900'
               }`}
             >
               {cat.id}
             </button>
          ))}
        </div>
      </div>

      {/* 3. GRILLA DE PRODUCTOS (Haciendo scroll normal hacia abajo) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-4">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-medium text-slate-500">
            Mostrando <span className="font-bold text-slate-900">{filteredProducts.length}</span> productos en {activeCategory}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Zap className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No hay productos aquí</h3>
            <p className="text-sm text-gray-500 mb-6">Pronto añadiremos nuevo inventario a esta categoría.</p>
            <button onClick={() => handleCategoryClick('Todos')} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors cursor-pointer">
              Ver Catálogo Completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group h-full block">
                {/* Diseño limpio premium aplicado aquí también */}
                <div className="bg-white rounded-2xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="relative w-full aspect-[4/5] bg-[#F8FAFC] overflow-hidden rounded-2xl">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
                        {product.badge}
                      </div>
                    )}
                    <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <span className="block w-full py-2.5 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold text-center rounded-lg shadow-lg">
                         Ver Detalles
                       </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1 pt-4 pb-3 px-2">
                    <h3 className="text-xs md:text-sm font-medium text-slate-700 mb-1.5 line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-base md:text-lg font-bold text-slate-900 mt-auto">
                      {siteConfig.currencySymbol}{product.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando Catálogo...</div>}>
      <CatalogoContent />
    </Suspense>
  );
}