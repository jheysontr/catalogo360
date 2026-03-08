export interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  on_sale: boolean;
  discount_percent: number | null;
  variant_stock?: Record<string, number>;
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
  orderId?: string;
}

export function getFinalPrice(p: CartProduct, selectedAttributes?: Record<string, string>): number {
  let basePrice = p.price;
  if (p.variant_prices && selectedAttributes) {
    const prices = Object.entries(selectedAttributes)
      .map(([attrName, val]) => p.variant_prices![`${attrName}||${val}`])
      .filter((v): v is number => v !== undefined && v > 0);
    if (prices.length > 0) {
      basePrice = Math.max(...prices);
    }
  }
  return p.on_sale && p.discount_percent
    ? basePrice * (1 - p.discount_percent / 100)
    : basePrice;
}

function formatDate(): string {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} — ${hours}:${minutes}`;
}

function shortOrderId(id?: string): string {
  if (!id) return "";
  return id.substring(0, 8).toUpperCase();
}

export function generateWhatsAppUrl(data: OrderMessageData): string {
  const cs = data.currencySymbol || "$";
  const itemCount = data.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const lines: string[] = [];

  // ── Header
  lines.push(data.storeName
    ? `🛍️ *Pedido — ${data.storeName}*`
    : "🛍️ *Nuevo Pedido*"
  );

  // ── Order ID & Date
  const meta: string[] = [];
  if (data.orderId) meta.push(`📋 Pedido: *#${shortOrderId(data.orderId)}*`);
  meta.push(`📅 ${formatDate()}`);
  lines.push(meta.join("  ·  "));

  lines.push("─────────────────────");

  // ── Items
  data.cartItems.forEach((i, idx) => {
    const unitPrice = getFinalPrice(i.product, i.selectedAttributes);
    const lineTotal = unitPrice * i.quantity;
    const attrText = i.selectedAttributes && Object.keys(i.selectedAttributes).length > 0
      ? ` _(${Object.entries(i.selectedAttributes).map(([k, v]) => `${v}`).join(", ")})_`
      : "";

    lines.push(
      `${idx + 1}. *${i.product.name}*${attrText}`,
      `    ${i.quantity} × ${cs}${unitPrice.toFixed(2)} = *${cs}${lineTotal.toFixed(2)}*`
    );
  });

  lines.push("─────────────────────");

  // ── Totals
  lines.push(`   Subtotal (${itemCount} ${itemCount === 1 ? "artículo" : "artículos"}): ${cs}${data.subtotal.toFixed(2)}`);

  if (data.coupon) {
    lines.push(`   🏷️ Cupón *${data.coupon.code}*: −${cs}${data.coupon.discount.toFixed(2)}`);
  }

  if (data.shipping) {
    const label = data.shipping.zoneName || data.shipping.methodLabel;
    const costText = data.shipping.cost > 0 ? `${cs}${data.shipping.cost.toFixed(2)}` : "🎉 Gratis";
    lines.push(`   📦 Envío (${label}): ${costText}`);
  }

  lines.push("");
  lines.push(`💰 *TOTAL: ${cs}${data.grandTotal.toFixed(2)}*`);

  if (data.paymentMethod) {
    lines.push(`💳 Pago: ${data.paymentMethod}`);
  }

  // ── Customer
  lines.push("");
  lines.push("👤 *Datos del cliente*");
  lines.push(`   📌 ${data.customer.name}`);
  lines.push(`   📱 ${data.customer.phone}`);

  if (data.shipping && data.shipping.method !== "pickup" && data.shipping.address) {
    lines.push(
      `   📍 ${data.shipping.address}${data.shipping.city ? `, ${data.shipping.city}` : ""}`
    );
  }

  // ── Tracking
  if (data.trackingNumber) {
    lines.push("");
    lines.push(`🔍 Rastreo: *${data.trackingNumber}*`);
    if (data.trackingUrl) {
      lines.push(`   ${data.trackingUrl}`);
    }
  }

  // ── Note
  if (data.note) {
    lines.push("");
    lines.push(`📝 _${data.note}_`);
  }

  // ── Footer
  lines.push("");
  lines.push("_Pedido enviado desde Catalogo360_");

  const msg = lines.join("\n");
  const phone = data.storePhone.replace(/\D/g, "");
  return phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}
