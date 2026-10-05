import { create } from 'zustand';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isCartOpen: false,

  addItem: (item, quantity) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
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
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    })),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));
