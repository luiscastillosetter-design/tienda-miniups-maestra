'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { siteConfig } from '@/config/site';

export default function CartDrawer() {
  const router = useRouter();
  const { items, isCartOpen, toggleCart, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 50; 
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    toggleCart();
    router.push('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">Tu Carrito ({items.reduce((acc, i) => acc + i.quantity, 0)})</h2>
          </div>
          <button 
            onClick={toggleCart} 
            aria-label="Cerrar carrito" 
            className="p-1.5 text-gray-400 hover:text-slate-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de incentivo de envío gratis */}
        <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 text-xs text-orange-800 font-medium">
          {remaining > 0 ? (
            <p>¡Agrega <span className="font-bold">{siteConfig.currencySymbol}{remaining.toFixed(2)}</span> más para obtener envío gratis!</p>
          ) : (
            <p className="font-bold text-emerald-700">🎉 ¡Felicitaciones! Calificas para envío gratis.</p>
          )}
          <div className="w-full bg-orange-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-orange-500 h-full transition-all duration-300 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-medium text-slate-800">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500 mt-1">Explora nuestro catálogo y descubre productos increíbles.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center border-b border-gray-100 pb-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-sm font-extrabold text-orange-500 mt-0.5">
                        {siteConfig.currencySymbol}{item.price}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-gray-200 transition-colors cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-gray-200 transition-colors cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: subtotal y checkout */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{siteConfig.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Envío</span>
              <span className="font-medium text-emerald-600">Calculado en el checkout</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-base font-bold text-slate-900">
              <span>Total Final</span>
              <span className="text-orange-500 text-xl">{siteConfig.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full py-4 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer text-base"
          >
            Proceder al Pago
          </button>
        </div>
      </div>
    </>
  );
}