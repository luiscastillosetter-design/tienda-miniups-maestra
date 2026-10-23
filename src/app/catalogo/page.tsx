'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    const loadProducts = async () => {
      const data = await productService.getProducts();
      setProducts(data);
    };
    loadProducts();
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
    <div className="w-full bg-slate-50 min-h-screen pb-24 pt-28 md:pt-36">
      <div className="w-full px-4 md:px-10 lg:px-16 space-y-8">
        
        {/* Cabecera Panorámica */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <span className="text-orange-500 font-black text-xs uppercase tracking-wider">
              {siteConfig.storeName}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mt-1 mb-3">
              Catálogo Completo de Importación
            </h1>
            <p className="text-xs md:text-base text-gray-500 font-medium leading-relaxed">
              Descubre miles de oportunidades con precios directos de mayorista, garantía oficial en Venezuela y despacho gratuito a partir de ${siteConfig.shipping.freeShippingThreshold}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
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

        {/* Grilla de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200/80">
            <p className="text-base text-gray-500 font-bold mb-4">No hay productos disponibles en esta categoría.</p>
            <button
              onClick={() => handleCategorySelect('Todos')}
              className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-xs"
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
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      Comprar
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