import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartProduct, CartItem } from "@/utils/whatsapp";
import { getFinalPrice } from "@/utils/whatsapp";
import { useToast } from "@/hooks/use-toast";

export type { CartProduct, CartItem };
export { getFinalPrice };

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number, selectedAttributes?: Record<string, string>) => void;
  removeFromCart: (productId: string, selectedAttributes?: Record<string, string>) => void;
  updateQuantity: (productId: string, newQuantity: number, selectedAttributes?: Record<string, string>) => void;
  clearCart: () => void;
  setStoreId: (storeId: string) => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "catalogo360_cart";
const STORE_KEY = "catalogo360_cart_store";

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
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(
    () => localStorage.getItem(STORE_KEY)
  );
  const { toast } = useToast();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const setStoreId = useCallback((storeId: string) => {
    const savedStoreId = localStorage.getItem(STORE_KEY);
    if (savedStoreId && savedStoreId !== storeId) {
      // Different store — clear cart
      setItems([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    setCurrentStoreId(storeId);
    localStorage.setItem(STORE_KEY, storeId);
  }, []);

  const getCartKey = (productId: string, attrs?: Record<string, string>) => {
    if (!attrs || Object.keys(attrs).length === 0) return productId;
    const sorted = Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b));
    return `${productId}__${sorted.map(([k, v]) => `${k}:${v}`).join("_")}`;
  };

  const matchItem = (item: CartItem, productId: string, attrs?: Record<string, string>) => {
    return getCartKey(item.product.id, item.selectedAttributes) === getCartKey(productId, attrs);
  };

  /** Returns the effective stock for selected attributes using variant_stock */
  const getEffectiveStock = (product: CartProduct, attrs?: Record<string, string>): number => {
    const vs = product.variant_stock;
    if (!vs || !attrs || Object.keys(attrs).length === 0) return product.stock;
    const stocks = Object.entries(attrs).map(([attrName, val]) => {
      const key = `${attrName}||${val}`;
      return vs[key] !== undefined ? vs[key] : product.stock;
    });
    return stocks.length > 0 ? Math.min(...stocks) : product.stock;
  };

  const addToCart = useCallback((product: CartProduct, quantity = 1, selectedAttributes?: Record<string, string>) => {
    setItems((prev) => {
      const effectiveStock = getEffectiveStock(product, selectedAttributes);
      const existing = prev.find((i) => matchItem(i, product.id, selectedAttributes));
      if (existing) {
        if (existing.quantity + quantity > effectiveStock) {
          toast({ title: "Stock máximo alcanzado", variant: "destructive" });
          return prev;
        }
        return prev.map((i) =>
          matchItem(i, product.id, selectedAttributes) ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      if (quantity > effectiveStock) {
        toast({ title: "Stock máximo alcanzado", variant: "destructive" });
        return prev;
      }
      return [...prev, { product, quantity, selectedAttributes }];
    });
    toast({ title: `${product.name} agregado al carrito` });
  }, [toast]);

  const removeFromCart = useCallback((productId: string, selectedAttributes?: Record<string, string>) => {
    setItems((prev) => prev.filter((i) => !matchItem(i, productId, selectedAttributes)));
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number, selectedAttributes?: Record<string, string>) => {
    if (newQuantity <= 0) {
      setItems((prev) => prev.filter((i) => !matchItem(i, productId, selectedAttributes)));
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (!matchItem(i, productId, selectedAttributes)) return i;
        const effectiveStock = getEffectiveStock(i.product, selectedAttributes);
        if (newQuantity > effectiveStock) return i;
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
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, setStoreId, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
