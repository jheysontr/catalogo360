import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Truck, Package as PackageIcon, Save, Plus, Trash2 } from "lucide-react";

export interface LocalZone {
  name: string;
  cost: number;
}

export interface ShippingConfigData {
  pickup_enabled: boolean;
  pickup_address: string;
  pickup_hours: string;
  local_enabled: boolean;
  local_cost: number;
  local_cities: string;
  local_delivery_days: number;
  local_zones: LocalZone[];
  national_enabled: boolean;
  national_cost: number;
  national_carrier: string;
  national_delivery_days: number;
  free_shipping_threshold: number;
}

const DEFAULT_CONFIG: ShippingConfigData = {
  pickup_enabled: false,
  pickup_address: "",
  pickup_hours: "",
  local_enabled: false,
  local_cost: 0,
  local_cities: "",
  local_delivery_days: 1,
  local_zones: [],
  national_enabled: false,
  national_cost: 0,
  national_carrier: "",
  national_delivery_days: 5,
  free_shipping_threshold: 0,
};

const ShippingConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [storeId, setStoreId] = useState<string | null>(null);
  const [config, setConfig] = useState<ShippingConfigData>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("stores")
        .select("id, shipping_config, address")
        .eq("user_id", user.id)
        .limit(1);
      if (data?.[0]) {
        setStoreId(data[0].id);
        const sc = data[0].shipping_config as Record<string, any> | null;
        if (sc && Object.keys(sc).length > 0) {
          const loaded = { ...DEFAULT_CONFIG, ...sc } as ShippingConfigData;
          // Migrate old single-cost format to zones
          if ((!loaded.local_zones || loaded.local_zones.length === 0) && (loaded.local_cost > 0 || loaded.local_cities)) {
            loaded.local_zones = [{
              name: loaded.local_cities || "Zona local",
              cost: loaded.local_cost || 0,
            }];
          }
          setConfig(loaded);
        } else if (data[0].address) {
          setConfig({ ...DEFAULT_CONFIG, pickup_address: data[0].address || "" });
        }
      }
      setLoading(false);
    })();
  }, [user]);

  const update = (key: keyof ShippingConfigData, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addZone = () => {
    setConfig((prev) => ({
      ...prev,
      local_zones: [...prev.local_zones, { name: "", cost: 0 }],
    }));
  };

  const updateZone = (index: number, field: keyof LocalZone, value: string | number) => {
    setConfig((prev) => {
      const zones = [...prev.local_zones];
      zones[index] = { ...zones[index], [field]: value };
      return { ...prev, local_zones: zones };
    });
  };

  const removeZone = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      local_zones: prev.local_zones.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .update({ shipping_config: config as any })
      .eq("id", storeId);
    if (error) {
      toast({ title: "Error", description: "No se pudo guardar la configuración", variant: "destructive" });
    } else {
      toast({ title: "Configuración de envíos guardada" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Configuración de Envíos</h2>
          <p className="text-sm text-muted-foreground">Configura los métodos de envío disponibles en tu tienda</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </Button>
      </div>

      {/* Free shipping threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Envío gratis</CardTitle>
          <CardDescription>Ofrece envío gratis a partir de un monto mínimo de compra</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label htmlFor="free-threshold" className="whitespace-nowrap">Envío gratis a partir de $</Label>
            <Input
              id="free-threshold"
              type="number"
              min="0"
              step="0.01"
              value={config.free_shipping_threshold || ""}
              onChange={(e) => update("free_shipping_threshold", Number(e.target.value) || 0)}
              placeholder="0 = desactivado"
              className="w-40"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Coloca 0 para desactivar el envío gratis automático</p>
        </CardContent>
      </Card>

      {/* Pickup */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Retiro en Tienda</CardTitle>
                <CardDescription>Gratis — el cliente retira en tu local</CardDescription>
              </div>
            </div>
            <Switch checked={config.pickup_enabled} onCheckedChange={(v) => update("pickup_enabled", v)} />
          </div>
        </CardHeader>
        {config.pickup_enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pickup-address">Dirección de retiro *</Label>
              <Input
                id="pickup-address"
                value={config.pickup_address}
                onChange={(e) => update("pickup_address", e.target.value)}
                placeholder="Ej: Av. Principal #123, Zona Centro"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="pickup-hours">Horario de atención</Label>
              <Input
                id="pickup-hours"
                value={config.pickup_hours}
                onChange={(e) => update("pickup_hours", e.target.value)}
                placeholder="Ej: Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Local with zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Truck className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Envío Local</CardTitle>
                <CardDescription>Agrega zonas con diferentes precios de envío</CardDescription>
              </div>
            </div>
            <Switch checked={config.local_enabled} onCheckedChange={(v) => update("local_enabled", v)} />
          </div>
        </CardHeader>
        {config.local_enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="local-days">Días de entrega estimados</Label>
              <Input
                id="local-days"
                type="number"
                min="1"
                step="1"
                value={config.local_delivery_days}
                onChange={(e) => update("local_delivery_days", Number(e.target.value) || 1)}
                className="mt-1.5 w-32"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Zonas de envío</Label>
                <Button variant="outline" size="sm" onClick={addZone} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Agregar zona
                </Button>
              </div>

              {config.local_zones.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                  No hay zonas configuradas. Agrega una zona para habilitar el envío local.
                </p>
              )}

              {config.local_zones.map((zone, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="flex-1">
                    <Input
                      value={zone.name}
                      onChange={(e) => updateZone(i, "name", e.target.value)}
                      placeholder="Nombre de zona (ej: Centro, Zona Sur)"
                      className="bg-background"
                    />
                  </div>
                  <div className="w-28">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={zone.cost || ""}
                        onChange={(e) => updateZone(i, "cost", Number(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-background pl-7"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeZone(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* National */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <PackageIcon className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Envío Nacional</CardTitle>
                <CardDescription>Envíos a todo el país por transportista</CardDescription>
              </div>
            </div>
            <Switch checked={config.national_enabled} onCheckedChange={(v) => update("national_enabled", v)} />
          </div>
        </CardHeader>
        {config.national_enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="national-cost">Costo de envío ($) *</Label>
                <Input
                  id="national-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={config.national_cost || ""}
                  onChange={(e) => update("national_cost", Number(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="national-days">Días de entrega</Label>
                <Input
                  id="national-days"
                  type="number"
                  min="1"
                  step="1"
                  value={config.national_delivery_days}
                  onChange={(e) => update("national_delivery_days", Number(e.target.value) || 1)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="national-carrier">Transportista</Label>
              <Input
                id="national-carrier"
                value={config.national_carrier}
                onChange={(e) => update("national_carrier", e.target.value)}
                placeholder="Ej: FedEx, DHL, Correos de Bolivia"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ShippingConfig;
