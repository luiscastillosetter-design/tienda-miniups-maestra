'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/data/products';
import { siteConfig } from '@/config/site';
import { ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';

export default function Home() {
  const searchParams = useSearchParams();

  // Captura invisible del parámetro de referidos (afiliados)
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('todomax_ref', ref);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner Comercial estilo Referencia */}
      <section className="bg-slate-900 text-white py-12 md:py-16 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold px-3 py-1 rounded-full mb-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Tecnología de Respaldo Premium
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Protege tus equipos contra apagones
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mb-8 font-light">
            Mini UPS inteligentes y soluciones de energía ininterrumpida para mantener tu hogar y oficina siempre conectados.
          </p>
          
          {/* Trust Badges Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8 border-t border-slate-800 text-xs md:text-sm text-gray-300">
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span>Envíos Nacionales Seguros</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span>Garantía de Calidad 100%</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span>Atención Directa por WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grilla de Productos */}
      <main className="w-full px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto" id="productos">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl text-slate-900 font-bold tracking-tight">
              Nuestros Productos
            </h2>
            <span className="text-sm text-gray-500 font-medium">
              {products.length} productos disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group h-full">
                <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 h-full flex flex-col">
                  {/* Imagen con badge */}
                  <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      Envío Gratis
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2 line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-2xl font-extrabold text-orange-500 mb-4">
                      {siteConfig.currencySymbol}{product.price}
                    </p>
                    <button className="w-full py-3 rounded-xl font-bold text-sm bg-slate-900 text-white group-hover:bg-orange-500 transition-colors shadow-xs cursor-pointer">
                      Ver Producto
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}