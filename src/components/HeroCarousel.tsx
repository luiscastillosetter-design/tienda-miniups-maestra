'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

const defaultSlides = [
  {
    id: 1,
    badge: 'PRODUCTO ESTRELLA & COMBOS',
    title: 'Importadora Directa TodoMax',
    subtitle: 'Tecnología, hogar, cocina, automóvil y belleza con garantía y envío gratis en compras mayores a $50.',
    btnText: 'Comprar Ahora',
    btnLink: '/catalogo',
    bgGradient: 'from-orange-600 via-orange-500 to-amber-500',
  },
  {
    id: 2,
    badge: 'PROGRAMA DE AFILIADOS',
    title: 'Gana Dinero con TodoMax',
    subtitle: 'Promociona productos de alta rotación con videos profesionales preaprobados y cobra comisiones directas.',
    btnText: 'Quiero ser Afiliado',
    btnLink: '/afiliados',
    bgGradient: 'from-slate-950 via-slate-900 to-orange-950',
  },
  {
    id: 3,
    badge: 'ENVÍO GRATIS A TODO EL PAÍS',
    title: 'Despachos por MRW, Zoom y Tealca',
    subtitle: 'Recibe directo en tu puerta con entrega rápida y respaldo asegurado en cada orden.',
    btnText: 'Explorar Catálogo',
    btnLink: '/catalogo',
    bgGradient: 'from-emerald-800 via-teal-700 to-slate-900',
  },
];

export function HeroCarousel() {
  const autoplayOptions = { delay: 6500, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50">
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex w-full">
          {defaultSlides.map((slide) => (
            <div
              key={slide.id}
              className={`flex-[0_0_100%] min-w-0 relative h-[48vh] md:h-[62vh] min-h-[380px] md:min-h-[480px] py-12 md:py-20 px-6 md:px-20 text-white bg-gradient-to-r ${slide.bgGradient} flex flex-col justify-center items-start`}
            >
              <div className="max-w-3xl space-y-4 md:space-y-6 relative z-10">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] md:text-xs font-black uppercase tracking-wider shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  {slide.badge}
                </span>

                <h1 className="text-3xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
                  {slide.title}
                </h1>

                <p className="text-xs md:text-lg text-white/95 font-medium max-w-2xl leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="pt-2">
                  <Link
                    href={slide.btnLink}
                    className="inline-flex items-center gap-2.5 bg-white text-slate-900 hover:bg-orange-50 font-black px-7 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-xs md:text-sm active:scale-95 cursor-pointer group"
                  >
                    <ShoppingBag className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span>{slide.btnText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Puntos de navegación */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {defaultSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === selectedIndex ? 'w-10 bg-white shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}