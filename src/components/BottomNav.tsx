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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-200 py-2 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* Inicio */}
          <Link
            href="/"
            onClick={handleHomeClick}
            className="flex flex-col items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Inicio</span>
          </Link>

          {/* Catálogo */}
          <Link
            href="/catalogo"
            className="flex flex-col items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors"
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-[10px] font-bold">Catálogo</span>
          </Link>

          {/* Carrito Flotante */}
          <button
            onClick={() => toggleCart()}
            className="flex flex-col items-center justify-center -mt-5 relative cursor-pointer"
            aria-label="Ver Carrito"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-transform">
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-0.5">Carrito</span>
          </button>

          {/* Afiliados (Gana Dinero) */}
          <Link
            href="/afiliados"
            className="flex flex-col items-center gap-1 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-black">Afiliados</span>
          </Link>

          {/* Mi Cuenta */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Cuenta</span>
          </button>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}