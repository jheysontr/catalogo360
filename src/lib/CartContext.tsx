import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartProduct, CartItem } from "@/utils/whatsapp";
import { getFinalPrice } from "@/utils/whatsapp";
import { useToast } from "@/hooks/use-toast";

export type { CartProduct, CartItem };
export { getFinalPrice };

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cataloghub_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const { toast } = useToast();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: CartProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity + quantity > product.stock) {
          toast({ title: "Stock máximo alcanzado", variant: "destructive" });
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      if (quantity > product.stock) {
        toast({ title: "Stock máximo alcanzado", variant: "destructive" });
        return prev;
      }
      return [...prev, { product, quantity }];
    });
    toast({ title: `${product.name} agregado al carrito` });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        if (newQuantity > i.product.stock) return i;
        return { ...i, quantity: newQuantity };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartTotal = items.reduce(
    (sum, i) => sum + getFinalPrice(i.product) * i.quantity,
    0
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
