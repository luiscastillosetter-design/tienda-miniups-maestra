import { Product, products as defaultProducts } from '@/data/products';

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.error('Error fetching products from API, falling back to default:', e);
    }
    return defaultProducts;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const allProducts = await this.getProducts();
    return allProducts.find((product) => String(product.id) === String(id));
  },
};