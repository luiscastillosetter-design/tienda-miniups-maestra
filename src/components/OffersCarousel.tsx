'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

// Exportación requerida por el panel administrativo (/admin/page.tsx)
export const defaultOffers: any[] = [];

function filterValidAdminOffers(rawOffers: any[]): any[] {
  if (!Array.isArray(rawOffers)) return [];
  return rawOffers.filter((o) => {
    const dImg = String(o?.desktopImg || '').trim();
    const mImg = String(o?.mobileImg || '').trim();
    const isLegacyFakePath =
      dImg.startsWith('/ofertas/') ||
      mImg.startsWith('/ofertas/');
    const hasRealImage = Boolean(dImg || mImg);
    return hasRealImage && !isLegacyFakePath;
  });
}

export function OffersCarousel() {
  const autoplayOptions = { delay: 6000, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Inicialización síncrona inmediata con localStorage para carga instantánea en 0ms
  const [offers, setOffers] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('store_offers');
        if (saved) {
          const parsed = filterValidAdminOffers(JSON.parse(saved));
          if (parsed.length > 0) return parsed;
        }
      } catch (error) {}
    }
    return [];
  });

  useEffect(() => {
    fetch(`/api/store?key=store_offers&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) {
          const cleanOffers = filterValidAdminOffers(json.data);
          if (cleanOffers.length > 0) {
            setOffers(cleanOffers);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('store_offers', JSON.stringify(cleanOffers));
              } catch (e) {}
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  if (offers.length === 0) {
    return null;
  }

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

      <div className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 bg-slate-950">
        <div ref={emblaRef} className="overflow-hidden w-full">
          <div className="flex w-full">
            {offers.map((offer, idx) => {
              const dImg = offer.desktopImg || offer.mobileImg || '';
              const mImg = offer.mobileImg || offer.desktopImg || '';

              return (
                <div
                  key={offer.id || idx}
                  className="flex-[0_0_100%] min-w-0 relative h-[38vh] md:h-[48vh] min-h-[280px] md:min-h-[380px] py-10 pb-14 md:py-14 md:pb-16 bg-slate-950 text-white flex flex-col justify-center items-start overflow-hidden group"
                >
                  {dImg && (
                    <img
                      src={dImg}
                      alt={offer.title || 'Oferta'}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  {mImg && (
                    <img
                      src={mImg}
                      alt={offer.title || 'Oferta'}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}

                  <Link
                    href={offer.link || '/catalogo'}
                    className="absolute inset-0 z-10 cursor-pointer"
                    aria-label={offer.title || 'Oferta'}
                  />

                  {offer.title && offer.title.trim() !== '' && (
                    <div className="px-6 sm:px-10 md:px-16 space-y-3 relative z-20 w-full max-w-3xl pointer-events-none my-auto">
                      <div className="flex flex-wrap items-center gap-2.5">
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
                      <h3 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight drop-shadow-md">
                        {offer.title}
                      </h3>
                      {offer.desc && (
                        <p className="text-xs sm:text-sm md:text-lg text-white/90 font-medium leading-relaxed drop-shadow-md max-w-xl">
                          {offer.desc}
                        </p>
                      )}

                      <div className="pt-2 pointer-events-auto">
                        <Link
                          href={offer.link || '/catalogo'}
                          className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs md:text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 ease-out active:scale-95 cursor-pointer group/btn"
                        >
                          <span>Aprovechar Oferta</span>
                          <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {offers.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === selectedIndex ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Ir a oferta ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}