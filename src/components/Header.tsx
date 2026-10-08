'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Menu, Search, Bell, ShoppingCart, X, LayoutGrid, Smartphone, Headphones, Home as HomeIcon, Gamepad2, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { siteConfig } from '@/config/site';
import { products } from '@/data/products';
import AuthModal from './AuthModal';

function HeaderContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isCartOpen } = useCartStore();
  const { items, toggleCart } = useCartStore();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // EL BUSCADOR SOLO APARECE EN INICIO Y CATÁLOGO
  const showSearch = pathname === '/' || pathname === '/catalogo';

  useEffect(() => {
    if (searchParams?.get('auth') === 'register') {
      setIsAuthOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const categories = [
    { id: 0, name: 'Todos', icon: LayoutGrid },
    { id: 1, name: 'Phones', icon: Smartphone },
    { id: 2, name: 'Audio', icon: Headphones },
    { id: 3, name: 'Smart Home', icon: HomeIcon },
    { id: 4, name: 'Gaming', icon: Gamepad2 },
    { id: 5, name: 'Gadgets', icon: Zap },
  ];

  const filteredProducts = searchQuery.trim() === ''
    ? []
    : products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleNotificationClick = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Ocultar por completo el header público si estamos dentro del admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className={`fixed top-3 left-0 right-0 z-[100] w-full pointer-events-none transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-[250%]' : 'translate-y-0'}`}>
        <div className="flex items-center justify-between px-3 md:px-6 w-full relative">
          
          {/* Menú Hamburguesa */}
          <div className="flex items-center justify-start pointer-events-auto">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 bg-white/95 backdrop-blur-md text-slate-800 hover:text-orange-500 active:scale-95 transition-all cursor-pointer flex items-center justify-center rounded-full shadow-md border border-gray-100"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>

          {/* Logo Central */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
            <Link className="flex-shrink-0 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-gray-100 hover:scale-105 transition-transform" href="/">
              <Image alt="Todomax" className="w-28 md:w-44 h-auto object-contain" height={50} priority src="/logo-todomax.png" width={180}/>
            </Link>
          </div>

          {/* Iconos de Notificaciones y Carrito */}
          <div className="flex items-center justify-end gap-2 pointer-events-auto w-24">
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="p-2.5 bg-white/95 backdrop-blur-md text-slate-800 hover:text-orange-500 cursor-pointer flex items-center justify-center transition-all rounded-full shadow-md border border-gray-100"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5"/>
              </button>
              {showNotification && (
                <div className="absolute right-0 mt-3 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shadow-2xl z-50">
                  No hay notificaciones nuevas
                </div>
              )}
            </div>

            <button
              onClick={() => toggleCart()}
              className="relative p-2.5 bg-white/95 backdrop-blur-md text-slate-800 hover:text-orange-500 cursor-pointer flex items-center justify-center transition-all rounded-full shadow-md border border-gray-100"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5"/>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menú Desplegable */}
        {isMobileMenuOpen && (
          <div className="absolute top-[120%] left-3 w-[calc(100%-1.5rem)] md:w-80 bg-white/98 backdrop-blur-2xl shadow-2xl flex flex-col p-6 gap-4 z-[90] rounded-3xl border border-gray-100 pointer-events-auto">
            <button
              onClick={() => { setIsMobileMenuOpen(false); setIsAuthOpen(true); }}
              className="text-slate-900 font-bold text-base py-2 text-left cursor-pointer hover:text-orange-500 transition-colors"
            >
              Mi Cuenta / Registro
            </button>
            <Link href="/afiliados" onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-900 font-bold text-base py-2 hover:text-orange-500 transition-colors"
            >
              Afiliados
            </Link>
            <Link href="/catalogo" onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-900 font-bold text-base py-2 hover:text-orange-500 transition-colors"
            >
              Catálogo
            </Link>
            <div className="border-t border-gray-100 pt-4 mt-2">
              <p className="text-xs text-orange-500 font-black mb-3 uppercase tracking-wider">Categorías</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  const isAll = cat.id === 0;
                  return (
                    <Link key={cat.id} href={isAll ? '/catalogo' : `/catalogo?category=${cat.name}`} onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 text-slate-700 hover:text-orange-500 transition-colors text-xs font-bold group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Buscador Inmóvil (Solo visible en Home y Catálogo) */}
      {showSearch && !isCartOpen && (
        <div className="fixed top-[72px] md:top-[85px] left-0 right-0 z-[80] pointer-events-none px-4">
          <div className="w-full md:w-1/2 mx-auto pointer-events-auto relative">
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full px-5 py-2.5 md:py-3 border border-gray-100">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-orange-500"/>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-gray-400 font-semibold"
              />
            </div>

            {searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/98 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-[98]">
                <div className="p-2 space-y-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 p-4 text-center font-medium">No se encontraron productos.</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Image alt={p.title} className="w-10 h-10 object-cover rounded-lg shadow-sm" height={40} src={p.images[0]} width={40}/>
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-orange-500 font-extrabold">{siteConfig.currencySymbol}{p.price}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<div className="h-16 w-full" />}>
      <HeaderContent/>
    </Suspense>
  );
}