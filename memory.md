# Memoria Técnica del Proyecto - TodoMax E-Commerce

## Decisión Arquitectónica Definitiva
- Desincorporación total de Redis: Se elimina Redis como base de datos y almacén de caché para evitar cuellos de botella por transporte de cadenas pesadas.
- Migración a Supabase:
  1. Supabase Database (PostgreSQL): Para persistencia relacional de productos, pedidos, configuración y afiliados mediante registros limpios.
  2. Supabase Storage (Bucket): Para alojamiento directo de imágenes y banners. La base de datos solo almacena URLs públicas cortas (ej. https://.../banner.webp), eliminando la sobrecarga de datos en memoria y red.

## Reestructuración de `/catalogo`
- Sección 1 (Superior): Carrusel Hero continuo idéntico al de la página principal, rotando automáticamente los banners de las 6 categorías.
- Sección 2 (Media): Barra de botones de categorías idéntica al inicio, limpia y sin cajas de texto ni bloques laterales.
- Sección 3 (Inferior): Grilla de productos filtrada dinámicamente según la categoría activa.

## Hoja de Ruta para Reinicio de Labores
1. Creación de Bucket de Storage y Tablas en Supabase.
2. Reemplazo del servicio de subida multimedia en el Admin para generar URLs públicas.
3. Reorganización de layout en `/catalogo/page.tsx` bajo la nueva estructura visual.
4. Conexión de endpoints y vistas a Supabase Client.