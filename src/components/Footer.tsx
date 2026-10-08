import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto px-4 md:px-12 py-12 md:py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {/* Columna 1: Marca */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-xl font-black text-[#0B132B] mb-4">Importadora Todomax</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
            Importadora premium de tecnología y respaldo de energía. Calidad y confianza para tus dispositivos.
          </p>
        </div>

        {/* Columna 2: Enlaces */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Enlaces</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 font-semibold transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/catalogo" className="text-sm text-gray-500 hover:text-orange-500 font-semibold transition-colors">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/afiliados" className="text-sm text-gray-500 hover:text-orange-500 font-semibold transition-colors">
                Embajadores
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Contacto</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600 font-medium">+1 754 341 1559</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600 font-medium">contacto@todomax.com</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Caracas, Venezuela</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} Importadora Todomax. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}