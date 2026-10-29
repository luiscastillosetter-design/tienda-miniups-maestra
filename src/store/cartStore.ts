import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
};

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,

      addItem: (item, quantity) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            const nextQuantity = existing.quantity + quantity;
            const maxQuantity = item.stock ? Math.min(item.stock, nextQuantity) : nextQuantity;
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: maxQuantity, stock: item.stock ?? i.stock } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id === id) {
              const maxQuantity = i.stock ? Math.min(i.stock, quantity) : quantity;
              return { ...i, quantity: Math.max(1, maxQuantity) };
            }
            return i;
          }),
        })),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'todomax_cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);