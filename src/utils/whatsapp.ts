export interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  on_sale: boolean;
  discount_percent: number | null;
  /** variant_stock: key = "AttrName||Value", value = stock number */
  variant_stock?: Record<string, number>;
  /** variant_prices: key = "AttrName||Value", value = price override */
  variant_prices?: Record<string, number>;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  selectedAttributes?: Record<string, string>;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
}

export interface OrderMessageData {
  storePhone: string;
  storeName?: string;
  cartItems: CartItem[];
  customer: CustomerInfo;
  currencySymbol?: string;
  subtotal: number;
  coupon?: { code: string; discount: number };
  shipping?: {
    method: string;
    methodLabel: string;
    zoneName?: string;
    cost: number;
    address?: string;
    city?: string;
  };
  grandTotal: number;
  trackingNumber?: string;
  trackingUrl?: string;
  note?: string;
  paymentMethod?: string;
}

export function getFinalPrice(p: CartProduct, selectedAttributes?: Record<string, string>): number {
  let basePrice = p.price;
  // Check for variant-specific price override
  if (p.variant_prices && selectedAttributes) {
    const prices = Object.entries(selectedAttributes)
      .map(([attrName, val]) => p.variant_prices![`${attrName}||${val}`])
      .filter((v): v is number => v !== undefined && v > 0);
    if (prices.length > 0) {
      // Use the highest variant price (most specific override)
      basePrice = Math.max(...prices);
    }
  }
  return p.on_sale && p.discount_percent
    ? basePrice * (1 - p.discount_percent / 100)
    : basePrice;
}

export function generateWhatsAppUrl(data: OrderMessageData): string {
  const cs = data.currencySymbol || "$";

  const header = data.storeName
    ? `🛒 *NUEVO PEDIDO — ${data.storeName.toUpperCase()}*`
    : "🛒 *NUEVO PEDIDO*";

  const lines: string[] = [
    header,
    "━━━━━━━━━━━━━━━━━━",
  ];

  // Items with individual prices
  data.cartItems.forEach((i) => {
    const unitPrice = getFinalPrice(i.product, i.selectedAttributes);
    const lineTotal = unitPrice * i.quantity;
    const attrText = i.selectedAttributes && Object.keys(i.selectedAttributes).length > 0
      ? ` (${Object.entries(i.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(", ")})`
      : "";
    lines.push(
      `▪️ ${i.product.name}${attrText}`,
      `   ${i.quantity} x ${cs}${unitPrice.toFixed(2)} = ${cs}${lineTotal.toFixed(2)}`
    );
  });

  // Totals section
  lines.push("", "━━━━━━━━━━━━━━━━━━");
  lines.push(`   Subtotal: ${cs}${data.subtotal.toFixed(2)}`);

  if (data.coupon) {
    lines.push(`🏷️ Cupón (${data.coupon.code}): -${cs}${data.coupon.discount.toFixed(2)}`);
  }

  if (data.shipping) {
    const shippingLabel = data.shipping.methodLabel + (data.shipping.zoneName ? ` — ${data.shipping.zoneName}` : "");
    lines.push(
      `📦 Envío (${shippingLabel}): ${data.shipping.cost > 0 ? cs + data.shipping.cost.toFixed(2) : "Gratis"}`
    );
  }

  lines.push(`💰 *Total: ${cs}${data.grandTotal.toFixed(2)}*`);

  // Payment method
  if (data.paymentMethod) {
    lines.push(`💳 Método de pago: ${data.paymentMethod}`);
  }

  // Customer info
  lines.push("", "━━━━━━━━━━━━━━━━━━", "👤 *Datos del cliente*");
  lines.push(`   Nombre: ${data.customer.name}`);
  lines.push(`   WhatsApp: ${data.customer.phone}`);

  if (data.shipping && data.shipping.method !== "pickup" && data.shipping.address) {
    lines.push(
      `   Dirección: ${data.shipping.address}${data.shipping.city ? `, ${data.shipping.city}` : ""}`
    );
  }

  // Tracking
  if (data.trackingNumber) {
    lines.push("", "🔍 *Seguimiento*");
    lines.push(`   Rastreo: ${data.trackingNumber}`);
    if (data.trackingUrl) {
      lines.push(`   Ver estado: ${data.trackingUrl}`);
    }
  }

  // Note
  if (data.note) {
    lines.push("", `📝 Nota: ${data.note}`);
  }

  const msg = lines.join("\n");
  const phone = data.storePhone.replace(/\D/g, "");
  return phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
