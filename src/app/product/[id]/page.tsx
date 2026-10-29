'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Truck, CheckCircle2, CreditCard, Play, Flame, ListChecks } from 'lucide-react';
import { productService } from '@/services/productService';
import type { Product } from '@/data/products';
import { siteConfig } from '@/config/site';
import { useCartStore } from '@/store/cartStore';

export default function ProductPage() {
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const router = useRouter();
  const { addItem, toggleCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const allProducts = await productService.getProducts();
      const current = allProducts.find(p => String(p.id) === String(productId));
      
      if (current) {
        setProduct(current);
        const related = allProducts.filter(p => p.id !== current.id);
        setRelatedProducts(related);
      }
      setIsLoading(false);
    };
    load();
  }, [productId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-700">Cargando producto...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-4">Producto no encontrado</h2>
        <Link href="/catalogo" className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video');
  };

  const currentMedia = product.images?.[selectedImageIndex] || product.images?.[0];
  const firstImageForCart = product.images?.find((img) => !isVideo(img)) || product.images?.[0] || '';
  const isOutOfStock = product.stock <= 0;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push('/catalogo');
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: firstImageForCart,
        stock: product.stock,
      },
      quantity
    );
    toggleCart();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: firstImageForCart,
        stock: product.stock,
      },
      quantity
    );
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 md:pt-36 pb-24">
      <main className="w-full px-4 md:px-10 lg:px-16 space-y-12">
        
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-500 font-bold text-xs cursor-pointer hover:-translate-x-1 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>

        {/* Ficha Principal Panorámica */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LADO IZQUIERDO: Gran Visor Multimedia (7 de 12 columnas) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Tira de Miniaturas con soporte para Foto y Video */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[550px] pb-2 md:pb-0 scrollbar-hide">
                {product.images.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 overflow-hidden bg-slate-50 flex-shrink-0 cursor-pointer transition-all ${
                      selectedImageIndex === idx ? 'border-orange-500 shadow-md scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isVideo(media) ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                        <video src={media} muted className="w-full h-full object-cover opacity-70" />
                        <Play className="w-5 h-5 text-white absolute" />
                      </div>
                    ) : (
                      <img src={media} alt="Miniatura" className="w-full h-full object-contain p-1" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Imagen/Video Principal Grande */}
            <div className="relative flex-1 aspect-square md:aspect-auto md:min-h-[550px] bg-slate-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center p-6">
              {isVideo(currentMedia) ? (
                <video src={currentMedia} controls autoPlay muted loop className="w-full h-full object-contain rounded-2xl max-h-[520px]" />
              ) : (
                <img src={currentMedia} alt={product.title} className="w-full h-full object-contain" />
              )}
              {product.badge && (
                <span className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-xl uppercase shadow-md">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* LADO DERECHO: Caja de Compra y Detalles Estructurados (5 de 12 columnas) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-orange-50 text-orange-600 font-black text-xs px-3 py-1 rounded-lg uppercase">
                  {product.category}
                </span>
                <span className={`font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1 ${
                  isOutOfStock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {isOutOfStock ? '✕ Agotado' : `✓ Stock: ${product.stock} disponibles`}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Bloque de Precios y Envío */}
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-5xl font-black text-slate-900">
                    {siteConfig.currencySymbol}{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {siteConfig.currencySymbol}{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  {product.price * quantity >= siteConfig.shipping.freeShippingThreshold
                    ? '¡Califica para ENVÍO GRATIS a todo el país!'
                    : `Agrega ${siteConfig.currencySymbol}${(siteConfig.shipping.freeShippingThreshold - product.price * quantity).toFixed(2)} más para envío gratis.`}
                </p>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="pt-1">
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-normal">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Beneficios destacados */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-black uppercase text-slate-900 tracking-wider">Beneficios destacados:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {product.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-white p-2.5 rounded-xl border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Características / Ficha Técnica */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-orange-500" /> Especificaciones Técnicas:
                  </p>
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-1.5">
                    {product.features.map((f, i) => (
                      <div key={i} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                        <span className="text-orange-500 font-black">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Controles de Compra */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                <div className="flex items-center border border-gray-200 rounded-2xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:text-orange-500 disabled:opacity-30 cursor-pointer rounded-xl hover:bg-white"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-black text-slate-900">{isOutOfStock ? 0 : quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:text-orange-500 disabled:opacity-30 cursor-pointer rounded-xl hover:bg-white"
                    title={quantity >= product.stock ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sin Existencias' : 'Agregar al Carrito'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all cursor-pointer active:scale-95"
                >
                  <span>{isOutOfStock ? 'Agotado' : 'Comprar Ahora'}</span>
                </button>
              </div>

              {/* Métodos de Pago y Confianza */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-gray-500 font-medium">
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Truck className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{siteConfig.shipping.companies.slice(0, 3).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CreditCard className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Pago Móvil, Zelle, USDT</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CARRUSEL INFERIOR DE REMARKETING CON SOPORTE COMPLETO DE VIDEO */}
        {relatedProducts.length > 0 && (
          <section className="w-full pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-orange-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-orange-500" /> Quienes vieron esto también compraron
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Productos Recomendados</h3>
              </div>
              <Link href="/catalogo" className="text-xs font-bold text-orange-500 hover:underline">
                Ver Todo el Catálogo
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {relatedProducts.slice(0, 6).map((p) => {
                const coverMedia = p.images?.[0] || '';
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="bg-white rounded-3xl border border-gray-200/80 p-4 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="aspect-square bg-slate-50 rounded-2xl mb-3 p-3 overflow-hidden">
                      {isVideo(coverMedia) ? (
                        <video src={coverMedia} muted autoPlay loop playsInline className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <img src={coverMedia} alt={p.title} className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-orange-500 uppercase">{p.category}</span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-orange-500 transition-colors">{p.title}</h4>
                      <p className="text-base font-black text-slate-900 pt-1">{siteConfig.currencySymbol}{p.price.toFixed(2)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}