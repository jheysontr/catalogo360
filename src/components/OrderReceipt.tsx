import { useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

interface ReceiptItem {
  name?: string;
  product_name?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  unit_price?: number;
}

interface ReceiptOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items: unknown;
  total_price: number;
  status: string;
  created_at: string;
}

interface ReceiptStore {
  store_name: string;
  logo_url?: string | null;
  address?: string | null;
  email?: string | null;
  social_media?: Record<string, string> | null;
}

interface OrderReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ReceiptOrder | null;
  store: ReceiptStore;
  currency?: string;
}

const parseItems = (raw: unknown): ReceiptItem[] =>
  Array.isArray(raw) ? (raw as ReceiptItem[]) : [];
const getName = (i: ReceiptItem) => i.name || i.product_name || "Producto";
const getQty = (i: ReceiptItem) => i.quantity ?? i.qty ?? 1;
const getPrice = (i: ReceiptItem) => i.price ?? i.unit_price ?? 0;
// fmtCurrency is now defined inside the component
const shortId = (id: string) => id.slice(0, 8).toUpperCase();

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const OrderReceipt = ({ open, onOpenChange, order, store, currency = "BOB" }: OrderReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const fmtCurrency = (n: number) => `${getCurrencySymbol(currency)} ${n.toFixed(2)}`;

  if (!order) return null;

  const items = parseItems(order.items);
  const subtotal = items.reduce((s, i) => s + getPrice(i) * getQty(i), 0);
  const orderDate = new Date(order.created_at).toLocaleDateString("es", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo #${shortId(order.id)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; color: #1a1a1a; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { max-height: 48px; margin-bottom: 8px; }
          .store-name { font-size: 18px; font-weight: 700; }
          .store-info { font-size: 11px; color: #666; margin-top: 2px; }
          .divider { border: none; border-top: 1px dashed #ccc; margin: 14px 0; }
          .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6px; font-weight: 600; }
          .order-id { font-size: 13px; font-weight: 600; }
          .order-date { font-size: 11px; color: #666; }
          .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e8f5e9; color: #2e7d32; }
          .status.pending { background: #fff8e1; color: #f57f17; }
          .status.cancelled { background: #ffebee; color: #c62828; }
          .status.confirmed { background: #e3f2fd; color: #1565c0; }
          .customer p { font-size: 12px; line-height: 1.6; }
          .item-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; }
          .item-name { flex: 1; }
          .item-qty { width: 40px; text-align: center; color: #666; }
          .item-total { width: 80px; text-align: right; font-weight: 500; }
          .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 8px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #888; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadImage = async () => {
    const content = receiptRef.current;
    if (!content) return;

    // Use a canvas-based approach via html-to-text fallback
    const lines = [
      `═══════════════════════════════════`,
      `        ${store.store_name}`,
      store.address ? `        ${store.address}` : "",
      store.email ? `        ${store.email}` : "",
      `═══════════════════════════════════`,
      "",
      `  RECIBO #${shortId(order.id)}`,
      `  Fecha: ${orderDate}`,
      `  Estado: ${statusLabel[order.status] || order.status}`,
      `───────────────────────────────────`,
      `  CLIENTE`,
      `  ${order.customer_name}`,
      `  ${order.customer_email}`,
      order.customer_phone ? `  Tel: ${order.customer_phone}` : "",
      `───────────────────────────────────`,
      `  DETALLE`,
      ...items.map((i) =>
        `  ${getName(i).padEnd(20)} x${getQty(i)}  ${fmtCurrency(getPrice(i) * getQty(i)).padStart(10)}`
      ),
      `───────────────────────────────────`,
      `  TOTAL:                ${fmtCurrency(order.total_price).padStart(12)}`,
      `═══════════════════════════════════`,
      "",
      `  ¡Gracias por tu compra!`,
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recibo-${shortId(order.id)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recibo de Orden</DialogTitle>
          <DialogDescription>Vista previa del recibo para imprimir o descargar</DialogDescription>
        </DialogHeader>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex-1 gap-2">
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" onClick={handleDownloadImage} className="flex-1 gap-2">
            <Download className="h-4 w-4" /> Descargar
          </Button>
        </div>

        {/* Receipt preview */}
        <div className="rounded-lg border bg-white p-6 text-black shadow-sm" ref={receiptRef}>
          {/* Store header */}
          <div className="header" style={{ textAlign: "center", marginBottom: 16 }}>
            {store.logo_url && (
              <img src={store.logo_url} alt={store.store_name} className="logo" style={{ maxHeight: 48, marginBottom: 8, display: "inline-block" }} />
            )}
            <div className="store-name" style={{ fontSize: 18, fontWeight: 700 }}>{store.store_name}</div>
            {store.address && <div className="store-info" style={{ fontSize: 11, color: "#666" }}>{store.address}</div>}
            {store.email && <div className="store-info" style={{ fontSize: 11, color: "#666" }}>{store.email}</div>}
            {store.social_media?.whatsapp && (
              <div className="store-info" style={{ fontSize: 11, color: "#666" }}>WhatsApp: {store.social_media.whatsapp}</div>
            )}
          </div>

          <hr className="divider" style={{ border: "none", borderTop: "1px dashed #ccc", margin: "14px 0" }} />

          {/* Order info */}
          <div style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 600, marginBottom: 4 }}>Orden</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="order-id" style={{ fontSize: 13, fontWeight: 600 }}>#{shortId(order.id)}</span>
              <span className={`status ${order.status}`} style={{
                display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: order.status === "completed" ? "#e8f5e9" : order.status === "pending" ? "#fff8e1" : order.status === "cancelled" ? "#ffebee" : "#e3f2fd",
                color: order.status === "completed" ? "#2e7d32" : order.status === "pending" ? "#f57f17" : order.status === "cancelled" ? "#c62828" : "#1565c0",
              }}>
                {statusLabel[order.status] || order.status}
              </span>
            </div>
            <div className="order-date" style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{orderDate}</div>
          </div>

          <hr className="divider" style={{ border: "none", borderTop: "1px dashed #ccc", margin: "14px 0" }} />

          {/* Customer */}
          <div className="customer" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 600, marginBottom: 4 }}>Cliente</div>
            <p style={{ fontSize: 12, lineHeight: 1.6 }}>{order.customer_name}</p>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: "#666" }}>{order.customer_email}</p>
            {order.customer_phone && <p style={{ fontSize: 12, lineHeight: 1.6, color: "#666" }}>{order.customer_phone}</p>}
          </div>

          <hr className="divider" style={{ border: "none", borderTop: "1px dashed #ccc", margin: "14px 0" }} />

          {/* Items */}
          <div style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 600, marginBottom: 6 }}>Detalle</div>
            {items.map((item, idx) => (
              <div key={idx} className="item-row" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: idx < items.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <span className="item-name" style={{ flex: 1 }}>{getName(item)}</span>
                <span className="item-qty" style={{ width: 40, textAlign: "center", color: "#666" }}>x{getQty(item)}</span>
                <span className="item-total" style={{ width: 80, textAlign: "right", fontWeight: 500 }}>{fmtCurrency(getPrice(item) * getQty(item))}</span>
              </div>
            ))}
          </div>

          <hr className="divider" style={{ border: "none", borderTop: "1px dashed #ccc", margin: "14px 0" }} />

          {/* Total */}
          <div className="total-row" style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
            <span>TOTAL</span>
            <span>{fmtCurrency(order.total_price)}</span>
          </div>

          {/* Footer */}
          <div className="footer" style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#888" }}>
            <p>¡Gracias por tu compra!</p>
            <p style={{ marginTop: 4 }}>{store.store_name}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;
