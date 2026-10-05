import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna 1: Logo y descripción */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            {siteConfig.storeName}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Importadora premium de tecnología de respaldo de energía. Calidad y confianza para tus dispositivos.
          </p>
        </div>

        {/* Columna 2: Enlaces */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Enlaces</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/#productos" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/afiliados" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                Embajadores
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Contacto</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2.5 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{siteConfig.whatsapp?.number || "+58 412 1234567"}</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>contacto@todomax.com</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>Caracas, Venezuela</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} {siteConfig.storeName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}