import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Truck, Tag, X, Banknote, Building2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/CartContext";
import { getFinalPrice, generateWhatsAppUrl } from "@/utils/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import type { ShippingConfigData } from "@/pages/Dashboard/ShippingConfig";
import type { PaymentMethodsConfig } from "@/pages/Dashboard/PaymentMethods";

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  storePhone: string;
  storeName?: string;
  primaryColor: string;
  currencySymbol?: string;
  referralCode?: string;
  onOrderComplete?: () => void;
}

const CartModal = ({ open, onOpenChange, storeId, storePhone, storeName, primaryColor, currencySymbol = "$", onOrderComplete }: CartModalProps) => {
  const { toast } = useToast();
  const { items, cartTotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((p) => ({ ...p, [field]: true }));

  const nameInvalid = touched.name && (!name.trim() || name.trim().length < 3);
  const phoneInvalid = touched.phone && (!phone.trim() || phone.trim().length < 7);
  const invalidBorder = "border-destructive ring-1 ring-destructive/30";

  // Shipping zones
  const [shippingConfig, setShippingConfig] = useState<ShippingConfigData | null>(null);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(-1);

  // Coupons
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string; code: string; discount_type: string; discount_value: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);


  // Payment methods
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  // Load shipping config when modal opens
  useEffect(() => {
    if (!open || !storeId) return;
    (async () => {
      const { data } = await supabase
        .from("stores_public" as any)
        .select("shipping_config, payment_methods")
        .eq("id", storeId)
        .limit(1);
      if (data?.[0]) {
        const row = data[0] as any;
        const sc = row.shipping_config as Record<string, any> | null;
        if (sc && Object.keys(sc).length > 0) {
          const config = sc as unknown as ShippingConfigData;
          setShippingConfig(config);
        } else {
          setShippingConfig(null);
        }
        // Load payment methods
        const pm = row.payment_methods as Record<string, any> | null;
        if (pm && typeof pm === "object" && Object.keys(pm).length > 0) {
          const pmConfig = pm as unknown as PaymentMethodsConfig;
          setPaymentConfig(pmConfig);
          if (pmConfig.cash?.enabled) setSelectedPayment("cash");
          else if (pmConfig.bank_transfer?.enabled) setSelectedPayment("bank_transfer");
          else if (pmConfig.qr?.enabled) setSelectedPayment("qr");
          else setSelectedPayment("");
        } else {
          setPaymentConfig(null);
          setSelectedPayment("");
        }
      }
    })();
  }, [open, storeId]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setAppliedCoupon(null);
      setCouponCode("");
      setTouched({});
      setSelectedZoneIndex(-1);
    }
  }, [open]);

  const validateCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setValidatingCoupon(true);
    const { data, error } = await supabase.rpc("validate_coupon", {
      p_store_id: storeId,
      p_code: code,
    });

    if (error || !data || !(data as any).valid) {
      const msg = (data as any)?.error || "El código no existe o no está activo";
      toast({ title: "Cupón inválido", description: msg, variant: "destructive" });
      setValidatingCoupon(false);
      return;
    }
    const c = data as any;
    if (c.min_purchase && cartTotal < Number(c.min_purchase)) {
      toast({ title: "Compra mínima no alcanzada", description: `Mínimo ${currencySymbol}${Number(c.min_purchase).toFixed(2)}`, variant: "destructive" });
      setValidatingCoupon(false);
      return;
    }
    setAppliedCoupon({ id: c.id, code: c.code, discount_type: c.discount_type, discount_value: Number(c.discount_value) });
    const discountDesc = c.discount_type === "free_shipping"
      ? "Envío gratis"
      : c.discount_type === "percentage"
        ? `${c.discount_value}%`
        : `${currencySymbol}${Number(c.discount_value).toFixed(2)}`;
    toast({ title: "¡Cupón aplicado!", description: `Descuento: ${discountDesc}` });
    setValidatingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Zones from config
  const zones = shippingConfig?.local_zones || [];
  const hasZones = zones.length > 0;
  const isFreeShippingCoupon = appliedCoupon?.discount_type === "free_shipping";

  // Calculate coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? cartTotal * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_type === "free_shipping"
        ? 0
        : Math.min(appliedCoupon.discount_value, cartTotal)
    : 0;

  const subtotalAfterCoupon = cartTotal - couponDiscount;

  const subtotalAfterDiscounts = subtotalAfterCoupon;

  // Calculate shipping cost
  const getShippingCost = () => {
    if (!hasZones || selectedZoneIndex < 0) return 0;
    if (isFreeShippingCoupon) return 0;
    const cost = zones[selectedZoneIndex]?.cost || 0;
    if (shippingConfig && shippingConfig.free_shipping_threshold > 0 && subtotalAfterDiscounts >= shippingConfig.free_shipping_threshold) {
      return 0;
    }
    return cost;
  };

  const shippingCost = getShippingCost();
  const grandTotal = subtotalAfterDiscounts + shippingCost;

  // Form completeness
  const hasPaymentMethods = paymentConfig && (paymentConfig.cash?.enabled || paymentConfig.bank_transfer?.enabled || paymentConfig.qr?.enabled);
  const isFormComplete = (() => {
    if (items.length === 0) return false;
    if (!name.trim() || name.trim().length < 3) return false;
    if (!phone.trim() || phone.trim().length < 7) return false;
    if (hasZones && selectedZoneIndex < 0) return false;
    if (hasPaymentMethods && !selectedPayment) return false;
    return true;
  })();

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 3) {
      toast({ title: "Error", description: "Ingresa tu nombre completo (min 3 caracteres)", variant: "destructive" });
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      toast({ title: "Error", description: "Ingresa un teléfono válido", variant: "destructive" });
      return;
    }
    if (hasZones && selectedZoneIndex < 0) {
      toast({ title: "Error", description: "Selecciona tu zona de envío", variant: "destructive" });
      return;
    }

    if (items.length === 0) return;
    setSubmitting(true);

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      price: getFinalPrice(i.product, i.selectedAttributes),
      quantity: i.quantity,
    }));

    const zoneName = hasZones && selectedZoneIndex >= 0
      ? zones[selectedZoneIndex].name
      : undefined;

    const waUrl = generateWhatsAppUrl({
      storePhone,
      storeName,
      cartItems: items,
      customer: {
        name: name.trim(),
        phone: phone.trim(),
      },
      currencySymbol,
      subtotal: cartTotal,
      coupon: appliedCoupon
        ? { code: appliedCoupon.code, discount: couponDiscount }
        : undefined,
      shipping: hasZones && selectedZoneIndex >= 0
        ? {
            method: "local",
            methodLabel: zoneName || "Envío",
            zoneName,
            cost: shippingCost,
          }
        : undefined,
      grandTotal,
      note: note.trim() || undefined,
      paymentMethod: selectedPayment && paymentConfig
        ? (paymentConfig as any)[selectedPayment]?.label || undefined
        : undefined,
    });

    // Save order to DB FIRST, then redirect to WhatsApp
    try {
      const { data: orderData } = await supabase.from("orders").insert({
        store_id: storeId,
        customer_name: name.trim(),
        customer_email: "",
        customer_phone: phone.trim(),
        items: orderItems as any,
        total_price: grandTotal,
        status: "pending",
      }).select("id").single();

      if (orderData && appliedCoupon) {
        const { data: couponData } = await supabase.from("coupons").select("used_count").eq("id", appliedCoupon.id).single();
        if (couponData) {
          await supabase.from("coupons").update({ used_count: couponData.used_count + 1 }).eq("id", appliedCoupon.id);
        }
      }
    } catch (e) {
      console.error("Error saving order to database:", e);
    }

    // Open WhatsApp AFTER order is saved
    const link = document.createElement("a");
    link.href = waUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSubmitting(false);
    onOpenChange(false);
    clearCart();
    setName(""); setPhone(""); setNote("");
    onOrderComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Completar pedido</DialogTitle>
          <DialogDescription>Ingresa tus datos para enviar el pedido por WhatsApp</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="cust-name" className={nameInvalid ? "text-destructive" : ""}>Nombre completo *</Label>
            <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => markTouched("name")} placeholder="Tu nombre completo" className={`mt-1.5 ${nameInvalid ? invalidBorder : ""}`} />
            {nameInvalid && <p className="text-xs text-destructive mt-1">Mínimo 3 caracteres</p>}
          </div>
          <div>
            <Label htmlFor="cust-phone" className={phoneInvalid ? "text-destructive" : ""}>WhatsApp / Teléfono *</Label>
            <Input id="cust-phone" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => markTouched("phone")} placeholder="+591 12345678" className={`mt-1.5 ${phoneInvalid ? invalidBorder : ""}`} />
            {phoneInvalid && <p className="text-xs text-destructive mt-1">Mínimo 7 dígitos</p>}
          </div>

          {/* Zone Selection */}
          {hasZones && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Zona de envío *
                </Label>
                <div className="mt-2 space-y-1.5">
                  {zones.map((zone, i) => {
                    const isFree = shippingConfig && shippingConfig.free_shipping_threshold > 0 && subtotalAfterDiscounts >= shippingConfig.free_shipping_threshold;
                    return (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                          selectedZoneIndex === i
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping-zone"
                          checked={selectedZoneIndex === i}
                          onChange={() => setSelectedZoneIndex(i)}
                        />
                        <span className="flex-1 font-medium">{zone.name || `Zona ${i + 1}`}</span>
                        <span className="text-muted-foreground">
                          {isFreeShippingCoupon || isFree ? "Gratis" : zone.cost > 0 ? `${currencySymbol}${zone.cost.toFixed(2)}` : "Gratis"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Payment Methods */}
          {paymentConfig && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-semibold">Método de pago</Label>
                <div className="mt-2 space-y-2">
                  {paymentConfig.cash?.enabled && (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedPayment === "cash" ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                      }`}
                    >
                      <input type="radio" name="payment-method" value="cash" checked={selectedPayment === "cash"} onChange={() => setSelectedPayment("cash")} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span className="text-sm font-medium text-foreground">{paymentConfig.cash.label}</span>
                        </div>
                        {paymentConfig.cash.instructions && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{paymentConfig.cash.instructions}</p>
                        )}
                      </div>
                    </label>
                  )}
                  {paymentConfig.bank_transfer?.enabled && (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedPayment === "bank_transfer" ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                      }`}
                    >
                      <input type="radio" name="payment-method" value="bank_transfer" checked={selectedPayment === "bank_transfer"} onChange={() => setSelectedPayment("bank_transfer")} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="text-sm font-medium text-foreground">{paymentConfig.bank_transfer.label}</span>
                        </div>
                        {selectedPayment === "bank_transfer" && paymentConfig.bank_transfer.details && (
                          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-2.5 text-xs text-foreground font-mono">
                            {paymentConfig.bank_transfer.details}
                          </pre>
                        )}
                      </div>
                    </label>
                  )}
                  {paymentConfig.qr?.enabled && (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedPayment === "qr" ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                      }`}
                    >
                      <input type="radio" name="payment-method" value="qr" checked={selectedPayment === "qr"} onChange={() => setSelectedPayment("qr")} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          <span className="text-sm font-medium text-foreground">{paymentConfig.qr.label}</span>
                        </div>
                        {selectedPayment === "qr" && paymentConfig.qr.image_url && (
                          <div className="mt-2 flex justify-center">
                            <img src={paymentConfig.qr.image_url} alt="QR de pago" className="h-48 w-48 rounded-lg border object-contain bg-white p-2" />
                          </div>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="cust-note">Nota de pedido (opcional)</Label>
            <Textarea id="cust-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instrucciones especiales..." className="mt-1.5" rows={2} />
          </div>

          {/* Coupon Code */}
          <Separator />
          <div>
            <Label className="text-sm font-semibold">Cupón de descuento</Label>
            {appliedCoupon ? (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-2.5">
                <Tag className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                  <span className="ml-2 text-xs text-green-600 dark:text-green-500">
                    {appliedCoupon.discount_type === "percentage"
                      ? `-${appliedCoupon.discount_value}%`
                      : `-${currencySymbol}${appliedCoupon.discount_value.toFixed(2)}`}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeCoupon}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Código de cupón"
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validateCoupon())}
                />
                <Button variant="outline" onClick={validateCoupon} disabled={validatingCoupon || !couponCode.trim()} className="shrink-0">
                  {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                </Button>
              </div>
            )}
          </div>


          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{currencySymbol}{cartTotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Cupón ({appliedCoupon.code})</span>
                <span className="font-medium">-{currencySymbol}{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            {hasZones && selectedZoneIndex >= 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío ({zones[selectedZoneIndex]?.name})</span>
                <span className="font-medium">{shippingCost > 0 ? `${currencySymbol}${shippingCost.toFixed(2)}` : "Gratis"}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span style={{ color: primaryColor }}>{currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !isFormComplete}
            className="gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar y enviar a WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
