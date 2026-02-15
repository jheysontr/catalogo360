const RESERVED_SLUGS = new Set([
  "admin", "dashboard", "api", "login", "register", "store", "stores",
  "settings", "profile", "help", "support", "about", "contact", "terms",
  "privacy", "blog", "pricing", "plans", "checkout", "cart", "search",
  "categories", "products", "orders", "analytics", "notifications",
]);

export const validateStoreSlug = (slug: string): boolean => {
  if (!slug || slug.length < 3 || slug.length > 30) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug.toLowerCase())) return false;
  return true;
};

export const validateEmail = (email: string): boolean => {
  if (!email || email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const digits = phone.replace(/[\s\-().+]/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
};

export const validateProductName = (name: string): boolean => {
  if (!name || name.trim().length < 3 || name.trim().length > 100) return false;
  if (/[<>{}\\`]/.test(name)) return false;
  return true;
};

export const validatePrice = (price: number | string): boolean => {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(n) || n <= 0 || n > 999999.99) return false;
  const parts = String(n).split(".");
  if (parts[1] && parts[1].length > 2) return false;
  return true;
};
