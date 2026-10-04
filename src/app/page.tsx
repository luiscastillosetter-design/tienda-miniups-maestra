'use client';

import Image from 'next/image';
import { siteConfig } from '@/config/site';

export default function Home() {
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

  // Productos de ejemplo (temporales)
  const products = [
    {
      id: 1,
      title: 'Semilla de Maíz Premium',
      price: '45.99',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Fertilizante Orgánico',
      price: '28.50',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Herramienta de Cultivo',
      price: '35.00',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 4,
      title: 'Pesticida Natural',
      price: '22.75',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - 60vh */}
      <section
        className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('${siteConfig.hero.backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Contenido del Hero */}
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight"
          >
            {siteConfig.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-100">
            {siteConfig.hero.subtitle}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT - Grid de Productos */}
      <main className="w-full px-4 py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Grid responsivo: 2 cols móvil, 3 tablet, 4 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Imagen cuadrada */}
                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Contenido de la tarjeta */}
                <div className="flex flex-col flex-1 p-3 md:p-4">
                  {/* Título */}
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2 line-clamp-2 flex-1">
                    {product.title}
                  </h3>

                  {/* Precio */}
                  <p className="text-lg md:text-xl font-bold mb-3" style={{ color: siteConfig.theme.primaryColor }}>
                    {siteConfig.currencySymbol}
                    {product.price}
                  </p>

                  {/* Botón de Compra */}
                  <button
                    onClick={() => handleBuy(product.title)}
                    style={{
                      backgroundColor: siteConfig.theme.primaryColor,
                      color: siteConfig.theme.buttonTextColor,
                    }}
                    className="w-full py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-opacity hover:opacity-90 duration-200 cursor-pointer"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
