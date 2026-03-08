import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface PlanRow {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  max_products: number;
  max_stores: number;
  features: string[];
  store_count: number;
  enabled_modules: Record<string, boolean>;
}

const AVAILABLE_MODULES = [
  { key: "linkbox", label: "Linkbox" },
  { key: "coupons", label: "Cupones" },
  { key: "shipments", label: "Envíos" },
  { key: "analytics", label: "Estadísticas avanzadas" },
];

const emptyForm = {
  name: "",
  monthly_price: "",
  annual_price: "",
  max_products: "",
  max_stores: "1",
  features: "",
  enabled_modules: { linkbox: false, coupons: false, shipments: false, analytics: false } as Record<string, boolean>,
};

const AdminPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const [plansRes, storesRes] = await Promise.all([
      supabase.from("pricing_plans").select("*"),
      supabase.from("stores").select("plan_id"),
    ]);

    const planCounts: Record<string, number> = {};
    (storesRes.data || []).forEach((s: any) => {
      if (s.plan_id) planCounts[s.plan_id] = (planCounts[s.plan_id] || 0) + 1;
    });

    const mapped = (plansRes.data || []).map((p: any) => ({
      ...p,
      features: Array.isArray(p.features) ? p.features : [],
      enabled_modules: (p.enabled_modules && typeof p.enabled_modules === "object") ? p.enabled_modules : {},
      store_count: planCounts[p.id] || 0,
    }));

    setPlans(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (plan: PlanRow) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      monthly_price: String(plan.monthly_price),
      annual_price: String(plan.annual_price),
      max_products: String(plan.max_products),
      max_stores: String(plan.max_stores),
      features: plan.features.join("\n"),
      enabled_modules: { ...emptyForm.enabled_modules, ...plan.enabled_modules },
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      monthly_price: parseFloat(form.monthly_price) || 0,
      annual_price: parseFloat(form.annual_price) || 0,
      max_products: parseInt(form.max_products) || 10,
      max_stores: parseInt(form.max_stores) || 1,
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      enabled_modules: form.enabled_modules,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("pricing_plans").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("pricing_plans").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Plan actualizado" : "Plan creado" });
    setDialogOpen(false);
    fetchPlans();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("pricing_plans").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plan eliminado" });
      fetchPlans();
    }
    setDeleteId(null);
  };

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Gestión de Planes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crea, edita y elimina planes de precios</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Plan
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <p className="text-sm">No hay planes creados aún</p>
            <Button variant="outline" onClick={openCreate} className="mt-2 gap-2">
              <Plus className="h-4 w-4" /> Crear primer plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Mensual</TableHead>
                <TableHead>Anual</TableHead>
                <TableHead>Máx. Productos</TableHead>
                <TableHead>Máx. Tiendas</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Tiendas asignadas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>${plan.monthly_price}</TableCell>
                  <TableCell>${plan.annual_price}</TableCell>
                  <TableCell>{plan.max_products}</TableCell>
                  <TableCell>{plan.max_stores}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {AVAILABLE_MODULES.filter(m => plan.enabled_modules[m.key]).map(m => (
                        <Badge key={m.key} variant="default" className="text-xs">{m.label}</Badge>
                      ))}
                      {AVAILABLE_MODULES.every(m => !plan.enabled_modules[m.key]) && (
                        <span className="text-xs text-muted-foreground">Ninguno</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.store_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setDeleteId(plan.id); setDeleteName(plan.name); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Plan" : "Nuevo Plan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Ej: Pro" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Precio mensual ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.monthly_price} onChange={(e) => updateField("monthly_price", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Precio anual ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.annual_price} onChange={(e) => updateField("annual_price", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Máx. productos</Label>
                <Input type="number" min="1" value={form.max_products} onChange={(e) => updateField("max_products", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Máx. tiendas</Label>
                <Input type="number" min="1" value={form.max_stores} onChange={(e) => updateField("max_stores", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Características (una por línea)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.features}
                onChange={(e) => updateField("features", e.target.value)}
                placeholder={"Hasta 200 productos\nSoporte 24/7\nEstadísticas avanzadas"}
              />
            </div>
            <div className="space-y-3">
              <Label>Módulos habilitados</Label>
              {AVAILABLE_MODULES.map((mod) => (
                <div key={mod.key} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">{mod.label}</span>
                  <Switch
                    checked={form.enabled_modules[mod.key] || false}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        enabled_modules: { ...prev.enabled_modules, [mod.key]: checked },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar cambios" : "Crear plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plan "{deleteName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las tiendas asignadas a este plan quedarán sin plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPlans;
