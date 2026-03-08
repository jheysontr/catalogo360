import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Plus, Pencil, Trash2, Copy, Loader2, Settings2, DollarSign,
  TrendingUp, UserPlus, CheckCircle, Clock, Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralConfigData {
  id?: string;
  store_id: string;
  is_active: boolean;
  commission_type: string;
  commission_value: number;
  referral_discount_type: string;
  referral_discount_value: number;
  max_commission_orders: number;
}

interface Referrer {
  id: string;
  name: string;
  email: string;
  phone: string;
  referral_code: string;
  total_earned: number;
  total_referrals: number;
  is_active: boolean;
  created_at: string;
}

interface Referral {
  id: string;
  referrer_code: string;
  referrer_name: string;
  referrer_email: string;
  referred_email: string;
  commission_amount: number;
  status: string;
  order_count: number;
  created_at: string;
}

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "REF-";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

const Referrals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Config
  const [config, setConfig] = useState<ReferralConfigData | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Referrers
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReferrer, setEditingReferrer] = useState<Referrer | null>(null);
  const [refName, setRefName] = useState("");
  const [refEmail, setRefEmail] = useState("");
  const [refPhone, setRefPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: stores } = await supabase
        .from("stores")
        .select("id, store_slug")
        .eq("user_id", user.id)
        .limit(1);
      if (stores?.[0]) {
        const sid = stores[0].id;
        setStoreId(sid);
        setStoreSlug(stores[0].store_slug);

        // Load config
        const { data: configData } = await supabase
          .from("referral_config")
          .select("*")
          .eq("store_id", sid)
          .limit(1);
        if (configData?.[0]) {
          setConfig(configData[0] as unknown as ReferralConfigData);
        } else {
          setConfig({
            store_id: sid,
            is_active: false,
            commission_type: "percentage",
            commission_value: 5,
            referral_discount_type: "percentage",
            referral_discount_value: 10,
            max_commission_orders: 3,
          });
        }

        await fetchReferrers(sid);
        await fetchReferrals(sid);
      }
      setLoading(false);
    })();
  }, [user]);

  const fetchReferrers = async (sid: string) => {
    const { data } = await supabase
      .from("referrers")
      .select("*")
      .eq("store_id", sid)
      .order("created_at", { ascending: false });
    setReferrers((data as unknown as Referrer[]) ?? []);
  };

  const fetchReferrals = async (sid: string) => {
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("store_id", sid)
      .order("created_at", { ascending: false });
    setReferrals((data as unknown as Referral[]) ?? []);
  };

  const saveConfig = async () => {
    if (!storeId || !config) return;
    setSavingConfig(true);
    if (config.id) {
      await supabase.from("referral_config").update({
        is_active: config.is_active,
        commission_type: config.commission_type,
        commission_value: config.commission_value,
        referral_discount_type: config.referral_discount_type,
        referral_discount_value: config.referral_discount_value,
        max_commission_orders: config.max_commission_orders,
      }).eq("id", config.id);
    } else {
      const { data } = await supabase.from("referral_config").insert({
        store_id: storeId,
        is_active: config.is_active,
        commission_type: config.commission_type,
        commission_value: config.commission_value,
        referral_discount_type: config.referral_discount_type,
        referral_discount_value: config.referral_discount_value,
        max_commission_orders: config.max_commission_orders,
      }).select("id").single();
      if (data) setConfig((prev) => prev ? { ...prev, id: data.id } : prev);
    }
    setSavingConfig(false);
    toast({ title: "Configuración guardada" });
  };

  const openCreateReferrer = () => {
    setEditingReferrer(null);
    setRefName("");
    setRefEmail("");
    setRefPhone("");
    setDialogOpen(true);
  };

  const openEditReferrer = (r: Referrer) => {
    setEditingReferrer(r);
    setRefName(r.name);
    setRefEmail(r.email);
    setRefPhone(r.phone || "");
    setDialogOpen(true);
  };

  const handleSaveReferrer = async () => {
    if (!storeId) return;
    if (!refName.trim() || !refEmail.trim()) {
      toast({ title: "Error", description: "Nombre y email son obligatorios", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editingReferrer) {
      await supabase.from("referrers").update({
        name: refName.trim(),
        email: refEmail.trim(),
        phone: refPhone.trim(),
      }).eq("id", editingReferrer.id);
      toast({ title: "Referidor actualizado" });
    } else {
      const code = generateCode();
      const { error } = await supabase.from("referrers").insert({
        store_id: storeId,
        name: refName.trim(),
        email: refEmail.trim(),
        phone: refPhone.trim(),
        referral_code: code,
      });
      if (error?.message?.includes("duplicate")) {
        toast({ title: "Error", description: "Este email ya está registrado como referidor", variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Referidor creado" });
    }
    setSaving(false);
    setDialogOpen(false);
    await fetchReferrers(storeId);
  };

  const deleteReferrer = async (id: string) => {
    if (!storeId) return;
    await supabase.from("referrers").delete().eq("id", id);
    toast({ title: "Referidor eliminado" });
    await fetchReferrers(storeId);
  };

  const toggleReferrer = async (r: Referrer) => {
    if (!storeId) return;
    await supabase.from("referrers").update({ is_active: !r.is_active }).eq("id", r.id);
    await fetchReferrers(storeId);
  };

  const copyReferralLink = (code: string) => {
    if (!storeSlug) return;
    const link = `${window.location.origin}/store/${storeSlug}?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "¡Enlace copiado!" });
  };

  const markAsPaid = async (id: string) => {
    if (!storeId) return;
    await supabase.from("referrals").update({ status: "paid" }).eq("id", id);
    toast({ title: "Marcado como pagado" });
    await fetchReferrals(storeId);
  };

  const totalCommissions = referrals.reduce((sum, r) => sum + Number(r.commission_amount), 0);
  const pendingCommissions = referrals.filter((r) => r.status === "pending" || r.status === "completed").reduce((sum, r) => sum + Number(r.commission_amount), 0);
  const paidCommissions = referrals.filter((r) => r.status === "paid").reduce((sum, r) => sum + Number(r.commission_amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Sistema de Referencias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Permite a tus clientes ganar comisiones por referir nuevos compradores
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreateReferrer}>
          <Plus className="h-3.5 w-3.5" /> Agregar referidor
        </Button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{referrers.length}</p>
              <p className="text-xs text-muted-foreground">Referidores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${pendingCommissions.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Comisiones pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${paidCommissions.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Comisiones pagadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrers" className="mt-6">
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="referrers" className="dashboard-tab-trigger gap-1.5">
            <Users className="h-3.5 w-3.5" /> Referidores
          </TabsTrigger>
          <TabsTrigger value="commissions" className="dashboard-tab-trigger gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Comisiones
          </TabsTrigger>
          <TabsTrigger value="config" className="dashboard-tab-trigger gap-1.5">
            <Settings2 className="h-3.5 w-3.5" /> Configuración
          </TabsTrigger>
        </TabsList>

        {/* REFERRERS TAB */}
        <TabsContent value="referrers" className="mt-4">
          {referrers.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Sin referidores aún</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Agrega personas que puedan referir clientes a tu tienda y ganar comisiones.
              </p>
              <Button onClick={openCreateReferrer} className="gap-1.5">
                <Plus className="h-4 w-4" /> Crear primer referidor
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {referrers.map((r) => (
                <Card key={r.id} className={`transition-all ${!r.is_active ? "opacity-50" : ""}`}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-mono">{r.referral_code}</Badge>
                        <span className="text-xs text-muted-foreground">{r.total_referrals} refs · ${Number(r.total_earned).toFixed(2)} ganados</span>
                      </div>
                    </div>
                    <Switch checked={r.is_active} onCheckedChange={() => toggleReferrer(r)} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyReferralLink(r.referral_code)} title="Copiar enlace">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditReferrer(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteReferrer(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* COMMISSIONS TAB */}
        <TabsContent value="commissions" className="mt-4">
          {referrals.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Sin comisiones aún</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Las comisiones aparecerán aquí cuando los clientes referidos realicen compras.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <Card key={ref.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{ref.referrer_name || ref.referrer_code}</p>
                        <Badge variant={ref.status === "paid" ? "default" : ref.status === "completed" ? "secondary" : "outline"} className="text-xs">
                          {ref.status === "paid" ? "Pagado" : ref.status === "completed" ? "Completado" : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Referido: {ref.referred_email || "—"} · Orden #{ref.order_count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground">${Number(ref.commission_amount).toFixed(2)}</p>
                    {ref.status !== "paid" && (
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => markAsPaid(ref.id)}>
                        <CheckCircle className="h-3.5 w-3.5" /> Pagar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CONFIG TAB */}
        <TabsContent value="config" className="mt-4 space-y-6">
          {config && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Sistema de Referencias</span>
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={(v) => setConfig((p) => p ? { ...p, is_active: v } : p)}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {config.is_active ? "El sistema de referencias está activo. Los clientes pueden usar códigos de referido." : "Activa el sistema para permitir que los clientes refieran a otros."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comisión del referidor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de comisión</Label>
                      <Select
                        value={config.commission_type}
                        onValueChange={(v) => setConfig((p) => p ? { ...p, commission_type: v } : p)}
                      >
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        min={0}
                        value={config.commission_value}
                        onChange={(e) => setConfig((p) => p ? { ...p, commission_value: Number(e.target.value) } : p)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Máximo de órdenes comisionables</Label>
                    <Input
                      type="number"
                      min={1}
                      value={config.max_commission_orders}
                      onChange={(e) => setConfig((p) => p ? { ...p, max_commission_orders: Number(e.target.value) } : p)}
                      className="mt-1.5"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Número de compras del referido que generan comisión
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Descuento del referido (nuevo cliente)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de descuento</Label>
                      <Select
                        value={config.referral_discount_type}
                        onValueChange={(v) => setConfig((p) => p ? { ...p, referral_discount_type: v } : p)}
                      >
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        min={0}
                        value={config.referral_discount_value}
                        onChange={(e) => setConfig((p) => p ? { ...p, referral_discount_value: Number(e.target.value) } : p)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={saveConfig} disabled={savingConfig} className="w-full gap-1.5">
                {savingConfig && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar configuración
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Referrer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReferrer ? "Editar referidor" : "Nuevo referidor"}</DialogTitle>
            <DialogDescription>
              {editingReferrer ? "Modifica los datos del referidor" : "Registra una persona que pueda referir clientes"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="ref-name">Nombre *</Label>
              <Input id="ref-name" value={refName} onChange={(e) => setRefName(e.target.value)} placeholder="Juan Pérez" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="ref-email">Email *</Label>
              <Input id="ref-email" type="email" value={refEmail} onChange={(e) => setRefEmail(e.target.value)} placeholder="juan@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="ref-phone">Teléfono</Label>
              <Input id="ref-phone" value={refPhone} onChange={(e) => setRefPhone(e.target.value)} placeholder="+591 12345678" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveReferrer} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingReferrer ? "Guardar cambios" : "Crear referidor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Referrals;
