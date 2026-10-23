'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Menu, Search, ShoppingCart, X, Home, Cpu, Utensils, Car, Sparkles, Flame, DollarSign, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { siteConfig } from '@/config/site';
import { products } from '@/data/products';
import AuthModal from './AuthModal';

function HeaderContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

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
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
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
    { name: 'Hogar', icon: Home },
    { name: 'Tecnología', icon: Cpu },
    { name: 'Cocina', icon: Utensils },
    { name: 'Automóvil', icon: Car },
    { name: 'Belleza', icon: Sparkles },
    { name: 'Productos Virales', icon: Flame },
  ];

  const filteredProducts = searchQuery.trim() === ''
    ? []
    : products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-[100] w-full transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : 'translate-y-0'}`}>
        
        {/* Barra superior panorámica */}
        <div className="bg-slate-900 text-white text-[11px] md:text-xs py-2 px-4 md:px-12 border-b border-slate-800">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Truck className="w-4 h-4 text-orange-400" />
              <span>
                <strong>¡Envío GRATIS!</strong> en compras mayores a {siteConfig.currencySymbol}{siteConfig.shipping.freeShippingThreshold} por MRW, Zoom y Tealca
              </span>
            </div>
            <Link
              href="/afiliados"
              className="hidden md:flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-bold transition-all hover:scale-105"
            >
              <DollarSign className="w-4 h-4" />
              <span>Gana dinero con TodoMax</span>
            </Link>
          </div>
        </div>

        {/* Cabecera Principal Panorámica Flotante */}
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs px-4 md:px-12 lg:px-16 py-3">
          <div className="w-full flex items-center justify-between gap-6">
            
            {/* Logo y Menú */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 text-slate-700 hover:text-orange-500 rounded-xl hover:bg-slate-50 transition-all cursor-pointer hover:scale-105"
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/" className="flex items-center transition-transform hover:scale-105">
                <Image
                  src="/logo-todomax.png"
                  alt={siteConfig.storeName}
                  width={160}
                  height={45}
                  priority
                  className="w-32 md:w-44 h-auto object-contain"
                />
              </Link>
            </div>

            {/* Buscador Panorámico en PC */}
            {showSearch && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
                <div className="w-full flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-full px-5 py-2.5 focus-within:border-orange-500 focus-within:bg-white focus-within:shadow-md transition-all">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar en TodoMax: freidoras, mini UPS, aspiradoras, belleza..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder-gray-400 font-medium"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {searchQuery.trim() !== '' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 max-h-96 overflow-y-auto z-50 animate-in fade-in">
                    {filteredProducts.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No se encontraron productos.</p>
                    ) : (
                      filteredProducts.map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex items-center gap-4 p-2.5 hover:bg-slate-50 rounded-xl transition-all group"
                        >
                          <img src={p.images[0]} alt={p.title} className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-orange-500">{p.title}</p>
                            <p className="text-xs font-black text-orange-500">{siteConfig.currencySymbol}{p.price.toFixed(2)}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Acciones Derecha */}
            <div className="flex items-center gap-3">
              <Link
                href="/afiliados"
                className="md:hidden flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-black"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Afiliados</span>
              </Link>

              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-orange-500 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Mi Cuenta
              </button>

              <button
                onClick={toggleCart}
                className="relative p-3 bg-slate-900 hover:bg-orange-500 text-white rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
                aria-label="Abrir carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white shadow-xs">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Buscador Móvil */}
        {showSearch && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2.5">
            <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-full px-3.5 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en TodoMax..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-xs text-slate-800 placeholder-gray-400 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchQuery.trim() !== '' && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 max-h-60 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">No hay productos.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-left"
                    >
                      <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-contain rounded bg-slate-50 p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.title}</p>
                        <p className="text-xs font-black text-orange-500">{siteConfig.currencySymbol}{p.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Menú Desplegable */}
        {isMobileMenuOpen && (
          <div className="bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-2xl p-6 md:px-12 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-black uppercase text-orange-500 tracking-wider">Categorías Multiproductos</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={`/catalogo?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-xs font-bold text-slate-700 transition-all hover:scale-105 hover:shadow-md"
                  >
                    <Icon className="w-5 h-5 text-orange-500" />
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/catalogo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-800 hover:text-orange-500"
              >
                📦 Ver Catálogo Completo
              </Link>
              <Link
                href="/afiliados"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-black text-orange-500 hover:text-orange-600"
              >
                🤝 Programa de Afiliados (Gana Dinero)
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsAuthOpen(true); }}
                className="text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                👤 Mi Cuenta / Registrarse
              </button>
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<div className="h-24 w-full bg-white" />}>
      <HeaderContent />
    </Suspense>
  );
}