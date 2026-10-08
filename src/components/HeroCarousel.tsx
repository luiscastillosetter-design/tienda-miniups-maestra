'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';

const defaultSlides = [
  {
    id: 1,
    title: 'Catálogo',
    desktopImg: '/hero/hero1catalogo.png',
    mobileImg: '/hero/hero1catalogo-mobile.png',
    btnLink: '/catalogo',
  },
  {
    id: 2,
    title: 'Afiliados',
    desktopImg: '/hero/hero2afiliados.png',
    mobileImg: '/hero/hero2afiliados-mobile.png',
    btnLink: '/afiliados',
  },
  {
    id: 3,
    title: 'Registro',
    desktopImg: '/hero/hero3registro.png',
    mobileImg: '/hero/hero3registro-mobile.png',
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

            return (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0 relative h-[50vh] md:h-[70vh] w-full px-2 md:px-0 flex items-center justify-center"
              >
                <div className="w-full h-full flex flex-col justify-center px-6 md:px-20 relative overflow-hidden rounded-3xl md:rounded-none shadow-xl md:shadow-none">
                  
                  {/* Banner versión Ordenador */}
                  <div
                    className="hidden md:block absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url('${desktopImage}')` }}
                  ></div>

                  {/* Banner versión Móvil */}
                  <div
                    className="block md:hidden absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url('${mobileImage}')` }}
                  ></div>

                  {/* Enlace transparente que cubre toda la tarjeta */}
                  <Link
                    href={slide.btnLink || '/catalogo'}
                    className="absolute inset-0 z-10 cursor-pointer"
                    aria-label={slide.title || 'Ver promoción'}
                  ></Link>

                  {/* Paginación de navegación (puntos inferiores) */}
                  <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex justify-center gap-2 md:gap-3 z-30 pointer-events-auto">
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