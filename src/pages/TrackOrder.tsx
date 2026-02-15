import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search, Loader2, Package, Truck, MapPin, CheckCircle2, Clock, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_STEPS = [
  { key: "pending", label: "Pendiente", icon: Clock },
  { key: "processing", label: "Procesando", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle2 },
];

const METHOD_LABELS: Record<string, string> = {
  pickup: "Retiro en tienda",
  local: "Envío local",
  national: "Envío nacional",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });

interface ShipmentResult {
  id: string;
  tracking_number: string | null;
  status: string;
  shipping_method: string;
  address: string | null;
  city: string | null;
  cost: number;
  estimated_delivery_date: string | null;
  created_at: string;
  order_id: string;
  customer_name?: string;
  items?: any[];
  total_price?: number;
  currency?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", BOB: "Bs", EUR: "€", ARS: "$", COP: "$", PEN: "S/", MXN: "$", BRL: "R$", CLP: "$", PYG: "₲",
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShipmentResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Auto-search from URL param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      // Trigger search after state update
      setTimeout(() => {
        document.querySelector<HTMLFormElement>("form")?.requestSubmit();
      }, 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    const q = query.trim().toUpperCase();
    if (!q || q.length < 3) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);

    // Search by tracking number first
    let { data: shipments } = await supabase
      .from("shipments")
      .select("*")
      .ilike("tracking_number", `%${q}%`)
      .limit(1);

    // If not found, try searching by order ID prefix
    if (!shipments?.length) {
      const { data: allShipments } = await supabase
        .from("shipments")
        .select("*");
      
      if (allShipments) {
        shipments = allShipments.filter(s => 
          s.order_id.toUpperCase().startsWith(q) || 
          s.order_id.toUpperCase().includes(q)
        ).slice(0, 1);
      }
    }

    if (!shipments?.length) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const shipment = shipments[0];

    // Fetch order details
    const { data: order } = await supabase
      .from("orders")
      .select("customer_name, items, total_price, store_id")
      .eq("id", shipment.order_id)
      .single();

    // Fetch store currency
    if (order?.store_id) {
      const { data: store } = await supabase
        .from("stores")
        .select("currency")
        .eq("id", order.store_id)
        .single();
      if (store?.currency) {
        setCurrencySymbol(CURRENCY_SYMBOLS[store.currency] || store.currency);
      }
    }

    setResult({
      ...shipment,
      customer_name: order?.customer_name,
      items: order?.items as any[],
      total_price: order?.total_price,
    });
    setLoading(false);
  };

  const currentStepIndex = result
    ? STATUS_STEPS.findIndex((s) => s.key === result.status)
    : -1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Rastrear Pedido</h1>
            <p className="text-xs text-muted-foreground">Ingresa tu número de rastreo o ID de orden</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="TRK-XXXXXXXX o ID de orden..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 font-mono uppercase"
                />
              </div>
              <Button type="submit" disabled={loading || query.trim().length < 3}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Not found */}
        {notFound && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Package className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold text-foreground">No encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No se encontró ningún envío con ese número. Verifica e intenta nuevamente.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Status Progress */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Estado del envío</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      result.status === "delivered"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : result.status === "shipped"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : result.status === "processing"
                        ? "bg-orange-100 text-orange-800 border-orange-200"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {STATUS_STEPS[currentStepIndex]?.label || result.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Visual stepper */}
                <div className="flex items-center justify-between py-4">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-1 flex-col items-center relative">
                        {i > 0 && (
                          <div
                            className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${
                              i <= currentStepIndex ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                            isCurrent
                              ? "border-primary bg-primary text-primary-foreground scale-110"
                              : isActive
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Shipment Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Detalles del envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {result.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rastreo</span>
                    <span className="font-mono font-medium">{result.tracking_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método</span>
                  <span>{METHOD_LABELS[result.shipping_method] || result.shipping_method}</span>
                </div>
                {result.estimated_delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrega estimada</span>
                    <span className="font-medium">{fmtDate(result.estimated_delivery_date)}</span>
                  </div>
                )}
                {result.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dirección</span>
                    <span className="text-right max-w-[60%]">
                      {result.address}{result.city ? `, ${result.city}` : ""}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de pedido</span>
                  <span>{fmtDate(result.created_at)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            {result.items && result.items.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.customer_name && (
                    <p className="text-sm text-muted-foreground">
                      Cliente: <span className="font-medium text-foreground">{result.customer_name}</span>
                    </p>
                  )}
                  <Separator />
                  {result.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {result.cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span>{currencySymbol}{result.cost.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{currencySymbol}{(result.total_price || 0).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackOrder;
