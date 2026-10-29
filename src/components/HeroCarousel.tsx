'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export const defaultHeroSlides = [
  {
    id: 1,
    badge: 'PRODUCTO ESTRELLA & COMBOS',
    title: 'Importadora Directa TodoMax',
    subtitle: 'Tecnología, hogar, cocina, automóvil y belleza con garantía y envío gratis en compras mayores a $50.',
    btnText: 'Comprar Ahora',
    btnLink: '/catalogo',
    desktopImg: '/hero/hero1catalogo.png',
    mobileImg: '/hero/hero1catalogo-mobile.png',
    bgGradient: 'from-orange-600 via-orange-500 to-amber-500',
  },
  {
    id: 2,
    badge: 'PROGRAMA DE AFILIADOS',
    title: 'Gana Dinero con TodoMax',
    subtitle: 'Promociona productos de alta rotación con videos profesionales preaprobados y cobra comisiones directas.',
    btnText: 'Quiero ser Afiliado',
    btnLink: '/afiliados',
    desktopImg: '/hero/hero2afiliados.png',
    mobileImg: '/hero/hero2afiliados-mobile.png',
    bgGradient: 'from-slate-950 via-slate-900 to-orange-950',
  },
  {
    id: 3,
    badge: 'ENVÍO GRATIS A TODO EL PAÍS',
    title: 'Despachos por MRW, Zoom y Tealca',
    subtitle: 'Recibe directo en tu puerta con entrega rápida y respaldo asegurado en cada orden.',
    btnText: 'Explorar Catálogo',
    btnLink: '/catalogo',
    desktopImg: '/hero/hero3registro.png',
    mobileImg: '/hero/hero3registro-mobile.png',
    bgGradient: 'from-emerald-800 via-teal-700 to-slate-900',
  },
];

export function HeroCarousel() {
  const autoplayOptions = { delay: 6500, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slides, setSlides] = useState<any[]>(defaultHeroSlides);

  useEffect(() => {
    const loadSlides = async () => {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('store_hero_slides');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
            }
          } catch (e) {}
        }
      }

      try {
        const res = await fetch(`/api/store?key=store_hero_slides&t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setSlides(json.data);
            localStorage.setItem('store_hero_slides', JSON.stringify(json.data));
          }
        }
      } catch (e) {}
    };

    loadSlides();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50">
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex w-full">
          {slides.map((slide) => {
            const dImg = slide.desktopImg || '';
            const mImg = slide.mobileImg || dImg;

            return (
              <div
                key={slide.id}
                className={`flex-[0_0_100%] min-w-0 relative h-[48vh] md:h-[62vh] min-h-[380px] md:min-h-[480px] py-12 md:py-20 px-6 md:px-20 text-white bg-gradient-to-r ${slide.bgGradient || 'from-slate-900 via-slate-800 to-orange-950'} flex flex-col justify-center items-start overflow-hidden group`}
              >
                {/* Imagen PC */}
                {dImg && (
                  <img
                    src={dImg}
                    alt={slide.title || 'Banner Principal'}
                    className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                {/* Imagen Móvil */}
                {mImg && (
                  <img
                    src={mImg}
                    alt={slide.title || 'Banner Principal'}
                    className="block md:hidden absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                {/* Enlace global si el banner es solo imagen */}
                <Link href={slide.btnLink || '/catalogo'} className="absolute inset-0 z-10 cursor-pointer" aria-label={slide.title || 'Ver catálogo'} />

                {/* Renderizar textos y botón SOLO si escribes un Título explícito en el Admin */}
                {slide.title && (
                  <div className="max-w-3xl space-y-4 md:space-y-6 relative z-20 pointer-events-none">
                    {slide.badge && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] md:text-xs font-black uppercase tracking-wider shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-white" />
                        {slide.badge}
                      </span>
                    )}

                    <h1 className="text-3xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
                      {slide.title}
                    </h1>

                    {slide.subtitle && (
                      <p className="text-xs md:text-lg text-white/95 font-medium max-w-2xl leading-relaxed drop-shadow-md">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="pt-2 pointer-events-auto">
                      <Link
                        href={slide.btnLink || '/catalogo'}
                        className="inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black px-7 py-4 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1.5 transition-all duration-300 ease-out text-xs md:text-sm active:scale-95 cursor-pointer group/btn"
                      >
                        <ShoppingBag className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                        <span>{slide.btnText || 'Comprar Ahora'}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Puntos de navegación */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
        {slides.map((_, i) => (
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