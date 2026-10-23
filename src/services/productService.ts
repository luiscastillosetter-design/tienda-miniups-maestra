import { Product, products as defaultProducts } from '@/data/products';

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('store_products');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error leyendo store_products', e);
        }
      }
      // Si la memoria está vacía, la inicializamos con los nuevos productos base
      localStorage.setItem('store_products', JSON.stringify(defaultProducts));
    }
    return Promise.resolve(defaultProducts);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const allProducts = await this.getProducts();
    return allProducts.find((product) => String(product.id) === String(id));
  },
};