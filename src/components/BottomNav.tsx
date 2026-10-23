'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Grid3x3, ShoppingBag, DollarSign, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import AuthModal from './AuthModal';

export default function BottomNav() {
  const { items, toggleCart } = useCartStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-3xl py-2 px-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Inicio */}
          <Link
            href="/"
            onClick={handleHomeClick}
            className="flex flex-col items-center gap-1 w-14 text-slate-600 hover:text-orange-500 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold">Inicio</span>
          </Link>

          {/* Catálogo */}
          <Link
            href="/catalogo"
            className="flex flex-col items-center gap-1 w-14 text-slate-600 hover:text-orange-500 transition-colors"
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-[9px] font-bold">Catálogo</span>
          </Link>

          {/* Carrito Flotante Central */}
          <button
            onClick={() => toggleCart()}
            className="flex flex-col items-center justify-center -mt-6 relative cursor-pointer group"
            aria-label="Ver Carrito"
          >
            <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 group-active:scale-95 transition-transform border-4 border-white">
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold text-slate-700 mt-1">Carrito</span>
          </button>

          {/* Afiliados (Gana Dinero) */}
          <Link
            href="/afiliados"
            className="flex flex-col items-center gap-1 w-14 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[9px] font-black">Afiliados</span>
          </Link>

          {/* Mi Cuenta */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex flex-col items-center gap-1 w-14 text-slate-600 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold">Cuenta</span>
          </button>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}