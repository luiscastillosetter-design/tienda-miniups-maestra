# Memoria Técnica del Proyecto - TodoMax E-Commerce

## Estado Actual
- Proyecto: E-commerce multiproducto Next.js 16 (App Router) + Redis + Tailwind CSS.
- Rendimiento y Banners: Optimización completada. Imágenes calibradas en Full HD (WebP @ 82%) para evitar saturación de memoria en el navegador y acelerar la carga en 0ms.
- Unificación Visual: El banner de catálogo ahora opera bajo Embla Carousel, con deslizamiento táctil idéntico a HeroCarousel y OffersCarousel, puntos indicadores sincronizados y soporte para múltiples diapositivas por categoría.
- Proceso de Compra: Apertura de WhatsApp ajustada con redirección directa (sin bloqueos en Safari móvil ni Chrome) y topes de stock verificados desde la primera adición al carrito.
- Red y Base de Datos: Sondeos en bucle restringidos a sesiones administrativas activas y eliminación de peticiones redundantes en navegación interna.

## Tareas Completadas
1. [COMPLETADO] Unificación del banner de catálogo con Embla Carousel y corrección de handleSaveCatBanner en Admin.
2. [COMPLETADO] Optimización multimedia (Full HD WebP 0.82) y lectura síncrona en HeroCarousel y OffersCarousel.
3. [COMPLETADO] Ajuste de redirección de WhatsApp en Checkout y blindaje de stock en cartStore.
4. [COMPLETADO] Eliminación de polling no autenticado, supresión de re-fetch en Header y corrección de enlaces en API de afiliados.