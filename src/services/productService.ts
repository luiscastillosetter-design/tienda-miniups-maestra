import { Product, products } from '@/data/products';

export const productService = {
  async getProducts(): Promise<Product[]> {
    return Promise.resolve(products);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    return Promise.resolve(products.find((product) => product.id === id));
  },
};
