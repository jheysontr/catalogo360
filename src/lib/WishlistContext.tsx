import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  on_sale: boolean;
  discount_percent: number | null;
}

interface WishlistContextValue {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  setStoreId: (storeId: string) => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "catalogo360_wishlist";
const STORE_KEY = "catalogo360_wishlist_store";

function loadWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(loadWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const setStoreId = useCallback((storeId: string) => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && saved !== storeId) {
      setItems([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    localStorage.setItem(STORE_KEY, storeId);
  }, []);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some((i) => i.id === productId);
  }, [items]);

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, setStoreId, itemCount: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
