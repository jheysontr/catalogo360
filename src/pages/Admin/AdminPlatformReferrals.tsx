import { useEffect, useState } from "react";
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
  TrendingUp, UserPlus, CheckCircle, Clock, Link2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface PlatformConfig {
  id: string;
  is_active: boolean;
  commission_type: string;
  commission_value: number;
  min_plan_price: number;
  welcome_message: string;
}

interface PlatformReferrer {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  referral_code: string;
  total_earned: number;
  total_referrals: number;
  is_active: boolean;
  created_at: string;
}

interface PlatformReferral {
  id: string;
  referrer_id: string;
  referrer_code: string;
  referred_email: string;
  referred_store_name: string;
  plan_name: string;
  plan_price: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "PLT-";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

const AdminPlatformReferrals = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [referrers, setReferrers] = useState<PlatformReferrer[]>([]);
  const [referrals, setReferrals] = useState<PlatformReferral[]>([]);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReferrer, setEditingReferrer] = useState<PlatformReferrer | null>(null);
  const [refName, setRefName] = useState("");
  const [refEmail, setRefEmail] = useState("");
  const [refPhone, setRefPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [configRes, referrersRes, referralsRes] = await Promise.all([
      supabase.from("platform_referral_config" as any).select("*").limit(1),
      supabase.from("platform_referrers" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("platform_referrals" as any).select("*").order("created_at", { ascending: false }),
    ]);
    if ((configRes.data as any)?.[0]) setConfig((configRes.data as any)[0]);
    setReferrers((referrersRes.data as any) ?? []);
    setReferrals((referralsRes.data as any) ?? []);
    setLoading(false);
  };

  const saveConfig = async () => {
    if (!config) return;
    setSavingConfig(true);
    await supabase.from("platform_referral_config" as any).update({
      is_active: config.is_active,
      commission_type: config.commission_type,
      commission_value: config.commission_value,
      min_plan_price: config.min_plan_price,
      welcome_message: config.welcome_message,
    } as any).eq("id", config.id);
    setSavingConfig(false);
    toast({ title: "Configuración guardada" });
  };

  const openCreate = () => {
    setEditingReferrer(null);
    setRefName(""); setRefEmail(""); setRefPhone("");
    setDialogOpen(true);
  };

  const openEdit = (r: PlatformReferrer) => {
    setEditingReferrer(r);
    setRefName(r.name); setRefEmail(r.email); setRefPhone(r.phone || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!refName.trim() || !refEmail.trim()) {
      toast({ title: "Error", description: "Nombre y email son obligatorios", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editingReferrer) {
      await supabase.from("platform_referrers" as any).update({
        name: refName.trim(), email: refEmail.trim(), phone: refPhone.trim(),
      } as any).eq("id", editingReferrer.id);
      toast({ title: "Referidor actualizado" });
    } else {
      const code = generateCode();
      const { error } = await supabase.from("platform_referrers" as any).insert({
        name: refName.trim(), email: refEmail.trim(), phone: refPhone.trim(), referral_code: code,
      } as any);
      if (error?.message?.includes("duplicate")) {
        toast({ title: "Error", description: "Este email ya existe", variant: "destructive" });
        setSaving(false); return;
      }
      toast({ title: "Referidor creado" });
    }
    setSaving(false);
    setDialogOpen(false);
    loadData();
  };

  const deleteReferrer = async (id: string) => {
    await supabase.from("platform_referrers" as any).delete().eq("id", id);
    toast({ title: "Referidor eliminado" });
    loadData();
  };

  const toggleReferrer = async (r: PlatformReferrer) => {
    await supabase.from("platform_referrers" as any).update({ is_active: !r.is_active } as any).eq("id", r.id);
    loadData();
  };

  const markAsPaid = async (id: string) => {
    await supabase.from("platform_referrals" as any).update({ status: "paid" } as any).eq("id", id);
    toast({ title: "Marcado como pagado" });
    loadData();
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "¡Enlace copiado!" });
  };

  const copyAffiliatePage = (code: string) => {
    const link = `${window.location.origin}/affiliate/${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "¡Página de afiliado copiada!" });
  };

  const pendingCommissions = referrals.filter((r) => r.status !== "paid").reduce((s, r) => s + Number(r.commission_amount), 0);
  const paidCommissions = referrals.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.commission_amount), 0);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Referencias de Plataforma</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona el programa de afiliados para referir nuevos vendedores
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> Agregar referidor
        </Button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{referrers.length}</p>
              <p className="text-xs text-muted-foreground">Afiliados</p>
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
              <p className="text-xs text-muted-foreground">Pendientes</p>
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
              <p className="text-xs text-muted-foreground">Pagadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrers" className="mt-6">
        <TabsList>
          <TabsTrigger value="referrers" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Afiliados</TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Comisiones</TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5"><Settings2 className="h-3.5 w-3.5" /> Configuración</TabsTrigger>
        </TabsList>

        {/* REFERRERS */}
        <TabsContent value="referrers" className="mt-4">
          {referrers.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Sin afiliados aún</h2>
              <p className="max-w-sm text-sm text-muted-foreground">Agrega personas que recomienden la plataforma y ganen comisiones por cada plan contratado.</p>
              <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Crear primer afiliado</Button>
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
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-mono">{r.referral_code}</Badge>
                        <span className="text-xs text-muted-foreground">{r.total_referrals} refs · ${Number(r.total_earned).toFixed(2)} ganados</span>
                      </div>
                    </div>
                    <Switch checked={r.is_active} onCheckedChange={() => toggleReferrer(r)} />
                    <div className="flex gap-1 flex-wrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(r.referral_code)} title="Copiar enlace de registro">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyAffiliatePage(r.referral_code)} title="Copiar página de afiliado">
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
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

        {/* COMMISSIONS */}
        <TabsContent value="commissions" className="mt-4">
          {referrals.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Sin comisiones aún</h2>
              <p className="max-w-sm text-sm text-muted-foreground">Las comisiones aparecerán cuando los referidos contraten un plan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => {
                const referrer = referrers.find((r) => r.id === ref.referrer_id);
                return (
                  <Card key={ref.id}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{referrer?.name || ref.referrer_code}</p>
                          <Badge variant={ref.status === "paid" ? "default" : "outline"} className="text-xs">
                            {ref.status === "paid" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Referido: {ref.referred_email || "—"} · Plan: {ref.plan_name || "—"} (${Number(ref.plan_price).toFixed(2)})
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-lg font-bold text-foreground">${Number(ref.commission_amount).toFixed(2)}</p>
                      {ref.status !== "paid" && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => markAsPaid(ref.id)}>
                          <CheckCircle className="h-3.5 w-3.5" /> Pagar
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* CONFIG */}
        <TabsContent value="config" className="mt-4 space-y-6">
          {config && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Programa de Afiliados</span>
                    <Switch checked={config.is_active} onCheckedChange={(v) => setConfig((p) => p ? { ...p, is_active: v } : p)} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {config.is_active ? "El programa de afiliados está activo." : "Activa el programa para permitir que las personas refieran nuevos vendedores."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Comisión por referido</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={config.commission_type} onValueChange={(v) => setConfig((p) => p ? { ...p, commission_type: v } : p)}>
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <Input type="number" min={0} value={config.commission_value} onChange={(e) => setConfig((p) => p ? { ...p, commission_value: Number(e.target.value) } : p)} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label>Precio mínimo del plan para comisionar</Label>
                    <Input type="number" min={0} value={config.min_plan_price} onChange={(e) => setConfig((p) => p ? { ...p, min_plan_price: Number(e.target.value) } : p)} className="mt-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Mensaje de bienvenida (página de afiliado)</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    value={config.welcome_message}
                    onChange={(e) => setConfig((p) => p ? { ...p, welcome_message: e.target.value } : p)}
                    rows={3}
                  />
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReferrer ? "Editar afiliado" : "Nuevo afiliado"}</DialogTitle>
            <DialogDescription>{editingReferrer ? "Modifica los datos del afiliado" : "Registra una persona como afiliado de la plataforma"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="plt-name">Nombre *</Label>
              <Input id="plt-name" value={refName} onChange={(e) => setRefName(e.target.value)} placeholder="Juan Pérez" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="plt-email">Email *</Label>
              <Input id="plt-email" type="email" value={refEmail} onChange={(e) => setRefEmail(e.target.value)} placeholder="juan@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="plt-phone">Teléfono</Label>
              <Input id="plt-phone" value={refPhone} onChange={(e) => setRefPhone(e.target.value)} placeholder="+591 12345678" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingReferrer ? "Guardar cambios" : "Crear afiliado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlatformReferrals;
