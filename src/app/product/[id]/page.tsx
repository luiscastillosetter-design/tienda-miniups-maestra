'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingCart, ChevronLeft, ShieldCheck, Truck } from 'lucide-react';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { siteConfig } from '@/config/site';
import { notFound } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function ProductPage() {
  // 1. TODOS LOS HOOKS ARRIBA (Regla estricta de React)
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const router = useRouter();
  const { addItem, toggleCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 2. EFECTOS
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      const data = await productService.getProductById(productId || '');
      setProduct(data || null);
      setIsLoading(false);
    };
    loadProduct();
  }, [productId]);

  // 3. CONDICIONALES (Siempre deben ir debajo de todos los Hooks)
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!product) {
    notFound();
  }

  // 4. FUNCIONES DE ACCIÓN
  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images[0],
      },
      quantity
    );
    toggleCart();
  };

  const handleBuyNow = () => {
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images[0],
      },
      quantity
    );
    router.push('/checkout');
  };

  // 5. RENDERIZADO VISUAL
  return (
    <div className="min-h-screen bg-white">
      <main className="w-full px-4 py-6 md:py-10 lg:py-12">
        <div className="max-w-6xl mx-auto">
          
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors py-3 px-4 rounded-lg hover:bg-slate-100 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Imagen Principal */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-[#F8FAFC] border border-gray-100">
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  fill
                  className="object-cover mix-blend-multiply"
                  priority
                />
              </div>

              {/* Miniaturas */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#F8FAFC] ${
                      selectedImageIndex === index
                        ? 'border-orange-500 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      fill
                      className="object-cover pointer-events-none mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Información del Producto */}
            <div className="flex flex-col gap-6">
              <div>
                <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-md mb-3 uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  {product.title}
                </h1>
              </div>

              <p className="text-4xl font-black text-slate-900">
                {siteConfig.currencySymbol}{product.price}
              </p>

              <div className="py-4 border-y border-gray-100">
                <p className="text-base text-gray-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Características principales:</h3>
                <ul className="space-y-2.5">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <span className="text-slate-600 text-sm md:text-base font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selector de cantidad */}
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide">Cantidad</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white w-fit shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center font-bold text-slate-500 hover:bg-gray-50 hover:text-orange-500 cursor-pointer text-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-slate-900 text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center font-bold text-slate-500 hover:bg-gray-50 hover:text-orange-500 cursor-pointer text-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de acción principales */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl font-bold bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center gap-2 hover:bg-slate-50 shadow-sm cursor-pointer active:scale-95 transition-all text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al Carrito
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg hover:shadow-orange-500/30 cursor-pointer active:scale-95 transition-all text-base"
                >
                  Comprar Ahora
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span>Envíos rápidos a nivel nacional</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span>Compra 100% protegida y garantizada</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}