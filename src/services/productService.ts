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

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          safeSetLocalStorage('store_products', data);
          return data;
        }
      }
    } catch (e) {
      console.error('Error consultando /api/products en la nube:', e);
    }

    if (typeof window !== 'undefined') {
      try {
        const localData = localStorage.getItem('store_products');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }

    return defaultProducts;
  },

  async saveProducts(products: Product[]): Promise<boolean> {
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