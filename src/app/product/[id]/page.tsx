'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/data/products';
import { siteConfig } from '@/config/site';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const product = getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);

  // Función para manejar compra por WhatsApp
  const handleBuyWhatsApp = () => {
    setIsLoadingWhatsApp(true);

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

    // Construir el mensaje dinámico
    let message = siteConfig.whatsapp.checkoutMessage
      .replace('{product}', product.title)
      .replace('{ref}', storeRef);

    // Codificar el mensaje
    const encodedMessage = encodeURIComponent(message);

    // URL de WhatsApp
    const whatsappURL = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodedMessage}`;

    // Redirigir
    window.open(whatsappURL, '_blank');
    setIsLoadingWhatsApp(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header con breadcrumb */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 py-3 md:py-4 max-w-7xl mx-auto w-full">
          <Link href="/">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight cursor-pointer hover:text-opacity-80 transition-opacity">
              {siteConfig.storeName}
            </h1>
          </Link>

          {/* Botón WhatsApp en header */}
          <button
            onClick={() => window.open(`https://wa.me/${siteConfig.whatsapp.number}`, '_blank')}
            style={{ backgroundColor: siteConfig.theme.primaryColor }}
            className="ml-4 p-2.5 rounded-full text-white hover:shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-110"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.823 1.572 3.21 4.89 5.573 8.255 5.573 3.254 0 6.66-2.359 8.166-5.477 2.27-4.885.465-10.236-4.114-12.994a9.87 9.87 0 00-5.379-1.303zM12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Espaciado para header fijo */}
      <div className="h-16 md:h-16"></div>

      {/* MAIN CONTENT */}
      <main className="w-full px-4 py-8 md:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* GALERÍA DE IMÁGENES */}
            <div className="flex flex-col gap-4">
              {/* Imagen Principal */}
              <div className="relative w-full aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 shadow-lg">
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Miniaturas */}
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-green-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* INFORMACIÓN COMERCIAL */}
            <div className="flex flex-col gap-6">
              {/* Badge */}
              {product.badge && (
                <div className="inline-block w-fit">
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Título */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {product.title}
                </h1>
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-2">
                <p className="text-5xl md:text-6xl font-bold" style={{ color: siteConfig.theme.primaryColor }}>
                  {siteConfig.currencySymbol}
                  {product.price}
                </p>
              </div>

              {/* Descripción */}
              <div className="py-6 border-y border-gray-200">
                <p className="text-lg text-gray-700 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {/* Características */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Características principales:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" style={{ color: siteConfig.theme.primaryColor }} viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Métodos de Pago */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de pago disponibles:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" style={{ color: siteConfig.theme.primaryColor }} viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Compra Grande */}
              <button
                onClick={handleBuyWhatsApp}
                disabled={isLoadingWhatsApp}
                style={{
                  backgroundColor: siteConfig.theme.primaryColor,
                  color: siteConfig.theme.buttonTextColor,
                }}
                className="w-full py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 cursor-pointer hover:shadow-2xl hover:opacity-90 active:scale-95 transform disabled:opacity-50"
              >
                {isLoadingWhatsApp ? 'Abriendo WhatsApp...' : '💬 Comprar por WhatsApp'}
              </button>

              {/* Link de volver */}
              <Link
                href="/"
                className="text-center py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                ← Volver al catálogo
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 py-8 md:py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-300 text-sm md:text-base font-light">
            © 2024 <span className="font-semibold">{siteConfig.storeName}</span>. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-xs md:text-sm mt-3 font-light">Tecnología de respaldo de energía de alta gama</p>
        </div>
      </footer>
    </div>
  );
}