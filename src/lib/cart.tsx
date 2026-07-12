"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number; // pesewas, display only — server re-prices at checkout
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  maxStock: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "adepa-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // corrupted storage — start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const keyOf = (productId: string, variantId: string | null) =>
    `${productId}:${variantId ?? ""}`;

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      setItems((prev) => {
        const key = keyOf(item.productId, item.variantId);
        const existing = prev.find((i) => keyOf(i.productId, i.variantId) === key);
        if (existing) {
          return prev.map((i) =>
            keyOf(i.productId, i.variantId) === key
              ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
              : i
          );
        }
        return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock) }];
      });
      setIsOpen(true);
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      setItems((prev) =>
        prev
          .map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxStock)) }
              : i
          )
          .filter((i) => i.quantity > 0)
      );
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      count,
    }),
    [items, isOpen, addItem, updateQuantity, removeItem, clearCart, subtotal, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
