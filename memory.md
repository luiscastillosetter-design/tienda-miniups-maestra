# ROADMAP DE AUDITORÍA Y REPARACIÓN FINAL — PROYECTO TODOMAX (PRE-ENTREGA)

## Reglas de Trabajo Activas
1. **Ejecución Secuencial:** Avanzar estrictamente tarea por tarea esperando confirmación del usuario.
2. **Entregas Seguras:** Archivos completos listos para copiar y pegar (o `Ctrl + H` exacto cuando convenga en archivos extensos) para evitar errores de sintaxis.
3. **Respeto Total al Diseño:** Mantener intactas las vistas actuales de PC y Móvil. Cero recortes de funciones ni cambios estéticos; solo corrección de rendimiento, lógica y seguridad.

---

## Ruta de Ejecución Paso a Paso

### [ ] TAREA 1: Eliminación de Código Muerto y Archivos Basura
- **1.1.** Eliminar `.todomax-db.json` de la raíz del proyecto (causante de lentitud por imágenes en Base64 y conflictos con Redis).
- **1.2.** Eliminar el componente huérfano `src/components/BackButton.tsx` (no se utiliza en ninguna vista).
- **1.3.** Eliminar íconos basura de la plantilla inicial de Next.js en `public/`: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg` y `window.svg`.
- **1.4.** Actualizar `.gitignore` para excluir archivos internos de configuración y desarrollo (`.claude/`, `.clinerules`, `design.md`, `memory.md`, `.todomax-db.json`).

### [ ] TAREA 2: Blindaje de Base de Datos (Redis) y Conector Sellibrí
- **2.1. `src/services/dbService.ts`:** Eliminar por completo la lectura/escritura del archivo físico `.todomax-db.json`. Ampliar el `connectTimeout` de Redis de `1200ms` a `5000ms` para evitar que los arranques en frío (*cold starts*) de Vercel bloqueen Redis por 60 segundos.
- **2.2. `src/app/api/products/route.ts`:** Corregir el bug crítico en `GET` que sobrescribía y borraba los productos reales en Redis con `defaultProducts` si ocurría una microcaída de conexión.
- **2.3. `src/app/api/sellibri/route.ts`:** Conectar el webhook a `dbService` para que `update_tracking` actualice realmente la guía y el estatus del pedido en `store_orders`, y `sync_stock` actualice las existencias reales en `store_products`. Eliminar la variable `status` sin usar y exigir variable de entorno segura.

### [ ] TAREA 3: Optimización de Velocidad y Reparación del Panel Admin (`/admin`)
- **3.1. Compresión Automática en `src/app/admin/page.tsx`:** Reemplazar la lectura cruda en Base64 de `handleMediaUpload` por un compresor automático en HTML5 Canvas (formato WebP ligero) para que los banners y fotos de productos subidos a Redis pesen pocos kilobytes en lugar de varios megabytes (manteniendo soporte intacto para videos `.mp4`).
- **3.2. Seguridad en Login Admin:** Retirar de la vista pública el recuadro inferior que muestra impresas en pantalla las contraseñas de los 3 roles (`Admin1234.`, `Logistica123.`, `Marketing123.`).
- **3.3. Liquidación Real de Afiliados:** Guardar el monto total ya liquidado por afiliado en lugar de bloquear su código para siempre tras el primer pago, permitiendo liquidar futuras ventas entregadas.
- **3.4. Corrección Visual:** Reparar la clase rota `gradient-to-br` por `bg-gradient-to-br` en la tarjeta de "Utilidad Neta Estimada" del módulo Finanzas.

### [ ] TAREA 4: Carrito Persistente, Control de Stock y Cero "Salto de Imágenes"
- **4.1. `src/store/cartStore.ts`:** Agregar persistencia automática en `localStorage` (`todomax_cart`) para que el comprador no pierda sus productos al recargar la página.
- **4.2. `src/app/page.tsx` y `src/app/catalogo/page.tsx`:** Sincronizar la carga inicial para eliminar el parpadeo de los recuadros naranjas por defecto (`FOTO HOGAR 1`, `FOTO UPS 1`) antes de que responda Redis.
- **4.3. `src/app/product/[id]/page.tsx`:**
  - Bloquear los botones `"Agregar al Carrito"` y `"Comprar Ahora"` cuando `product.stock <= 0`.
  - Limitar el botón `+` de cantidad para que no permita superar el `product.stock` disponible (también en `src/components/CartDrawer.tsx`).
  - Soportar reproducción de video en las miniaturas del carrusel inferior `"Productos Recomendados"` cuando el primer archivo sea un `.mp4`.
  - Asegurar que el botón `"Volver al Catálogo"` redirija a `/catalogo` si el cliente entró desde un enlace externo directo (WhatsApp/Afiliado).

### [ ] TAREA 5: Reparación de Atribución, Checkout y Panel de Afiliados
- **5.1. `src/components/AffiliateTracker.tsx`:**
  - Corregir el bug que sobrescribía `todomax_attribution` con `'Directo'` al navegar internamente a una página sin parámetros UTM/ref en la URL.
  - Sanitizar `pixelId` (permitir solo números) antes de inyectarlo en el script para evitar vulnerabilidades XSS.
- **5.2. `src/app/checkout/page.tsx`:**
  - Soportar miniaturas de video `.mp4` en el resumen de compra.
  - Proteger el guardado de órdenes en `localStorage` para que no colapse por límite de cuota de memoria.
- **5.3. `src/app/afiliados/page.tsx`:**
  - Sincronizar la tarjeta `"Comisión Disponible"` restando los pagos ya liquidados desde el Admin (`store_paid_affiliates`).
  - Impedir que un nuevo registro sobrescriba un código de afiliado que ya pertenece a otra persona.
  - Validar en el inicio de sesión que el código ingresado exista realmente en `store_affiliates` en lugar de inventar una sesión falsa.

### [ ] TAREA 6: Pulido de Componentes Globales y Marca Blanca (`siteConfig`)
- **6.1. `src/components/Header.tsx`:** Soportar miniaturas de video `.mp4` en los resultados del buscador en vivo (PC y Móvil).
- **6.2. `src/components/AuthModal.tsx`:** Proteger `JSON.parse` con `try/catch` para evitar caídas del navegador y reemplazar los `alert()` nativos por notificaciones limpias dentro del modal.
- **6.3. `src/config/site.ts`, `src/components/Footer.tsx` y `src/app/api/afiliados/route.ts`:** Centralizar correo de contacto, país y dominio web en `siteConfig` para cumplir al 100% con el protocolo de clonación Marca Blanca.