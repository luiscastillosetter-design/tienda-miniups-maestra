'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const defaultSlides = [
  {
    id: 1,
    title: '', 
    description: '',
    desktopImg: '/hero/hero1catalogo.png',
    mobileImg: '/hero/hero1catalogo-mobile.png',
    btnText: '',
    btnLink: '/catalogo',
  },
  {
    id: 2,
    title: 'Tecnología de Respaldo Ininterrumpido',
    description: 'Mini UPS inteligentes de alta potencia para tu hogar y oficina.',
    desktopImg: '/hero/hero2afiliados.png',
    mobileImg: '/hero/hero2afiliados-mobile.png',
    btnText: 'Afíliate',
    btnLink: '/afiliados',
  },
  {
    id: 3,
    title: 'Crea tu Cuenta Personalizada',
    description: 'Acceso exclusivo a ofertas secretas y seguimiento en tiempo real de tus pedidos.',
    desktopImg: '/hero/hero3registro.png',
    mobileImg: '/hero/hero3registro-mobile.png',
    btnText: 'Regístrate',
    btnLink: '?auth=register',
  },
];

export function HeroCarousel() {
  const autoplayOptions = { delay: 7000, stopOnInteraction: false, rootNode: (emblaRoot: any) => emblaRoot.parentElement };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [slides, setSlides] = useState<any[]>(defaultSlides);

  // Leer los cambios guardados desde el panel Admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('store_hero_slides');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
          }
        } catch (error) {
          console.error('Error al cargar slides de hero:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    };

    emblaApi.on('init', onInit);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('init', onInit);
      emblaApi.off('reInit', onInit);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, slides]);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  return (
    <div className="w-full">
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex w-full">
          {slides.map((slide) => {
            const desktopImage = slide.desktopImg || slide.bgImageDesktop || '';
            const mobileImage = slide.mobileImg || slide.bgImageMobile || desktopImage;
            const hasText = Boolean(slide.title || slide.description || slide.btnText);

            return (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0 relative h-[50vh] md:h-[70vh] w-full px-2 md:px-0 flex items-center justify-center"
              >
                <div className="w-full h-full flex flex-col justify-center px-6 md:px-20 relative overflow-hidden rounded-3xl md:rounded-none shadow-xl md:shadow-none">
                  
                  {/* Imagen Desktop */}
                  <div
                    className="hidden md:block absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url('${desktopImage}')` }}
                  ></div>

                  {/* Imagen Mobile */}
                  <div
                    className="block md:hidden absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url('${mobileImage}')` }}
                  ></div>

                  {/* Si no tiene texto, toda la tarjeta es el enlace */}
                  {!hasText && slide.btnLink && (
                    <Link href={slide.btnLink} className="absolute inset-0 z-10 cursor-pointer"></Link>
                  )}

                  {hasText && (
                    <div className="absolute inset-0 bg-black/40 z-0"></div>
                  )}

                  {hasText && (
                    <>
                      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-start text-left">
                        {slide.title && (
                          <h2 className="text-2xl md:text-6xl font-extrabold text-white mb-2 md:mb-4 leading-tight tracking-tight drop-shadow-md">
                            {slide.title}
                          </h2>
                        )}
                        {slide.description && (
                          <p className="text-xs md:text-xl text-white/90 max-w-xl font-medium mb-8 drop-shadow-md">
                            {slide.description}
                          </p>
                        )}
                      </div>

                      {slide.btnLink && (
                        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-20 z-20">
                          <Link
                            href={slide.btnLink}
                            className="inline-flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-3.5 bg-orange-500 text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] transition-all duration-300 text-xs md:text-lg uppercase tracking-wide whitespace-nowrap"
                          >
                            {slide.btnText || 'Ver Más'}
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                          </Link>
                        </div>
                      )}
                    </>
                  )}

                  <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex justify-center gap-2 md:gap-3 z-30">
                    {scrollSnaps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`rounded-full transition-all duration-500 shadow-md ${
                          index === selectedIndex
                            ? 'bg-orange-500 w-6 md:w-10 h-2'
                            : 'bg-white/40 hover:bg-white/60 w-2 h-2'
                        }`}
                        aria-label={`Ir a tarjeta ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}