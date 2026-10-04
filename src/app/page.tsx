'use client';

import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { products } from '@/data/products';
import { useState } from 'react';

const secondaryColor = '#172554';
const primaryColor = '#f97316';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* HEADER PREMIUM TODOMAX */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 md:py-4 max-w-7xl mx-auto w-full">
          {/* Logo Todomax */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-todomax.jpg"
              alt="Importadora Todomax"
              width={180}
              height={50}
              className="object-contain h-12 w-auto"
              priority
            />
          </Link>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link href="/" className="font-medium text-sm transition-colors" style={{ color: secondaryColor }}>
              Inicio
            </Link>
            <Link href="/#catalogo" className="font-medium text-sm transition-colors" style={{ color: secondaryColor }}>
              Catálogo
            </Link>
            <Link href="/afiliados" className="font-medium text-sm transition-colors" style={{ color: secondaryColor }}>
              Afiliados
            </Link>
          </nav>

          {/* Botón WhatsApp */}
          <button
            onClick={handleWhatsAppClick}
            className="ml-auto md:ml-4 p-2.5 rounded-lg text-white transition-all duration-300 hover:shadow-lg hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
            title="Contactar por WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.823 1.572 3.21 4.89 5.573 8.255 5.573 3.254 0 6.66-2.359 8.166-5.477 2.27-4.885.465-10.236-4.114-12.994a9.87 9.87 0 00-5.379-1.303zM12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z" />
            </svg>
          </button>

          {/* Menú Hamburguesa Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-2 p-2 rounded-lg transition-colors"
            style={{ color: secondaryColor }}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={2} />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth={2} />
              </svg>
            )}
          </button>
        </div>

        {/* Menú Mobile Desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col gap-4 px-4 py-4">
              <Link href="/" className="font-medium text-sm transition-colors" style={{ color: secondaryColor }} onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              <Link href="/#catalogo" className="font-medium text-sm transition-colors" style={{ color: secondaryColor }} onClick={() => setMobileMenuOpen(false)}>
                Catálogo
              </Link>
              <Link href="/afiliados" className="font-medium text-sm transition-colors" style={{ color: secondaryColor }} onClick={() => setMobileMenuOpen(false)}>
                Afiliados
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Espaciado para el header fijo */}
      <div className="h-16 md:h-16"></div>

      {/* HERO SECTION PREMIUM TODOMAX */}
      <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-white">
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight" style={{ color: secondaryColor }}>
            {siteConfig.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed mb-8">
            {siteConfig.hero.subtitle}
          </p>
          <Link
            href="/#catalogo"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 hover:-translate-y-1"
            style={{ backgroundColor: primaryColor }}
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

      {/* BARRA DE CATEGORÍAS PREMIUM */}
      <section id="catalogo" className="w-full bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap border transition-all duration-300 ${
                  selectedCategory === category
                    ? 'text-white shadow-md hover:shadow-lg'
                    : 'text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? primaryColor : 'transparent',
                  borderColor: selectedCategory === category ? primaryColor : undefined,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT - Grid de Productos Premium */}
      <main className="w-full px-4 py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Grid responsivo: 2 cols móvil, 3 tablet, 4 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div className="group flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 cursor-pointer h-full">
                  {/* Imagen */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-4 md:p-5">
                    <h3 className="text-sm md:text-base font-medium mb-3 line-clamp-2 flex-1" style={{ color: secondaryColor }}>
                      {product.title}
                    </h3>
                    <p className="text-lg md:text-xl font-bold mb-4" style={{ color: primaryColor }}>
                      {siteConfig.currencySymbol}{product.price}
                    </p>
                    <button
                      onClick={() => handleBuy(product.title)}
                      className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: primaryColor }}
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

      {/* Footer Premium Todomax */}
      <footer className="w-full border-t border-gray-100 py-12 px-4 mt-16" style={{ backgroundColor: secondaryColor }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white text-sm md:text-base font-light">© 2024 <span className="font-semibold">{siteConfig.storeName}</span>. Todos los derechos reservados.</p>
          <p className="text-gray-300 text-xs md:text-sm mt-3 font-light">Importadora Premium de Tecnología de Respaldo de Energía</p>
        </div>
      </footer>
    </div>
  );
}
