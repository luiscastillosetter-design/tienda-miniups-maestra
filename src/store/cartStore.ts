import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
  selectedColor?: string;
};

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (id: string, selectedColor?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedColor?: string) => void;
  toggleCart: () => void;
  clearCart: () => void;
};

// Una línea del carrito = producto + color elegido
const sameLine = (i: CartItem, id: string, color?: string) =>
  i.id === id && (i.selectedColor || '') === (color || '');

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,

      addItem: (item, quantity) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.id, item.selectedColor));
          if (existing) {
            const nextQuantity = existing.quantity + quantity;
            const maxQuantity = item.stock !== undefined ? Math.min(item.stock, nextQuantity) : nextQuantity;
            return {
              items: state.items.map((i) =>
                sameLine(i, item.id, item.selectedColor) ? { ...i, quantity: maxQuantity, stock: item.stock ?? i.stock } : i
              ),
            };
          }
          const initialQuantity = item.stock !== undefined ? Math.min(item.stock, Math.max(1, quantity)) : quantity;
          return { items: [...state.items, { ...item, quantity: initialQuantity }] };
        }),

      removeItem: (id, selectedColor) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, id, selectedColor)),
        })),

      updateQuantity: (id, quantity, selectedColor) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (sameLine(i, id, selectedColor)) {
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
