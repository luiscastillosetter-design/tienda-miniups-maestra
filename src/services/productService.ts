import { Product, products as defaultProducts } from '@/data/products';

function safeSetLocalStorage(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  }
}

// Variables en memoria para deduplicar peticiones simultáneas y evitar ráfagas de red
let inFlightProductsPromise: Promise<Product[]> | null = null;
let memoryProductsCache: { data: Product[]; timestamp: number } | null = null;

export const productService = {
  async getProducts(): Promise<Product[]> {
    const now = Date.now();

    // 1. Si ya se consultó hace menos de 10 segundos, responder en 0ms desde la RAM
    if (memoryProductsCache && now - memoryProductsCache.timestamp < 10000) {
      return memoryProductsCache.data;
    }

    // 2. Si ya hay una petición de productos viajando por la red, reutilizarla
    if (inFlightProductsPromise) {
      return await inFlightProductsPromise;
    }

    inFlightProductsPromise = (async () => {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            safeSetLocalStorage('store_products', data);
            memoryProductsCache = { data, timestamp: Date.now() };
            return data;
          }
        }
      } catch (e) {
        console.error('Error consultando /api/products en la nube:', e);
      } finally {
        inFlightProductsPromise = null;
      }

      // Respaldo secundario: caché local del navegador
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem('store_products');
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryProductsCache = { data: parsed, timestamp: Date.now() };
              return parsed;
            }
          }
        } catch (_) {}
      }

      return defaultProducts;
    })();

    return await inFlightProductsPromise;
  },

  async saveProducts(products: Product[]): Promise<boolean> {
    // Limpiar caché en memoria para que los cambios del Admin se vean en el acto
    memoryProductsCache = { data: products, timestamp: Date.now() };
    safeSetLocalStorage('store_products', products);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });
      return res.ok;
    } catch (e) {
      console.error('Error guardando productos en la nube:', e);
      return false;
    }
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const allProducts = await this.getProducts();
    return allProducts.find((product) => String(product.id) === String(id));
  },
};