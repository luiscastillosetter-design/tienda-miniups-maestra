'use client';

import { useState, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { logBannerSizes } from '@/components/HeroCarousel';

export const defaultOffers: any[] = [];

function filterValidAdminOffers(rawOffers: any[]): any[] {
  if (!Array.isArray(rawOffers)) return [];
  return rawOffers.filter((o) => {
    const dImg = String(o?.desktopImg || '').trim();
    const mImg = String(o?.mobileImg || '').trim();
    return Boolean(dImg || mImg);
  });
}

export function OffersCarousel() {
  const autoplayOptions = { delay: 6000, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [offers, setOffers] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('store_offers');
        if (saved) {
          const parsed = filterValidAdminOffers(JSON.parse(saved));
          if (parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });

  useEffect(() => {
    fetch(`/api/store?key=store_offers`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) {
          const cleanOffers = filterValidAdminOffers(json.data);
          setOffers(cleanOffers);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('store_offers', JSON.stringify(cleanOffers));
            } catch (_) {}
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.reInit();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, offers.length]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (offers.length === 0) return;
    const t = setTimeout(() => {
      logBannerSizes('Carrusel de ofertas (2 divisiones)', wrapperRef.current, [
        { label: 'Móvil', width: 900, height: 760 },
        { label: 'Tablet', width: 1100, height: 760 },
        { label: 'Escritorio (2 columnas)', width: 1200, height: 800 },
      ]);
    }, 900);
    return () => clearTimeout(t);
  }, [offers.length]);

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

      <div ref={wrapperRef} className="w-full relative rounded-2xl md:rounded-3xl">
        <div ref={emblaRef} className="overflow-hidden w-full">
          <div className="flex w-full md:-mx-1.5 md:w-[calc(100%+0.75rem)]">
            {offers.map((offer, idx) => {
              const dImg = offer.desktopImg || offer.mobileImg || '';
              const mImg = offer.mobileImg || offer.desktopImg || '';

              return (
                <div
                  key={offer.id || idx}
                  className={`flex-[0_0_100%] ${offers.length > 1 ? 'md:flex-[0_0_50%]' : ''} min-w-0 md:px-1.5 pt-2 pb-4`}
                >
                <div
                  data-banner-card
                  className="w-full rounded-2xl md:rounded-3xl relative aspect-[900/760] md:aspect-[3/2] py-10 pb-14 md:py-10 md:pb-14 bg-slate-950 text-white flex flex-col justify-center items-start overflow-hidden hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl transition-all duration-300 ease-out cursor-pointer"
                >
                  {dImg && (
                    <img
                      src={dImg}
                      alt={offer.title || 'Oferta'}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
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
                      <h3 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl font-black leading-tight drop-shadow-md">
                        {offer.title}
                      </h3>
                      {offer.desc && (
                        <p className="text-xs sm:text-sm md:text-sm lg:text-base text-white/90 font-medium leading-relaxed drop-shadow-md max-w-xl">
                          {offer.desc}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botón CTA esquina inferior izquierda */}
                  {offer.showBtn !== false && (
                    <div className="absolute bottom-6 left-6 md:bottom-8 md:left-12 z-20 pointer-events-auto">
                      <Link
                        href={offer.link || '/catalogo'}
                        className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs md:text-sm py-2.5 px-5 md:py-3.5 md:px-6 rounded-2xl shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 transition-all duration-300 ease-out active:scale-95 cursor-pointer group/btn"
                      >
                        <ShoppingBag className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                        <span>{offer.btnText || 'Aprovechar Oferta'}</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
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