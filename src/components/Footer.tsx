import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto px-4 md:px-12 py-12 md:py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Columna 1: Marca */}
        <div className="flex flex-col items-start text-left md:col-span-1">
          <h3 className="text-xl font-black text-slate-900 mb-4">{siteConfig.storeName}</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm mb-4">
            {siteConfig.description}
          </p>
          <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            Compra 100% Segura
          </div>
        </div>

        {/* Columna 2: Tienda */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Tienda</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 font-semibold transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/catalogo" className="text-sm text-gray-500 hover:text-orange-500 font-semibold transition-colors">
                Catálogo Completo
              </Link>
            </li>
            <li>
              <Link href="/#ofertas" className="text-sm text-gray-500 hover:text-orange-500 font-semibold transition-colors">
                Promociones y Combos
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Afiliados y Envíos */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Servicios</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/afiliados" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                Gana dinero con {siteConfig.storeName}
              </Link>
            </li>
            <li className="flex items-start gap-2 mt-4 text-sm text-gray-500 font-medium">
              <Truck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>Envíos seguros por: <br/><span className="font-bold text-slate-700">{siteConfig.shipping.companies.slice(0, 3).join(', ')}</span></span>
            </li>
          </ul>
        </div>

        {/* Columna 4: Contacto */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Contacto</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600 font-medium">{siteConfig.whatsappNumber}</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600 font-medium">{siteConfig.email}</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600 font-medium">{siteConfig.location}</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} {siteConfig.storeName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}