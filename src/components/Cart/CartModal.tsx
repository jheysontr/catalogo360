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
import { Loader2, MapPin, Truck, Package, Tag, X, Users, Banknote, Building2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/CartContext";
import { getFinalPrice, generateWhatsAppUrl } from "@/utils/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import type { ShippingConfigData, LocalZone } from "@/pages/Dashboard/ShippingConfig";
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

const METHOD_ICONS: Record<string, React.ReactNode> = {
  pickup: <MapPin className="h-4 w-4" />,
  local: <Truck className="h-4 w-4" />,
  national: <Package className="h-4 w-4" />,
};

const METHOD_LABELS: Record<string, string> = {
  pickup: "Retiro en tienda",
  local: "Envío local",
  national: "Envío nacional",
};

const CartModal = ({ open, onOpenChange, storeId, storePhone, storeName, primaryColor, currencySymbol = "$", referralCode = "", onOrderComplete }: CartModalProps) => {
  const { toast } = useToast();
  const { items, cartTotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Shipping
  const [shippingConfig, setShippingConfig] = useState<ShippingConfigData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(-1);
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipPostalCode, setShipPostalCode] = useState("");
  const [shipPhone, setShipPhone] = useState("");

  // Coupons
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string; code: string; discount_type: string; discount_value: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Referral
  const [refCode, setRefCode] = useState(referralCode);
  const [appliedReferral, setAppliedReferral] = useState<{
    referrer_name: string; referrer_email: string; referral_code: string;
    discount_type: string; discount_value: number;
    commission_type: string; commission_value: number; max_orders: number;
  } | null>(null);
  const [validatingRef, setValidatingRef] = useState(false);

  // Payment methods
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  // Load shipping config when modal opens
  useEffect(() => {
    if (!open || !storeId) return;
    (async () => {
      const { data } = await supabase
        .from("stores")
        .select("shipping_config, payment_methods")
        .eq("id", storeId)
        .limit(1);
      if (data?.[0]) {
        const sc = data[0].shipping_config as Record<string, any> | null;
        if (sc && Object.keys(sc).length > 0) {
          const config = sc as unknown as ShippingConfigData;
          setShippingConfig(config);
          // Auto-select first available method
          if (config.pickup_enabled) setShippingMethod("pickup");
          else if (config.local_enabled) setShippingMethod("local");
          else if (config.national_enabled) setShippingMethod("national");
          else setShippingMethod("");
        } else {
          setShippingConfig(null);
          setShippingMethod("");
        }
        // Load payment methods
        const pm = (data[0] as any).payment_methods as Record<string, any> | null;
        if (pm && typeof pm === "object" && Object.keys(pm).length > 0) {
          const pmConfig = pm as unknown as PaymentMethodsConfig;
          setPaymentConfig(pmConfig);
          // Auto-select first enabled
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

  // Reset coupon/referral when modal closes
  useEffect(() => {
    if (!open) {
      setAppliedCoupon(null);
      setCouponCode("");
      setAppliedReferral(null);
      setRefCode(referralCode);
    }
  }, [open, referralCode]);

  // Auto-validate referral code on open
  useEffect(() => {
    if (open && referralCode && !appliedReferral) {
      validateReferral(referralCode);
    }
  }, [open, referralCode]);

  const validateReferral = async (code?: string) => {
    const c = (code || refCode).trim().toUpperCase();
    if (!c) return;
    setValidatingRef(true);
    // Check referrer exists and is active
    const { data: refData } = await supabase
      .from("referrers")
      .select("*")
      .eq("store_id", storeId)
      .eq("referral_code", c)
      .eq("is_active", true)
      .limit(1);
    if (!refData?.length) {
      toast({ title: "Código de referido inválido", variant: "destructive" });
      setValidatingRef(false);
      return;
    }
    // Check referral config
    const { data: configData } = await supabase
      .from("referral_config")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .limit(1);
    if (!configData?.length) {
      toast({ title: "El programa de referidos no está activo", variant: "destructive" });
      setValidatingRef(false);
      return;
    }
    const rc = configData[0];
    const r = refData[0];
    setAppliedReferral({
      referrer_name: r.name,
      referrer_email: r.email,
      referral_code: r.referral_code,
      discount_type: rc.referral_discount_type,
      discount_value: Number(rc.referral_discount_value),
      commission_type: rc.commission_type,
      commission_value: Number(rc.commission_value),
      max_orders: rc.max_commission_orders,
    });
    const desc = rc.referral_discount_type === "percentage"
      ? `${rc.referral_discount_value}% de descuento`
      : `${currencySymbol}${Number(rc.referral_discount_value).toFixed(2)} de descuento`;
    toast({ title: "¡Código de referido aplicado!", description: desc });
    setValidatingRef(false);
  };

  const removeReferral = () => {
    setAppliedReferral(null);
    setRefCode("");
  };

  const validateCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setValidatingCoupon(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("store_id", storeId)
      .eq("code", code)
      .eq("is_active", true)
      .limit(1);

    if (error || !data?.length) {
      toast({ title: "Cupón inválido", description: "El código no existe o no está activo", variant: "destructive" });
      setValidatingCoupon(false);
      return;
    }
    const c = data[0];
    // Check expiry
    if (c.expires_at && new Date(c.expires_at) < new Date()) {
      toast({ title: "Cupón expirado", variant: "destructive" });
      setValidatingCoupon(false);
      return;
    }
    // Check max uses
    if (c.max_uses && c.used_count >= c.max_uses) {
      toast({ title: "Cupón agotado", variant: "destructive" });
      setValidatingCoupon(false);
      return;
    }
    // Check min purchase
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

  const availableMethods = shippingConfig
    ? [
        ...(shippingConfig.pickup_enabled ? ["pickup"] : []),
        ...(shippingConfig.local_enabled ? ["local"] : []),
        ...(shippingConfig.national_enabled ? ["national"] : []),
      ]
    : [];

  const hasShipping = availableMethods.length > 0;

  // Calculate coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? cartTotal * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_type === "free_shipping"
        ? 0
        : Math.min(appliedCoupon.discount_value, cartTotal)
    : 0;

  const isFreeShippingCoupon = appliedCoupon?.discount_type === "free_shipping";

  const subtotalAfterCoupon = cartTotal - couponDiscount;

  // Calculate referral discount
  const referralDiscount = appliedReferral
    ? appliedReferral.discount_type === "percentage"
      ? subtotalAfterCoupon * (appliedReferral.discount_value / 100)
      : Math.min(appliedReferral.discount_value, subtotalAfterCoupon)
    : 0;

  const subtotalAfterDiscounts = subtotalAfterCoupon - referralDiscount;

  // Calculate shipping cost
  const getShippingCost = () => {
    if (!shippingConfig || !shippingMethod) return 0;
    if (shippingMethod === "pickup") return 0;
    if (isFreeShippingCoupon) return 0;

    let cost = 0;
    if (shippingMethod === "local") {
      const zones = shippingConfig.local_zones || [];
      if (zones.length > 0 && selectedZoneIndex >= 0 && selectedZoneIndex < zones.length) {
        cost = zones[selectedZoneIndex].cost || 0;
      } else {
        cost = shippingConfig.local_cost || 0;
      }
    }
    if (shippingMethod === "national") cost = shippingConfig.national_cost || 0;

    if (shippingConfig.free_shipping_threshold > 0 && subtotalAfterDiscounts >= shippingConfig.free_shipping_threshold) {
      return 0;
    }
    return cost;
  };

  const shippingCost = getShippingCost();
  const grandTotal = subtotalAfterDiscounts + shippingCost;

  const getEstimatedDate = () => {
    if (!shippingConfig || !shippingMethod) return null;
    let days = 0;
    if (shippingMethod === "pickup") days = 0;
    else if (shippingMethod === "local") days = shippingConfig.local_delivery_days || 1;
    else if (shippingMethod === "national") days = shippingConfig.national_delivery_days || 5;

    if (days === 0) return null;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 3) {
      toast({ title: "Error", description: "Ingresa tu nombre completo (min 3 caracteres)", variant: "destructive" });
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      toast({ title: "Error", description: "Ingresa un teléfono válido", variant: "destructive" });
      return;
    }

    // Validate shipping
    if (hasShipping && !shippingMethod) {
      toast({ title: "Error", description: "Selecciona un método de envío", variant: "destructive" });
      return;
    }
    if (hasShipping && shippingMethod === "local" && shippingConfig?.local_zones && shippingConfig.local_zones.length > 0 && selectedZoneIndex < 0) {
      toast({ title: "Error", description: "Selecciona tu zona de envío", variant: "destructive" });
      return;
    }
    if (hasShipping && shippingMethod !== "pickup") {
      if (!shipAddress.trim()) {
        toast({ title: "Error", description: "Ingresa la dirección de envío", variant: "destructive" });
        return;
      }
      if (!shipCity.trim()) {
        toast({ title: "Error", description: "Ingresa la ciudad", variant: "destructive" });
        return;
      }
    }

    if (items.length === 0) return;

    setSubmitting(true);

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      price: getFinalPrice(i.product, i.selectedAttributes),
      quantity: i.quantity,
    }));

    // Generate tracking number
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let trackingNumber = "TRK-";
    for (let i = 0; i < 8; i++) {
      trackingNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase.from("orders").insert({
      store_id: storeId,
      customer_name: name.trim(),
      customer_email: "",
      customer_phone: phone.trim(),
      items: orderItems as any,
      total_price: grandTotal,
      status: "pending",
    }).select("id").single();

    if (orderError || !orderData) {
      toast({ title: "Error", description: "No se pudo crear el pedido", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Create shipment if shipping is configured
    if (hasShipping && shippingMethod) {
      await supabase.from("shipments").insert({
        order_id: orderData.id,
        store_id: storeId,
        shipping_method: shippingMethod,
        tracking_number: trackingNumber,
        cost: shippingCost,
        address: shippingMethod === "pickup" ? (shippingConfig?.pickup_address || "") : shipAddress.trim(),
        city: shippingMethod === "pickup" ? "" : shipCity.trim(),
        postal_code: shippingMethod === "pickup" ? "" : shipPostalCode.trim(),
        phone: shipPhone.trim() || phone.trim(),
        status: "pending",
        estimated_delivery_date: getEstimatedDate(),
      });
    }

    // Increment coupon used_count
    if (appliedCoupon) {
      const { data: couponData } = await supabase.from("coupons").select("used_count").eq("id", appliedCoupon.id).single();
      if (couponData) {
        await supabase.from("coupons").update({ used_count: couponData.used_count + 1 }).eq("id", appliedCoupon.id);
      }
    }

    // Track referral commission
    if (appliedReferral) {
      const commissionAmount = appliedReferral.commission_type === "percentage"
        ? grandTotal * (appliedReferral.commission_value / 100)
        : appliedReferral.commission_value;

      // Count existing referrals from this email
      const { count } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("store_id", storeId)
        .eq("referrer_code", appliedReferral.referral_code)
        .eq("referred_email", phone.trim());

      const orderNum = (count || 0) + 1;

      if (orderNum <= appliedReferral.max_orders) {
        await supabase.from("referrals").insert({
          store_id: storeId,
          referrer_code: appliedReferral.referral_code,
          referrer_name: appliedReferral.referrer_name,
          referrer_email: appliedReferral.referrer_email,
          referred_email: phone.trim(),
          referred_order_id: orderData.id,
          commission_amount: commissionAmount,
          status: "pending",
          order_count: orderNum,
        });

        // Update referrer totals
        const { data: refData } = await supabase
          .from("referrers")
          .select("id, total_earned, total_referrals")
          .eq("store_id", storeId)
          .eq("referral_code", appliedReferral.referral_code)
          .single();
        if (refData) {
          await supabase.from("referrers").update({
            total_earned: Number(refData.total_earned) + commissionAmount,
            total_referrals: refData.total_referrals + 1,
          }).eq("id", refData.id);
        }
      }
    }

    const trackingUrl = hasShipping && shippingMethod
      ? `${window.location.origin}/track?q=${encodeURIComponent(trackingNumber)}`
      : undefined;

    const zoneName = shippingMethod === "local" && shippingConfig?.local_zones && selectedZoneIndex >= 0
      ? shippingConfig.local_zones[selectedZoneIndex].name
      : undefined;

    const waUrl = generateWhatsAppUrl({
      storePhone,
      storeName,
      cartItems: items,
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        address: shippingMethod === "pickup" ? undefined : shipAddress.trim() || undefined,
      },
      currencySymbol,
      subtotal: cartTotal,
      coupon: appliedCoupon
        ? { code: appliedCoupon.code, discount: couponDiscount }
        : undefined,
      shipping: hasShipping && shippingMethod
        ? {
            method: shippingMethod,
            methodLabel: METHOD_LABELS[shippingMethod],
            zoneName,
            cost: shippingCost,
            address: shippingMethod === "pickup" ? undefined : shipAddress.trim(),
            city: shippingMethod === "pickup" ? undefined : shipCity.trim(),
          }
        : undefined,
      grandTotal,
      trackingNumber: hasShipping && shippingMethod ? trackingNumber : undefined,
      trackingUrl,
      note: note.trim() || undefined,
      paymentMethod: selectedPayment && paymentConfig
        ? (paymentConfig as any)[selectedPayment]?.label || undefined
        : undefined,
    });

    setSubmitting(false);
    onOpenChange(false);
    clearCart();
    setName(""); setPhone(""); setNote("");
    setShipAddress(""); setShipCity(""); setShipPostalCode(""); setShipPhone("");

    toast({ title: "¡Pedido enviado!" });
    window.open(waUrl, "_blank");
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
            <Label htmlFor="cust-name">Nombre completo *</Label>
            <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cust-phone">WhatsApp / Teléfono *</Label>
            <Input id="cust-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+591 12345678" className="mt-1.5" />
          </div>

          {/* Shipping Method Selection */}
          {hasShipping && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-semibold">Método de envío *</Label>
                <div className="mt-2 space-y-2">
                  {availableMethods.map((method) => {
                    let description = "";
                    if (method === "pickup") {
                      description = `Gratis${shippingConfig?.pickup_address ? ` — ${shippingConfig.pickup_address}` : ""}`;
                      if (shippingConfig?.pickup_hours) description += ` (${shippingConfig.pickup_hours})`;
                    } else if (method === "local") {
                      const zones = shippingConfig?.local_zones || [];
                      const isFree = shippingConfig?.free_shipping_threshold && shippingConfig.free_shipping_threshold > 0 && cartTotal >= shippingConfig.free_shipping_threshold;
                      if (zones.length > 0) {
                        description = isFree ? "Gratis" : "Selecciona tu zona";
                      } else {
                        const cost = shippingConfig?.local_cost || 0;
                        description = isFree ? "Gratis" : cost > 0 ? `${currencySymbol}${cost.toFixed(2)}` : "Gratis";
                      }
                      if (shippingConfig?.local_delivery_days) description += ` — ${shippingConfig.local_delivery_days} día(s)`;
                    } else if (method === "national") {
                      const cost = shippingConfig?.national_cost || 0;
                      const isFree = shippingConfig?.free_shipping_threshold && shippingConfig.free_shipping_threshold > 0 && cartTotal >= shippingConfig.free_shipping_threshold;
                      description = isFree ? "Gratis" : cost > 0 ? `${currencySymbol}${cost.toFixed(2)}` : "Gratis";
                      if (shippingConfig?.national_carrier) description += ` — ${shippingConfig.national_carrier}`;
                      if (shippingConfig?.national_delivery_days) description += ` (${shippingConfig.national_delivery_days} días)`;
                    }

                    return (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          shippingMethod === method
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping-method"
                          value={method}
                          checked={shippingMethod === method}
                          onChange={() => { setShippingMethod(method); setSelectedZoneIndex(-1); }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {METHOD_ICONS[method]}
                            <span className="text-sm font-medium text-foreground">{METHOD_LABELS[method]}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Local zone selection */}
              {shippingMethod === "local" && shippingConfig?.local_zones && shippingConfig.local_zones.length > 0 && (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Selecciona tu zona *</p>
                  <div className="space-y-1.5">
                    {shippingConfig.local_zones.map((zone, i) => {
                      const isFree = shippingConfig.free_shipping_threshold > 0 && subtotalAfterCoupon >= shippingConfig.free_shipping_threshold;
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
                            name="local-zone"
                            checked={selectedZoneIndex === i}
                            onChange={() => setSelectedZoneIndex(i)}
                          />
                          <span className="flex-1 font-medium">{zone.name || `Zona ${i + 1}`}</span>
                          <span className="text-muted-foreground">
                            {isFree ? "Gratis" : zone.cost > 0 ? `${currencySymbol}${zone.cost.toFixed(2)}` : "Gratis"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shipping address fields */}
              {shippingMethod && shippingMethod !== "pickup" && (
                <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Dirección de envío</p>
                  <div>
                    <Label htmlFor="ship-address">Calle / Dirección *</Label>
                    <Input
                      id="ship-address"
                      value={shipAddress}
                      onChange={(e) => setShipAddress(e.target.value)}
                      placeholder="Av. Principal #123"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="ship-city">Ciudad *</Label>
                      <Input
                        id="ship-city"
                        value={shipCity}
                        onChange={(e) => setShipCity(e.target.value)}
                        placeholder="Santa Cruz"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ship-postal">Código postal</Label>
                      <Input
                        id="ship-postal"
                        value={shipPostalCode}
                        onChange={(e) => setShipPostalCode(e.target.value)}
                        placeholder="10001"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ship-phone">Teléfono de contacto</Label>
                    <Input
                      id="ship-phone"
                      value={shipPhone}
                      onChange={(e) => setShipPhone(e.target.value)}
                      placeholder="Mismo del pedido si no se llena"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Pickup info */}
              {shippingMethod === "pickup" && shippingConfig?.pickup_address && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Dirección de retiro</p>
                  <p className="text-sm text-foreground">{shippingConfig.pickup_address}</p>
                  {shippingConfig.pickup_hours && (
                    <p className="mt-1 text-xs text-muted-foreground">🕐 {shippingConfig.pickup_hours}</p>
                  )}
                </div>
              )}
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
                      <input
                        type="radio"
                        name="payment-method"
                        value="cash"
                        checked={selectedPayment === "cash"}
                        onChange={() => setSelectedPayment("cash")}
                        className="mt-1"
                      />
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
                      <input
                        type="radio"
                        name="payment-method"
                        value="bank_transfer"
                        checked={selectedPayment === "bank_transfer"}
                        onChange={() => setSelectedPayment("bank_transfer")}
                        className="mt-1"
                      />
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
                      <input
                        type="radio"
                        name="payment-method"
                        value="qr"
                        checked={selectedPayment === "qr"}
                        onChange={() => setSelectedPayment("qr")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          <span className="text-sm font-medium text-foreground">{paymentConfig.qr.label}</span>
                        </div>
                        {selectedPayment === "qr" && paymentConfig.qr.image_url && (
                          <div className="mt-2 flex justify-center">
                            <img
                              src={paymentConfig.qr.image_url}
                              alt="QR de pago"
                              className="h-48 w-48 rounded-lg border object-contain bg-white p-2"
                            />
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
                <Button
                  variant="outline"
                  onClick={validateCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="shrink-0"
                >
                  {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                </Button>
              </div>
            )}
          </div>

          {/* Referral Code */}
          <div>
            <Label className="text-sm font-semibold">Código de referido</Label>
            {appliedReferral ? (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-2.5">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Referido por {appliedReferral.referrer_name}
                  </span>
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-500">
                    {appliedReferral.discount_type === "percentage"
                      ? `-${appliedReferral.discount_value}%`
                      : `-${currencySymbol}${appliedReferral.discount_value.toFixed(2)}`}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeReferral}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Input
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  placeholder="REF-XXXXXX"
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validateReferral())}
                />
                <Button
                  variant="outline"
                  onClick={() => validateReferral()}
                  disabled={validatingRef || !refCode.trim()}
                  className="shrink-0"
                >
                  {validatingRef ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
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
            {appliedReferral && referralDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Referido ({appliedReferral.referrer_name})</span>
                <span className="font-medium">-{currencySymbol}{referralDiscount.toFixed(2)}</span>
              </div>
            )}
            {hasShipping && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
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
            disabled={submitting}
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
