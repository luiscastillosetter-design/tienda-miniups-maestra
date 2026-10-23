# ROADMAP TODOMAX E-COMMERCE & PLATAFORMA COMERCIAL AUTOMATIZADA

## Estado General del Proyecto
- **Cliente:** Importadora TodoMax (Presupuesto: $1,000 USD | Anticipo: $500 USD | Restante: $500 USD al entregar).
- **Arquitectura:** Next.js (App Router), React 19, Tailwind CSS, Zustand, Marca Blanca 100% parametrizada vía `src/config/site.ts`.
- **Estatus Técnico de Código:** 100% COMPLETADO (Fases 1 a 6 cerradas con éxito).

---

## Checkpoints Técnicos Completados (GEMINI)
- [x] **Fase 1: Base de Datos y Marca Blanca Multiproducto:**
  - `src/config/site.ts`: Identidad de Importadora Multiproductos, cuentas bancarias para Pago Móvil/Transferencia/Zelle/Binance, empresas de envío (MRW, Zoom, Tealca), umbral de envío gratis ($50) y roles de empleados.
  - `src/data/products.ts` y `src/services/productService.ts`: 6 categorías oficiales (Hogar, Tecnología, Cocina, Automóvil, Belleza, Productos Virales), costos unitarios, stock, comisiones de afiliados, textos publicitarios y placeholders SVG de marca que nunca fallan ni se cuelgan.
  - `src/app/layout.tsx` y `src/components/Footer.tsx`: Cero textos quemados de Mini UPS; garantías, métodos de pago y contacto sincronizados.

- [x] **Fase 2: Rediseño Dual (Móvil y PC Panorámico) y Conversión:**
  - `src/components/Header.tsx`: Cinta superior de envío gratis, acceso a «Gana dinero con TodoMax», buscador integrado y navegación de ancho panorámico.
  - `src/components/BottomNav.tsx`: Barra táctil inferior para celulares con accesos rápidos.
  - `src/components/HeroCarousel.tsx` y `src/components/OffersCarousel.tsx`: Carruseles amplios, sin encajonamiento estrecho en PC, con elevación de tarjetas independiente (`hover:-translate-y-2 hover:shadow-2xl`).
  - `src/app/page.tsx`: Estructura exacta solicitada: Hero con botón "Comprar Ahora" → Productos Más Vendidos con compra directa a caja sin registro → Categorías Multiproducto → Combos/Ofertas → Catálogo General → Bloque de Confianza (Garantías, Pagos, Envíos, +1,500 Clientes).
  - `src/app/catalogo/page.tsx`: Catálogo completo filtrable de borde a borde.
  - `src/app/product/[id]/page.tsx`: Ficha estilo MercadoLibre con galería amplia a la izquierda, bloque de compra e inventario a la derecha y carrusel inferior de remarketing.

- [x] **Fase 3: Checkout Automatizado sin Registro:**
  - `src/store/cartStore.ts`: Incorporada acción `clearCart()`.
  - `src/app/checkout/page.tsx`: Formulario directo sin forzar registro. Pide Cédula/RIF, Estado, Ciudad y Courier. Detección automática de envío gratis > $50. Selector interactivo de Pago Móvil, Zelle, Transferencia o USDT con botón "Copiar Datos". Carga obligatoria de número de referencia y comprobante. Guarda el pedido en `store_orders` con estado `Pendiente de verificación` y cálculo de utilidad real antes de abrir WhatsApp.

- [x] **Fase 4: Sistema de Afiliados y Asistente IA (Sofía):**
  - `src/app/afiliados/page.tsx`: Landing de registro con aceptación de condiciones (TodoMax cobra y despacha). Panel Privado con métricas automáticas (ventas pendientes, confirmadas, balance de comisión), generador de enlaces con `?ref=CODIGO`, Biblioteca de material publicitario con fotos, videos y textos listos para copiar, y Chat IA integrado con Sofía para solicitar kits en vivo.
  - `src/app/api/afiliados/route.ts`: Webhook estructurado para Meta / WhatsApp Business API con respuestas automáticas sobre el catálogo.

- [x] **Fase 5: Panel Administrativo Centralizado ERP/CRM (`/admin`):**
  - `src/app/admin/page.tsx`: Control de acceso por 3 Roles (`Super Admin`, `Logística y Pagos`, `Marketing y Afiliados`).
  - Módulo 1 (Pedidos): Validación de pago, descuento automático de stock en inventario, registro de guías de envío y botones de notificación por WhatsApp al cliente.
  - Módulo 2 (Inventario): Existencias, alertas rojas de stock bajo (≤ 5), costo unitario, márgenes y edición en vivo.
  - Módulo 3 (Afiliados): Estadísticas por embajador y liquidación de comisiones tras entrega.
  - Módulo 4 (Publicidad): Configuración de Meta Pixel y control de inversión publicitaria.
  - Módulo 5 (CRM): Directorio de clientes con historial de compra y botón de contacto.
  - Módulo 6 (Finanzas): Cálculo en tiempo real de facturación, costos, gasto publicitario, comisiones y utilidad neta con porcentaje de margen.

- [x] **Fase 6: Atribución Anti-Duplicados, Píxeles y Conector Sellibrí:**
  - `src/components/AffiliateTracker.tsx`: Detección limpia de Meta Ads, TikTok Ads, Google Ads vs. Afiliados (`ref`), inyección del Pixel de Meta y guardado de matriz de atribución.
  - `src/middleware.ts`: Cookies duraderas de 30 días (`todomax_ref` y `todomax_ad_channel`).
  - `src/app/api/sellibri/route.ts`: Endpoint Gateway listo para sincronizar despachos y stock con Sellibrí.

---

## Tareas Pendientes de Diseño Gráfico (Responsabilidad de Luis y Esposa)
*(El código ya está listo y usando los placeholders limpios de la marca; cuando estén los diseños solo se colocan los archivos con estos nombres exactos):*

- [ ] **Banners de Categorías (`public/categories/`):**
  - `hogar.png`, `tecnologia.png`, `cocina.png`, `automovil.png`, `belleza.png`, `virales.png`, `todos.png`.
- [ ] **Banners Hero Principal (`public/hero/`):**
  - `hero1catalogo.png` y `hero1catalogo-mobile.png` (Producto estrella y oferta).
  - `hero2afiliados.png` y `hero2afiliados-mobile.png` (Gana dinero con TodoMax).
  - `hero3registro.png` y `hero3registro-mobile.png` (Envío gratis > $50).
- [ ] **Banners de Ofertas y Combos (`public/ofertas/`):**
  - `oferta1.png`, `oferta2.png`, `oferta3.png` y sus versiones `-mobile.png`.
- [ ] **Videos y Fotos de Productos (`public/products/`):**
  - Fotografías reales y videos cortos en formato `.mp4` para cada producto del catálogo.

---

## Protocolo de Clonación Express para el Cliente de Mañana:
1. Duplicar la carpeta del proyecto.
2. Modificar únicamente `src/config/site.ts`: cambiar `storeName`, teléfonos de WhatsApp, cuentas bancarias de Pago Móvil/Zelle y empresas de envío.
3. Reemplazar `public/logo-todomax.png` por el logotipo del nuevo cliente.
4. Ajustar los productos en `src/data/products.ts` según el rubro del cliente.
5. ¡Listo para desplegar en Vercel en menos de 15 minutos!