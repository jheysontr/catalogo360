export interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  on_sale: boolean;
  discount_percent: number | null;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  note?: string;
}

export function getFinalPrice(p: CartProduct): number {
  return p.on_sale && p.discount_percent
    ? p.price * (1 - p.discount_percent / 100)
    : p.price;
}

export function generateWhatsAppUrl(
  storePhone: string,
  cartItems: CartItem[],
  customerInfo: CustomerInfo,
  total: number,
  currencySymbol: string = "$"
): string {
  const itemLines = cartItems
    .map((i) => `📦 ${i.product.name} x${i.quantity}`)
    .join("\n");

  const msg = [
    "Hola! Me gustaría realizar el siguiente pedido:",
    "",
    itemLines,
    "",
    `💰 Total: ${currencySymbol}${total.toFixed(2)}`,
    "",
    `👤 Nombre: ${customerInfo.name}`,
    `📱 WhatsApp: ${customerInfo.phone}`,
    customerInfo.address ? `📍 Dirección: ${customerInfo.address}` : "",
    customerInfo.note ? `📝 Nota: ${customerInfo.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const phone = storePhone.replace(/\D/g, "");
  return phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
