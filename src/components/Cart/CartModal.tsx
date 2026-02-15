import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Truck, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/CartContext";
import { getFinalPrice, generateWhatsAppUrl } from "@/utils/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import type { ShippingConfigData } from "@/pages/Dashboard/ShippingConfig";

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  storePhone: string;
  primaryColor: string;
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

const CartModal = ({ open, onOpenChange, storeId, storePhone, primaryColor }: CartModalProps) => {
  const { toast } = useToast();
  const { items, cartTotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Shipping
  const [shippingConfig, setShippingConfig] = useState<ShippingConfigData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipPostalCode, setShipPostalCode] = useState("");
  const [shipPhone, setShipPhone] = useState("");

  // Load shipping config when modal opens
  useEffect(() => {
    if (!open || !storeId) return;
    (async () => {
      const { data } = await supabase
        .from("stores")
        .select("shipping_config")
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
      }
    })();
  }, [open, storeId]);

  const availableMethods = shippingConfig
    ? [
        ...(shippingConfig.pickup_enabled ? ["pickup"] : []),
        ...(shippingConfig.local_enabled ? ["local"] : []),
        ...(shippingConfig.national_enabled ? ["national"] : []),
      ]
    : [];

  const hasShipping = availableMethods.length > 0;

  // Calculate shipping cost
  const getShippingCost = () => {
    if (!shippingConfig || !shippingMethod) return 0;
    if (shippingMethod === "pickup") return 0;

    let cost = 0;
    if (shippingMethod === "local") cost = shippingConfig.local_cost || 0;
    if (shippingMethod === "national") cost = shippingConfig.national_cost || 0;

    // Free shipping threshold
    if (shippingConfig.free_shipping_threshold > 0 && cartTotal >= shippingConfig.free_shipping_threshold) {
      return 0;
    }
    return cost;
  };

  const shippingCost = getShippingCost();
  const grandTotal = cartTotal + shippingCost;

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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Error", description: "Ingresa un email válido", variant: "destructive" });
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
      price: getFinalPrice(i.product),
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
      customer_email: email.trim(),
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

    const shippingNote = hasShipping && shippingMethod
      ? `\n📦 Envío: ${METHOD_LABELS[shippingMethod]}${shippingCost > 0 ? ` ($${shippingCost.toFixed(2)})` : " (Gratis)"}${shippingMethod !== "pickup" ? `\n📍 ${shipAddress.trim()}, ${shipCity.trim()}` : ""}\n🔍 Rastreo: ${trackingNumber}`
      : "";

    const waUrl = generateWhatsAppUrl(
      storePhone,
      items,
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: shippingMethod === "pickup" ? undefined : shipAddress.trim() || undefined,
        note: (note.trim() + shippingNote) || undefined,
      },
      grandTotal
    );

    setSubmitting(false);
    onOpenChange(false);
    clearCart();
    setName(""); setEmail(""); setPhone(""); setNote("");
    setShipAddress(""); setShipCity(""); setShipPostalCode(""); setShipPhone("");

    toast({ title: "¡Pedido enviado!" });
    window.open(waUrl, "_blank");
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
            <Label htmlFor="cust-email">Email *</Label>
            <Input id="cust-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cust-phone">Teléfono *</Label>
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
                    let cost = 0;
                    let description = "";
                    if (method === "pickup") {
                      description = `Gratis${shippingConfig?.pickup_address ? ` — ${shippingConfig.pickup_address}` : ""}`;
                      if (shippingConfig?.pickup_hours) description += ` (${shippingConfig.pickup_hours})`;
                    } else if (method === "local") {
                      cost = shippingConfig?.local_cost || 0;
                      const isFree = shippingConfig?.free_shipping_threshold && shippingConfig.free_shipping_threshold > 0 && cartTotal >= shippingConfig.free_shipping_threshold;
                      description = isFree ? "Gratis" : cost > 0 ? `$${cost.toFixed(2)}` : "Gratis";
                      if (shippingConfig?.local_delivery_days) description += ` — ${shippingConfig.local_delivery_days} día(s)`;
                    } else if (method === "national") {
                      cost = shippingConfig?.national_cost || 0;
                      const isFree = shippingConfig?.free_shipping_threshold && shippingConfig.free_shipping_threshold > 0 && cartTotal >= shippingConfig.free_shipping_threshold;
                      description = isFree ? "Gratis" : cost > 0 ? `$${cost.toFixed(2)}` : "Gratis";
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
                          onChange={() => setShippingMethod(method)}
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

          <div>
            <Label htmlFor="cust-note">Nota de pedido (opcional)</Label>
            <Textarea id="cust-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instrucciones especiales..." className="mt-1.5" rows={2} />
          </div>

          {/* Price breakdown */}
          {hasShipping && (
            <>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "Gratis"}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
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
