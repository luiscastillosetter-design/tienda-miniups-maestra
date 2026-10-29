'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const defaultOffers = [
  {
    id: 1,
    tag: 'COMBO AHORRO',
    title: 'Aspiradora Auto + Mini UPS',
    desc: 'Respaldo eléctrico ininterrumpido para tu hogar y limpieza total para tu vehículo.',
    discount: '30% OFF',
    link: '/product/combo-hogar-inteligente',
    desktopImg: '/ofertas/oferta1.png',
    mobileImg: '/ofertas/oferta1-mobile.png',
    gradient: 'from-slate-900 via-slate-800 to-orange-950',
  },
  {
    id: 2,
    tag: 'ENVÍO GRATIS',
    title: 'Freidora de Aire 6L Familiar',
    desc: 'Cocina saludable sin aceite. Llévala hoy con flete cubierto por TodoMax a cualquier ciudad.',
    discount: 'ENVÍO $0',
    link: '/product/freidora-aire-digital',
    desktopImg: '/ofertas/oferta2.png',
    mobileImg: '/ofertas/oferta2-mobile.png',
    gradient: 'from-orange-600 via-orange-500 to-amber-600',
  },
  {
    id: 3,
    tag: 'PRODUCTO VIRAL',
    title: 'Proyector Galaxia LED',
    desc: 'El proyector más vendido de TikTok. Parlante bluetooth y efectos espaciales inmersivos.',
    discount: 'TOP VENTAS',
    link: '/product/proyector-galaxia-led',
    desktopImg: '/ofertas/oferta3.png',
    mobileImg: '/ofertas/oferta3-mobile.png',
    gradient: 'from-indigo-950 via-slate-900 to-slate-900',
  },
];

export function OffersCarousel() {
  const autoplayOptions = { delay: 6000, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offers, setOffers] = useState<any[]>(defaultOffers);

  useEffect(() => {
    const loadOffers = async () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('store_offers');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setOffers(parsed);
          } catch (error) {}
        }
      }

      try {
        const res = await fetch(`/api/store?key=store_offers&t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setOffers(json.data);
            localStorage.setItem('store_offers', JSON.stringify(json.data));
          }
        }
      } catch (e) {}
    };

    loadOffers();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className="w-full py-4 md:py-6" id="ofertas">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <span className="text-orange-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Oportunidades de la semana
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Promociones y Combos</h2>
        </div>
      </div>

      <div className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50">
        <div ref={emblaRef} className="overflow-hidden w-full">
          <div className="flex w-full">
            {offers.map((offer) => {
              const dImg = offer.desktopImg || '';
              const mImg = offer.mobileImg || dImg;

              return (
                <div
                  key={offer.id}
                  className={`flex-[0_0_100%] min-w-0 relative h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] bg-gradient-to-r ${offer.gradient || 'from-slate-900 to-slate-800'} text-white flex flex-col justify-center items-start overflow-hidden group`}
                >
                  {/* Imágenes de Fondo Panorámicas SIN VELO OSCURO */}
                  {dImg && (
                    <img
                      src={dImg}
                      alt={offer.title || 'Oferta'}
                      className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  {mImg && (
                    <img
                      src={mImg}
                      alt={offer.title || 'Oferta'}
                      className="block md:hidden absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Enlace clickeable en toda la tarjeta */}
                  <Link href={offer.link || '/catalogo'} className="absolute inset-0 z-10 cursor-pointer" aria-label={offer.title || 'Oferta'} />

                  {/* Renderizar textos SOLO si se escribió un título explícito en el Admin */}
                  {offer.title && (
                    <div className="px-6 md:px-16 space-y-3 relative z-20 w-full max-w-3xl pointer-events-none mt-32 md:mt-48">
                      <div className="flex items-center gap-3">
                        {offer.tag && (
                          <span className="bg-white/20 backdrop-blur-md text-white font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            {offer.tag}
                          </span>
                        )}
                        {offer.discount && (
                          <span className="text-xs font-black text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-400/30">
                            {offer.discount}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-5xl font-black drop-shadow-md">{offer.title}</h3>
                      {offer.desc && (
                        <p className="text-xs md:text-lg text-white/90 font-medium leading-relaxed drop-shadow-md max-w-xl">{offer.desc}</p>
                      )}
                      
                      <div className="pt-2 pointer-events-auto">
                        <Link
                          href={offer.link || '/catalogo'}
                          className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 ease-out active:scale-95 cursor-pointer group/btn"
                        >
                          <span>Aprovechar Oferta</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Puntos de Navegación */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === selectedIndex ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Ir a oferta ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}