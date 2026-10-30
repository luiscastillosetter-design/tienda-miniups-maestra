'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export const defaultHeroSlides: any[] = [];

function filterValidAdminSlides(rawSlides: any[]): any[] {
  if (!Array.isArray(rawSlides)) return [];
  return rawSlides.filter((s) => {
    const dImg = String(s?.desktopImg || '').trim();
    const mImg = String(s?.mobileImg || '').trim();
    return Boolean(dImg || mImg);
  });
}

export function HeroCarousel() {
  const autoplayOptions = { delay: 6500, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [slides, setSlides] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('store_hero_slides');
        if (local) {
          const parsed = filterValidAdminSlides(JSON.parse(local));
          if (parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });

  const [isLoaded, setIsLoaded] = useState(() => slides.length > 0);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await fetch(`/api/store?key=store_hero_slides&t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            const cleanSlides = filterValidAdminSlides(json.data);
            setSlides(cleanSlides);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('store_hero_slides', JSON.stringify(cleanSlides));
              } catch (_) {}
            }
          }
        }
      } catch (_) {}
      setIsLoaded(true);
    };

    loadSlides();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.reInit();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, slides.length]);

  if (!isLoaded && slides.length === 0) {
    return (
      <div className="w-full h-[42vh] md:h-[58vh] min-h-[320px] md:min-h-[460px] rounded-2xl md:rounded-3xl bg-slate-200/70 animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 bg-slate-950">
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex w-full">
          {slides.map((slide, idx) => {
            const dImg = slide.desktopImg || slide.mobileImg || '';
            const mImg = slide.mobileImg || slide.desktopImg || '';

            return (
              <div
                key={slide.id || idx}
                className="flex-[0_0_100%] min-w-0 relative h-[42vh] md:h-[58vh] min-h-[320px] md:min-h-[460px] py-10 pb-16 md:py-16 md:pb-20 px-6 md:px-20 text-white bg-slate-950 flex flex-col justify-center items-start overflow-hidden group"
              >
                {dImg && (
                  <img
                    src={dImg}
                    alt={slide.title || 'Banner Principal'}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                {mImg && (
                  <img
                    src={mImg}
                    alt={slide.title || 'Banner Principal'}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
                  />
                )}

                <Link
                  href={slide.btnLink || '/catalogo'}
                  className="absolute inset-0 z-10 cursor-pointer"
                  aria-label={slide.title || 'Ver catálogo'}
                />

                {slide.title && slide.title.trim() !== '' && (
                  <div className="max-w-3xl space-y-3.5 md:space-y-5 relative z-20 pointer-events-none my-auto">
                    {slide.badge && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] md:text-xs font-black uppercase tracking-wider shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-white flex-shrink-0" />
                        <span>{slide.badge}</span>
                      </span>
                    )}

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
                      {slide.title}
                    </h1>

                    {slide.subtitle && (
                      <p className="text-xs sm:text-sm md:text-lg text-white/95 font-medium max-w-2xl leading-relaxed drop-shadow-md">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Botón CTA esquina inferior izquierda */}
                {slide.showBtn !== false && (
                  <div className="absolute bottom-6 left-6 md:bottom-8 md:left-12 z-20 pointer-events-auto">
                    <Link
                      href={slide.btnLink || '/catalogo'}
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-2.5 md:px-7 md:py-3.5 rounded-2xl shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 transition-all duration-300 text-xs md:text-sm active:scale-95 cursor-pointer group/btn"
                    >
                      <ShoppingBag className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                      <span>{slide.btnText || 'Comprar Ahora'}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === selectedIndex ? 'w-10 bg-white shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}