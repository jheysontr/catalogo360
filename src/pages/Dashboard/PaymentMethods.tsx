import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Banknote, Building2, QrCode, X, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/imageCompression";

export interface PaymentMethodsConfig {
  cash: { enabled: boolean; label: string; instructions: string };
  bank_transfer: { enabled: boolean; label: string; details: string };
  qr: { enabled: boolean; label: string; image_url: string };
}

const DEFAULT_CONFIG: PaymentMethodsConfig = {
  cash: { enabled: true, label: "Efectivo", instructions: "" },
  bank_transfer: { enabled: false, label: "Transferencia Bancaria", details: "" },
  qr: { enabled: false, label: "Pago por QR", image_url: "" },
};

const PaymentMethods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [config, setConfig] = useState<PaymentMethodsConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stores")
        .select("id, payment_methods")
        .eq("user_id", user.id)
        .limit(1);
      if (data?.[0]) {
        setStoreId(data[0].id);
        const pm = data[0].payment_methods as Record<string, any> | null;
        if (pm && typeof pm === "object") {
          setConfig({
            cash: { ...DEFAULT_CONFIG.cash, ...(pm.cash || {}) },
            bank_transfer: { ...DEFAULT_CONFIG.bank_transfer, ...(pm.bank_transfer || {}) },
            qr: { ...DEFAULT_CONFIG.qr, ...(pm.qr || {}) },
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const updateMethod = <K extends keyof PaymentMethodsConfig>(
    method: K,
    field: keyof PaymentMethodsConfig[K],
    value: any
  ) => {
    setConfig((prev) => ({
      ...prev,
      [method]: { ...prev[method], [field]: value },
    }));
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "La imagen no debe superar 5MB", variant: "destructive" });
      return;
    }
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      toast({ title: "Solo JPG, PNG o WebP", variant: "destructive" });
      return;
    }
    setUploadingQr(true);
    const compressed = await compressImage(file);
    const ext = compressed.name.split(".").pop();
    const path = `${storeId}/qr-payment-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stores").upload(path, compressed);
    if (error) {
      toast({ title: "Error al subir imagen", variant: "destructive" });
      setUploadingQr(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("stores").getPublicUrl(path);
    updateMethod("qr", "image_url", urlData.publicUrl);
    setUploadingQr(false);
    toast({ title: "Imagen QR subida" });
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!storeId) return;
    // Validate at least one method enabled
    if (!config.cash.enabled && !config.bank_transfer.enabled && !config.qr.enabled) {
      toast({ title: "Debes habilitar al menos un método de pago", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .update({ payment_methods: config as any })
      .eq("id", storeId);
    setSaving(false);
    if (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } else {
      toast({ title: "Métodos de pago guardados" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Métodos de Pago</h1>
        <p className="text-sm text-muted-foreground">
          Configura los métodos de pago que tus clientes verán al completar su pedido
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cash */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-base">Efectivo</CardTitle>
            </div>
            <Switch
              checked={config.cash.enabled}
              onCheckedChange={(v) => updateMethod("cash", "enabled", v)}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre del método</Label>
              <Input
                value={config.cash.label}
                onChange={(e) => updateMethod("cash", "label", e.target.value)}
                placeholder="Efectivo"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Instrucciones (opcional)</Label>
              <Textarea
                value={config.cash.instructions}
                onChange={(e) => updateMethod("cash", "instructions", e.target.value)}
                placeholder="Ej: Pagar al momento de la entrega"
                className="mt-1.5"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/40">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base">Transferencia Bancaria</CardTitle>
            </div>
            <Switch
              checked={config.bank_transfer.enabled}
              onCheckedChange={(v) => updateMethod("bank_transfer", "enabled", v)}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre del método</Label>
              <Input
                value={config.bank_transfer.label}
                onChange={(e) => updateMethod("bank_transfer", "label", e.target.value)}
                placeholder="Transferencia Bancaria"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Datos bancarios</Label>
              <Textarea
                value={config.bank_transfer.details}
                onChange={(e) => updateMethod("bank_transfer", "details", e.target.value)}
                placeholder={"Banco: ...\nCuenta: ...\nTitular: ...\nCI/NIT: ..."}
                className="mt-1.5"
                rows={4}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Estos datos se mostrarán al cliente cuando seleccione este método
              </p>
            </div>
          </CardContent>
        </Card>

        {/* QR Payment */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/40">
                <QrCode className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Pago por QR</CardTitle>
            </div>
            <Switch
              checked={config.qr.enabled}
              onCheckedChange={(v) => updateMethod("qr", "enabled", v)}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label>Nombre del método</Label>
                  <Input
                    value={config.qr.label}
                    onChange={(e) => updateMethod("qr", "label", e.target.value)}
                    placeholder="Pago por QR"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Imagen QR de pago</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sube la imagen del código QR de tu cuenta bancaria o billetera digital
                  </p>
                  <label className="mt-2 block cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5" asChild disabled={uploadingQr}>
                        <span>
                          {uploadingQr ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          {config.qr.image_url ? "Cambiar imagen" : "Subir imagen QR"}
                        </span>
                      </Button>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleQrUpload}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {config.qr.image_url ? (
                  <div className="relative">
                    <img
                      src={config.qr.image_url}
                      alt="QR de pago"
                      className="h-48 w-48 rounded-lg border object-contain bg-white p-2"
                    />
                    <button
                      onClick={() => updateMethod("qr", "image_url", "")}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-muted/30">
                    <ImagePlus className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground text-center px-4">
                      Sube tu imagen QR
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar métodos de pago
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethods;
