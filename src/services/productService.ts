import { Product, products as defaultProducts } from '@/data/products';

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('store_products');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {}
      }
    }

    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('store_products', JSON.stringify(data));
          }
          return data;
        }
      }
    } catch (e) {
      console.error('Error fetching products from API:', e);
    }
    return defaultProducts;
  },

  async saveProducts(products: Product[]): Promise<boolean> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('store_products', JSON.stringify(products));
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });
      return res.ok;
    } catch (e) {
      console.error('Error saving products:', e);
      return false;
    }
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const allProducts = await this.getProducts();
    return allProducts.find((product) => String(product.id) === String(id));
  },
};