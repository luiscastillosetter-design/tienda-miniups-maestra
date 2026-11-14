'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+Do%C3%B1a+Grazia+Av+Los+Andes+Guanare';
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
    <section className="w-full bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Visítanos en nuestra tienda</h2>
          <p className="text-sm text-slate-500 mt-1">
            Mira los productos en persona, recibe asesoría y retira tu compra.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <p className="font-black text-slate-900">Centro Comercial Doña Grazia</p>
            <p className="text-sm text-slate-500">Av. Los Andes, Piso 1, Local 50</p>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Cómo llegar
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-slate-900">Horario de atención</p>
            <p className="text-sm text-slate-500">
              Lunes a viernes: 9:00 am a 5:00 pm · Sábados: 9:00 am a 12:00 pm
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <p className="font-black text-slate-900">{phone}</p>
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="relative min-h-[300px] bg-slate-100">
        <iframe
          title="Ubicación Centro Comercial Doña Grazia"
          src={MAPS_EMBED}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 left-3 bg-white text-slate-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md hover:bg-orange-50 transition-colors"
        >
          Abrir en Maps ↗
        </a>
      </div>
    </section>
  );
}
