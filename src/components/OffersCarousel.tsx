'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';

export function OffersCarousel() {
  const autoplayOptions = { delay: 7000, stopOnInteraction: false, rootNode: (emblaRoot: any) => emblaRoot.parentElement };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

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
  }, [emblaApi]);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  const offers = [
    {
      id: 1,
      title: 'SÚPER OFERTA: 40% en Accesorios',
      description: 'Todos nuestros accesorios con descuento increíble',
      bgImageDesktop: '/ofertas/oferta1.png',
      bgImageMobile: '/ofertas/oferta1-mobile.png',
    },
    {
      id: 2,
      title: 'PAQUETES ESPECIALES: 2x1',
      description: 'Compra dos productos y lleva uno gratis',
      bgImageDesktop: '/ofertas/oferta2.png',
      bgImageMobile: '/ofertas/oferta2-mobile.png',
    },
    {
      id: 3,
      title: 'ENVÍO GRATIS A TODO EL PAÍS',
      description: 'En compras mayores a $50',
      bgImageDesktop: '/ofertas/oferta3.png',
      bgImageMobile: '/ofertas/oferta3-mobile.png',
    },
  ];

  return (
    <div className="w-full scroll-mt-36 md:scroll-mt-44" id="ofertas">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex-[0_0_100%] min-w-0 relative h-[45vh] md:h-[60vh] w-full px-2 md:px-0 flex items-center justify-center"
            >
              <div className="w-full h-full flex flex-col justify-center px-8 md:px-24 relative overflow-hidden rounded-3xl md:rounded-none shadow-xl md:shadow-none">
                
                {/* Imagen Desktop */}
                <div
                  className="hidden md:block absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url('${offer.bgImageDesktop}')` }}
                ></div>

                {/* Imagen Mobile */}
                <div
                  className="block md:hidden absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url('${offer.bgImageMobile || offer.bgImageDesktop}')` }}
                ></div>

                {/* SIN capa oscura, SIN botón, toda la tarjeta es un enlace */}
                <Link href="/catalogo" className="absolute inset-0 z-10 cursor-pointer"></Link>

                {/* Textos alineados a la izquierda, centro-izquierdo, en color negro */}
                <div className="relative z-20 w-full max-w-2xl flex flex-col items-start text-left pointer-events-none">
                  <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-2 md:mb-4 leading-tight">
                    {offer.title}
                  </h2>
                  <p className="text-xs md:text-xl text-slate-800 font-bold">
                    {offer.description}
                  </p>
                </div>

                {/* Paginación */}
                <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex justify-center gap-3 z-30 pointer-events-auto">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className={`rounded-full transition-all duration-500 shadow-sm ${
                        index === selectedIndex
                          ? 'bg-slate-900 w-8 md:w-10 h-2'
                          : 'bg-slate-300 hover:bg-slate-500 w-2 h-2'
                      }`}
                      aria-label={`Ir a tarjeta ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}