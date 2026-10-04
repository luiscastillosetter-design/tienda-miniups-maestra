'use client';

import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { products } from '@/data/products';
import { useState } from 'react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Función para manejar el evento de compra y redirigir a WhatsApp
  const handleBuy = (productName: string) => {
    // Leer la cookie store_ref
    let storeRef = 'Ninguno';
    
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'store_ref') {
          storeRef = decodeURIComponent(value);
          break;
        }
      }
    }

    // Construir el mensaje dinámico usando siteConfig
    let message = siteConfig.whatsapp.checkoutMessage
      .replace('{product}', productName)
      .replace('{ref}', storeRef);

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Construir la URL de WhatsApp
    const whatsappURL = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodedMessage}`;

    // Redirigir a WhatsApp
    window.open(whatsappURL, '_blank');
  };

  // Abrir WhatsApp directo desde el header
  const handleWhatsAppClick = () => {
    const whatsappURL = `https://wa.me/${siteConfig.whatsapp.number}`;
    window.open(whatsappURL, '_blank');
  };

  // Categorías disponibles
  const categories = ['Todos', 'Tecnología / UPS'];

  // Filtrar productos según categoría seleccionada
  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER SUPERIOR FIJO - PREMIUM */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 py-3 md:py-4 max-w-7xl mx-auto w-full">
          {/* Logo / Nombre de tienda */}
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              {siteConfig.storeName}
            </h1>
          </div>

          {/* Icono de búsqueda simulado */}
          <div className="flex-1 flex justify-center mx-4 hidden sm:flex">
            <div className="w-full max-w-xs bg-gray-100/60 backdrop-blur rounded-full py-2.5 px-4 flex items-center gap-2 border border-gray-200/50 hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent outline-none text-sm text-gray-700 flex-1 placeholder-gray-500"
                disabled
              />
            </div>
          </div>

          {/* Botón WhatsApp flotante */}
          <button
            onClick={handleWhatsAppClick}
            style={{ backgroundColor: siteConfig.theme.primaryColor }}
            className="ml-2 md:ml-4 p-2.5 rounded-full text-white hover:shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-110"
            title="Contactar por WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.823 1.572 3.21 4.89 5.573 8.255 5.573 3.254 0 6.66-2.359 8.166-5.477 2.27-4.885.465-10.236-4.114-12.994a9.87 9.87 0 00-5.379-1.303zM12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Espaciado para el header fijo */}
      <div className="h-16 md:h-16"></div>

      {/* HERO SECTION - 60vh */}
      <section
        className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        style={{
          backgroundImage: `url('${siteConfig.hero.backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Overlay oscuro mejorado para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>

        {/* Contenido del Hero */}
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight tracking-tight">
            {siteConfig.hero.title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100 font-light leading-relaxed">
            {siteConfig.hero.subtitle}
          </p>
        </div>
      </section>

      {/* BARRA DE CATEGORÍAS */}
      <section className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor: selectedCategory === category ? siteConfig.theme.primaryColor : 'transparent',
                  color: selectedCategory === category ? siteConfig.theme.buttonTextColor : siteConfig.theme.textColor,
                  borderColor: selectedCategory === category ? siteConfig.theme.primaryColor : '#f0f0f0',
                }}
                className={`px-5 py-2.5 rounded-full font-medium text-sm md:text-base whitespace-nowrap border transition-all duration-300 hover:border-gray-300 ${
                  selectedCategory === category 
                    ? 'shadow-md hover:shadow-lg' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT - Grid de Productos */}
      <main className="w-full px-4 py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Grid responsivo: 2 cols móvil, 3 tablet, 4 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 hover:border-gray-200 cursor-pointer h-full"
                >
                  {/* Contenedor de imagen con badge */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  
                  {/* Badge de oferta/envío */}
                  {product.badge && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Contenido de la tarjeta */}
                <div className="flex flex-col flex-1 p-4 md:p-5 lg:p-6">
                  {/* Título */}
                  <h3 className="text-sm md:text-base font-medium text-gray-900 mb-3 line-clamp-3 flex-1 leading-snug tracking-tight">
                    {product.title}
                  </h3>

                  {/* Precio */}
                  <div className="mb-4">
                    <p className="text-xl md:text-2xl font-bold" style={{ color: siteConfig.theme.primaryColor }}>
                      {siteConfig.currencySymbol}
                      <span className="text-lg md:text-xl">{product.price}</span>
                    </p>
                  </div>

                  {/* Botón de Compra */}
                  <button
                    onClick={() => handleBuy(product.title)}
                    style={{
                      backgroundColor: siteConfig.theme.primaryColor,
                      color: siteConfig.theme.buttonTextColor,
                    }}
                    className="w-full py-3 md:py-3.5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer hover:shadow-lg hover:opacity-90 active:scale-95 transform"
                  >
                    Comprar
                  </button>
                </div>
              </div>
              </Link>
            ))}
          </div>

          {/* Mensaje si no hay productos */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-500 text-center text-lg font-light">No hay productos en esta categoría.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Premium */}
      <footer className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 py-8 md:py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-300 text-sm md:text-base font-light">© 2024 <span className="font-semibold">{siteConfig.storeName}</span>. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-xs md:text-sm mt-3 font-light">Tecnología de respaldo de energía de alta gama</p>
        </div>
      </footer>
    </div>
  );
}
