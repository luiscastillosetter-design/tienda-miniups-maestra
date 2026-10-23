'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function OffersCarousel() {
  const promoOffers = [
    {
      id: 1,
      tag: 'COMBO AHORRO',
      title: 'Aspiradora Auto + Mini UPS',
      desc: 'Respaldo eléctrico ininterrumpido para tu hogar y limpieza total para tu vehículo con precio especial de combo.',
      discount: '30% OFF',
      link: '/product/combo-hogar-inteligente',
      gradient: 'from-slate-900 via-slate-800 to-orange-950',
    },
    {
      id: 2,
      tag: 'ENVÍO GRATIS',
      title: 'Freidora de Aire 6L Familiar',
      desc: 'Cocina saludable sin aceite para toda la familia. Llévala hoy con flete cubierto por TodoMax a cualquier ciudad.',
      discount: 'ENVÍO $0',
      link: '/product/freidora-aire-digital',
      gradient: 'from-orange-600 via-orange-500 to-amber-600',
    },
    {
      id: 3,
      tag: 'PRODUCTO VIRAL',
      title: 'Proyector Galaxia LED',
      desc: 'El proyector más vendido de TikTok. Parlante bluetooth y efectos espaciales inmersivos para cualquier espacio.',
      discount: 'TOP VENTAS',
      link: '/product/proyector-galaxia-led',
      gradient: 'from-indigo-950 via-slate-900 to-slate-900',
    },
  ];

  return (
    <div className="w-full py-6" id="ofertas">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-orange-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Oportunidades de la semana
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Promociones y Combos</h2>
        </div>
        <Link href="/catalogo" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 hover:translate-x-0.5 transition-transform">
          Ver todo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promoOffers.map((offer) => (
          <div
            key={offer.id}
            className={`bg-gradient-to-br ${offer.gradient} text-white rounded-3xl p-7 relative overflow-hidden flex flex-col justify-between shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/10 group`}
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-md text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  {offer.tag}
                </span>
                <span className="text-xs font-black text-emerald-300 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  {offer.discount}
                </span>
              </div>
              <h3 className="text-xl font-black group-hover:text-orange-300 transition-colors">{offer.title}</h3>
              <p className="text-xs text-white/80 font-medium leading-relaxed">{offer.desc}</p>
            </div>

            <div className="pt-6 relative z-10">
              <Link
                href={offer.link}
                className="w-full bg-white text-slate-900 hover:bg-orange-50 font-black text-xs py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <span>Aprovechar Oferta</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}