'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Grid3x3, ShoppingBag, Zap, User } from 'lucide-react';
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 py-2.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto flex items-center justify-around">
          {/* Home */}
          <Link
            href="/"
            onClick={handleHomeClick}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-orange-500 transition-colors active:scale-95 cursor-pointer"
            aria-label="Inicio"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Inicio</span>
          </Link>

          {/* Categorías */}
          <Link
            href="/catalogo"
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-orange-500 transition-colors active:scale-95 cursor-pointer"
            aria-label="Categorías"
          >
            <Grid3x3 className="w-6 h-6" />
            <span className="text-xs font-medium">Categorías</span>
          </Link>

          {/* Tienda/Shop - Centro */}
          <button
            onClick={() => toggleCart()}
            className="flex flex-col items-center justify-center -mt-6 mb-1 relative cursor-pointer"
            aria-label="Tienda"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95">
                <ShoppingBag className="w-7 h-7 text-white" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Ofertas */}
          <Link
            href="/#ofertas"
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-orange-500 transition-colors active:scale-95 cursor-pointer"
            aria-label="Ofertas"
          >
            <Zap className="w-6 h-6" />
            <span className="text-xs font-medium">Ofertas</span>
          </Link>

          {/* Cuenta */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-orange-500 transition-colors active:scale-95 relative cursor-pointer"
            aria-label="Mi Cuenta"
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Cuenta</span>
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}