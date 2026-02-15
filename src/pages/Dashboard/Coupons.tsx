import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Loader2, MoreVertical, Pencil, Trash2, Ticket, Copy,
} from "lucide-react";

interface Coupon {
  id: string;
  store_id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const Coupons = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [storeId, setStoreId] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  // Form
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<string>("percentage");
  const [formValue, setFormValue] = useState("");
  const [formMinPurchase, setFormMinPurchase] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formExpires, setFormExpires] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      if (data?.[0]) {
        setStoreId(data[0].id);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (storeId) fetchCoupons();
  }, [storeId]);

  const fetchCoupons = async () => {
    if (!storeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    if (!error && data) setCoupons(data as unknown as Coupon[]);
    setLoading(false);
  };

  const resetForm = () => {
    setFormCode("");
    setFormDescription("");
    setFormType("percentage");
    setFormValue("");
    setFormMinPurchase("");
    setFormMaxUses("");
    setFormActive(true);
    setFormExpires("");
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setFormCode(c.code);
    setFormDescription(c.description || "");
    setFormType(c.discount_type);
    setFormValue(String(c.discount_value));
    setFormMinPurchase(c.min_purchase ? String(c.min_purchase) : "");
    setFormMaxUses(c.max_uses != null ? String(c.max_uses) : "");
    setFormActive(c.is_active);
    setFormExpires(c.expires_at ? c.expires_at.slice(0, 16) : "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const code = formCode.trim().toUpperCase();
    if (!code) {
      toast({ title: "Error", description: "El código es requerido", variant: "destructive" });
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      toast({ title: "Error", description: "El código solo puede contener letras, números, guiones y guiones bajos", variant: "destructive" });
      return;
    }
    const value = Number(formValue);
    if (isNaN(value) || value <= 0) {
      toast({ title: "Error", description: "El valor del descuento debe ser mayor a 0", variant: "destructive" });
      return;
    }
    if (formType === "percentage" && value > 100) {
      toast({ title: "Error", description: "El porcentaje no puede ser mayor a 100", variant: "destructive" });
      return;
    }
    // Validate max 2 decimals
    const decimalPart = formValue.split(".")[1];
    if (decimalPart && decimalPart.length > 2) {
      toast({ title: "Error", description: "Máximo 2 decimales", variant: "destructive" });
      return;
    }

    const minPurchase = formMinPurchase ? Number(formMinPurchase) : 0;
    if (isNaN(minPurchase) || minPurchase < 0) {
      toast({ title: "Error", description: "La compra mínima debe ser >= 0", variant: "destructive" });
      return;
    }

    const maxUses = formMaxUses ? Number(formMaxUses) : null;
    if (maxUses !== null && (isNaN(maxUses) || maxUses < 1 || !Number.isInteger(maxUses))) {
      toast({ title: "Error", description: "Los usos máximos deben ser un número entero >= 1", variant: "destructive" });
      return;
    }

    const expiresAt = formExpires ? new Date(formExpires).toISOString() : null;

    setSaving(true);

    const payload = {
      code,
      description: formDescription.trim(),
      discount_type: formType,
      discount_value: value,
      min_purchase: minPurchase,
      max_uses: maxUses,
      is_active: formActive,
      expires_at: expiresAt,
    };

    if (editing) {
      const { error } = await supabase
        .from("coupons")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Error", description: error.message.includes("duplicate") ? "Ya existe un cupón con ese código" : "Error al actualizar", variant: "destructive" });
      } else {
        toast({ title: "Cupón actualizado" });
        setModalOpen(false);
        resetForm();
        fetchCoupons();
      }
    } else {
      const { error } = await supabase
        .from("coupons")
        .insert({ ...payload, store_id: storeId! });
      if (error) {
        toast({ title: "Error", description: error.message.includes("duplicate") ? "Ya existe un cupón con ese código" : "Error al crear cupón", variant: "destructive" });
      } else {
        toast({ title: "Cupón creado" });
        setModalOpen(false);
        resetForm();
        fetchCoupons();
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("coupons").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error", description: "Error al eliminar cupón", variant: "destructive" });
    } else {
      toast({ title: "Cupón eliminado" });
      fetchCoupons();
    }
    setDeleteTarget(null);
  };

  const toggleActive = async (c: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (!error) fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado" });
  };

  const isExpired = (c: Coupon) => c.expires_at && new Date(c.expires_at) < new Date();
  const isMaxedOut = (c: Coupon) => c.max_uses !== null && c.used_count >= c.max_uses;

  const getStatusBadge = (c: Coupon) => {
    if (!c.is_active) return <Badge variant="secondary">Inactivo</Badge>;
    if (isExpired(c)) return <Badge variant="destructive">Expirado</Badge>;
    if (isMaxedOut(c)) return <Badge variant="destructive">Agotado</Badge>;
    return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Activo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Cupones</h1>
          <p className="text-sm text-muted-foreground">Gestiona los cupones de descuento de tu tienda</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Crear cupón
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
          <Ticket className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">Sin cupones</h3>
          <p className="mt-1 text-sm text-muted-foreground">Crea tu primer cupón de descuento</p>
          <Button className="mt-4 gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Crear cupón
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead className="hidden md:table-cell">Compra mín.</TableHead>
                <TableHead className="hidden md:table-cell">Usos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Expira</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {c.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}%`
                      : `$${c.discount_value.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.min_purchase > 0 ? `$${c.min_purchase.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.max_uses != null ? `${c.used_count}/${c.max_uses}` : `${c.used_count}/∞`}
                  </TableCell>
                  <TableCell>{getStatusBadge(c)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
                      : "Sin expiración"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(c)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(c)}>
                          {c.is_active ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) resetForm(); setModalOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar cupón" : "Crear cupón"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Modifica los datos del cupón" : "Configura un nuevo cupón de descuento"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="coupon-code">Código *</Label>
              <Input
                id="coupon-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="Ej: VERANO20"
                className="mt-1.5 font-mono"
                maxLength={30}
              />
              <p className="mt-1 text-xs text-muted-foreground">Solo letras, números, guiones y guiones bajos</p>
            </div>

            <div>
              <Label htmlFor="coupon-desc">Descripción</Label>
              <Textarea
                id="coupon-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ej: Descuento de verano"
                className="mt-1.5"
                rows={2}
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de descuento</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="coupon-value">Valor *</Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder={formType === "percentage" ? "Ej: 20" : "Ej: 5.00"}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon-min">Compra mínima ($)</Label>
                <Input
                  id="coupon-min"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formMinPurchase}
                  onChange={(e) => setFormMinPurchase(e.target.value)}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="coupon-max-uses">Usos máximos</Label>
                <Input
                  id="coupon-max-uses"
                  type="number"
                  min="1"
                  step="1"
                  value={formMaxUses}
                  onChange={(e) => setFormMaxUses(e.target.value)}
                  placeholder="Ilimitado"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="coupon-expires">Fecha de expiración</Label>
              <Input
                id="coupon-expires"
                type="datetime-local"
                value={formExpires}
                onChange={(e) => setFormExpires(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={formActive} onCheckedChange={setFormActive} id="coupon-active" />
              <Label htmlFor="coupon-active">Cupón activo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Guardar cambios" : "Crear cupón"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cupón?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el cupón <span className="font-mono font-semibold">{deleteTarget?.code}</span> de forma permanente.
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

export default Coupons;
