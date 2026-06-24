import type { Product } from "@/components/StoreFront/types";

export interface PlaceholderMeta {
  emoji: string;
  tint: string;
}

/** Stable IDs let cards look up emoji/tint by product id. */
export const PLACEHOLDER_PRODUCTS: (Product & PlaceholderMeta & { __placeholder: true })[] = [
  { id: "__ph-1", name: "Manzana Roja", description: "Fresca, 1kg", price: 4.99, stock: 20, image_url: null, extra_images: [], on_sale: false, discount_percent: null, category_id: null, attributes: [], emoji: "🍎", tint: "#FBDADA", __placeholder: true },
  { id: "__ph-2", name: "Plátano Orgánico", description: "Racimo, 7pcs", price: 3.5, stock: 35, image_url: null, extra_images: [], on_sale: true, discount_percent: 20, category_id: null, attributes: [], emoji: "🍌", tint: "#FFF4C9", __placeholder: true },
  { id: "__ph-3", name: "Pan Artesanal", description: "Recién horneado", price: 8.0, stock: 12, image_url: null, extra_images: [], on_sale: false, discount_percent: null, category_id: null, attributes: [], emoji: "🥖", tint: "#FFE6CC", __placeholder: true },
  { id: "__ph-4", name: "Aguacate Hass", description: "Maduro, listo para comer", price: 5.2, stock: 18, image_url: null, extra_images: [], on_sale: false, discount_percent: null, category_id: null, attributes: [], emoji: "🥑", tint: "#DCEFD8", __placeholder: true },
  { id: "__ph-5", name: "Leche Entera", description: "1L, fría", price: 6.0, stock: 25, image_url: null, extra_images: [], on_sale: false, discount_percent: null, category_id: null, attributes: [], emoji: "🥛", tint: "#D7EAF7", __placeholder: true },
  { id: "__ph-6", name: "Queso Fresco", description: "Artesanal 250g", price: 12.5, stock: 8, image_url: null, extra_images: [], on_sale: true, discount_percent: 15, category_id: null, attributes: [], emoji: "🧀", tint: "#FFF4C9", __placeholder: true },
  { id: "__ph-7", name: "Café Premium", description: "Grano molido 500g", price: 22.0, stock: 14, image_url: null, extra_images: [], on_sale: false, discount_percent: null, category_id: null, attributes: [], emoji: "☕", tint: "#E6D7C3", __placeholder: true },
  { id: "__ph-8", name: "Tomate Cherry", description: "Pinta de 250g", price: 4.0, stock: 22, image_url: null, extra_images: [], on_sale: false, discount_percent: null, category_id: null, attributes: [], emoji: "🍅", tint: "#FBDADA", __placeholder: true },
];

const TINT_PALETTE = ["#FBDADA", "#FFF4C9", "#FFE6CC", "#DCEFD8", "#D7EAF7", "#F1E0F5", "#E6D7C3", "#E0F2F1"];

/** Stable color picked from the name so the same product keeps the same tint. */
const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const getPlaceholderMeta = (product: { id?: string; name?: string }): PlaceholderMeta => {
  const direct = PLACEHOLDER_PRODUCTS.find((p) => p.id === product.id);
  if (direct) return { emoji: direct.emoji, tint: direct.tint };
  const name = product.name || "Producto";
  return { emoji: name.trim().charAt(0).toUpperCase() || "★", tint: TINT_PALETTE[hashString(name) % TINT_PALETTE.length] };
};

export const isPlaceholderProductId = (id: string) => id.startsWith("__ph-");
