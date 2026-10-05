'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Search, User, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { products } from '@/data/products';
import AuthModal from './AuthModal';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items, toggleCart } = useCartStore();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const filteredProducts = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-3 z-[100] w-full shadow-xs">
        {/* Izquierda: Menu hamburguesa móvil */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 text-slate-700 hover:text-slate-900 active:scale-95 transition-transform cursor-pointer flex items-center justify-center md:hidden"
          aria-label="Abrir menú"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Links de navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Inicio</Link>
          <Link href="/#productos" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Catálogo</Link>
          <Link href="/afiliados" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Embajadores</Link>
        </nav>

        {/* Centro: Logo responsivo */}
        <Link href="/" className="flex-shrink-0 md:static">
          <Image
            alt="Todomax"
            className="w-28 md:w-48 lg:w-56 h-auto object-contain"
            height={64}
            src="/logo-todomax.png"
            width={224}
            priority
          />
        </Link>

        {/* Derecha: Iconos e-commerce */}
        <div className="flex items-center gap-1 md:gap-3">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className="p-3 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-center transition-colors" 
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsAuthOpen(true)} 
            className="p-3 text-slate-700 hover:text-slate-900 cursor-pointer hidden sm:flex items-center justify-center transition-colors" 
            aria-label="Mi cuenta"
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toggleCart()} 
            className="relative p-3 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-center transition-colors" 
            aria-label="Carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Buscador Desplegable */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl p-4 z-[95]">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Escribe para buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent outline-none text-slate-800 text-base placeholder:text-gray-400"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-gray-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {searchQuery.trim() !== '' && (
              <div className="max-w-3xl mx-auto mt-3 max-h-60 overflow-y-auto space-y-1 border-t pt-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">No se encontraron productos.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded-md" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                        <p className="text-xs text-orange-500 font-bold">${p.price}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Menú desplegable móvil */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl flex flex-col p-5 gap-4 z-[90] md:hidden">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-slate-800 font-semibold text-lg py-3 border-b border-gray-50 flex items-center justify-between"
            >
              <span>Inicio</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link 
              href="/#productos" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-slate-800 font-semibold text-lg py-3 border-b border-gray-50 flex items-center justify-between"
            >
              <span>Catálogo</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); setIsAuthOpen(true); }} 
              className="text-slate-800 font-semibold text-lg py-3 border-b border-gray-50 flex items-center justify-between text-left cursor-pointer"
            >
              <span>Mi Cuenta / Registro</span>
              <User className="w-4 h-4 text-gray-400" />
            </button>
            <Link 
              href="/afiliados" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-slate-800 font-semibold text-lg py-3 flex items-center justify-between"
            >
              <span>Embajadores</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}