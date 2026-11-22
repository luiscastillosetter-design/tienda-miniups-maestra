'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, MessageCircle, Navigation, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/config/site';

const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+Do%C3%B1a+Grazia,+Av.+Los+Andes,+Barinas,+Venezuela';
const MAPS_EMBED =
  'https://www.google.com/maps?q=Centro+Comercial+Do%C3%B1a+Grazia,+Av.+Los+Andes,+Guanare&output=embed';

export default function StoreLocationSection() {
  const [phone, setPhone] = useState(siteConfig.whatsappNumber);

  useEffect(() => {
    fetch(`/api/store?key=store_site_config`)
      .then((res) => res.json())
      .then((json) => {
        const cfg = json?.data;
        if (!cfg) return;
        const active = Array.isArray(cfg.whatsappNumbers)
          ? cfg.whatsappNumbers.find((w: any) => w?.activo && String(w?.numero || '').replace(/\D/g, ''))
          : null;
        setPhone(active ? String(active.numero) : cfg.whatsappNumber || siteConfig.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  const digits = String(phone || '').replace(/\D/g, '');

  return (
    <section className="group/loc w-full bg-gradient-to-br from-white via-white to-orange-50/40 border border-gray-200/80 rounded-2xl md:rounded-3xl shadow-xs hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
            </span>
            Tienda física abierta
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Visítanos en nuestra tienda</h2>
          <p className="text-sm text-slate-500 mt-1">
            Mira los productos en persona, recibe asesoría y retira tu compra.
          </p>
        </div>

        <div className="group/item flex items-start gap-3 p-3 -m-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0 transition-all duration-300 group-hover/item:bg-orange-500 group-hover/item:text-white group-hover/item:rotate-6 group-hover/item:scale-105">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <p className="font-black text-slate-900">Centro Comercial Doña Grazia</p>
            <p className="text-sm text-slate-500">Av. Los Andes, Piso 1, Local 50</p>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group/go inline-flex items-center gap-1.5 bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              Cómo llegar
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/go:translate-x-0.5 group-hover/go:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="group/item flex items-start gap-3 p-3 -m-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0 transition-all duration-300 group-hover/item:bg-orange-500 group-hover/item:text-white group-hover/item:rotate-6 group-hover/item:scale-105">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-slate-900">Horario de atención</p>
            <p className="text-sm text-slate-500">
              Lunes a viernes: 9:00 am a 5:00 pm · Sábados: 9:00 am a 12:00 pm
            </p>
          </div>
        </div>

        <div className="group/item flex items-start gap-3 p-3 -m-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0 transition-all duration-300 group-hover/item:bg-orange-500 group-hover/item:text-white group-hover/item:rotate-6 group-hover/item:scale-105">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <p className="font-black text-slate-900">{phone}</p>
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-600/30 active:scale-95"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="relative min-h-[300px] bg-slate-100 m-3 md:m-4 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner">
        <iframe
          title="Ubicación Centro Comercial Doña Grazia"
          src={MAPS_EMBED}
          className="absolute inset-0 w-full h-full border-0 grayscale-[35%] contrast-[1.05] transition-all duration-700 group-hover/loc:grayscale-0 group-hover/loc:scale-[1.02]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent opacity-0 group-hover/loc:opacity-100 transition-opacity duration-500" />
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur text-slate-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md ring-1 ring-black/5 hover:bg-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          Abrir en Maps
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-md ring-1 ring-black/5">
          <MapPin className="w-4 h-4 text-orange-500" />
          <div className="leading-tight">
            <p className="text-[11px] font-black text-slate-900">Doña Grazia · Local 50</p>
            <p className="text-[10px] font-semibold text-slate-500">Barinas, Estado Barinas</p>
          </div>
        </div>
      </div>
    </section>
  );
}
