import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

const EMOJI_GRID = [
  "👕", "👗", "👔", "👠", "👜", "💄", "⌚", "💍", "🧢", "👟",
  "📱", "💻", "⌨️", "🖱️", "🎮", "📷", "🎧", "📺", "🎬", "🔌",
  "🏠", "🛋️", "🛏️", "🚪", "🪑", "🧹", "🧴", "🧼", "🪴", "🕯️",
  "🍔", "🍕", "🍰", "🎂", "🍪", "🥗", "🥤", "☕", "🍫", "🍎",
  "💊", "🧴", "💅", "🪥", "🧖", "🏋️", "⚽", "🎨", "📚", "✏️",
];

const SUGGESTED_CATEGORIES = [
  { name: "Ropa", icon: "👕" },
  { name: "Electrónica", icon: "📱" },
  { name: "Accesorios", icon: "👜" },
  { name: "Alimentos", icon: "🍔" },
  { name: "Belleza", icon: "💄" },
  { name: "Hogar", icon: "🏠" },
];

const Categories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("📦");
  const [formDesc, setFormDesc] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setStoreId(data[0].id); });
  }, [user]);

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("id, name, icon")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    setCategories(data ?? []);

    // Fetch product counts per category
    const { data: products } = await supabase
      .from("products")
      .select("category_id")
      .eq("store_id", storeId);
    const counts: Record<string, number> = {};
    products?.forEach((p) => { if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1; });
    setProductCounts(counts);
    setLoading(false);
  }, [storeId]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const resetForm = () => { setFormName(""); setFormIcon("📦"); setFormDesc(""); setEditing(null); };

  const openAdd = () => { resetForm(); setModalOpen(true); };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon || "📦");
    setFormDesc("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!storeId) return;
    const name = formName.trim();
    if (!name || name.length < 2) {
      toast({ title: "Error", description: "El nombre debe tener al menos 2 caracteres", variant: "destructive" });
      return;
    }
    if (name.length > 30) {
      toast({ title: "Error", description: "El nombre no puede superar 30 caracteres", variant: "destructive" });
      return;
    }
    // Unique check
    const duplicate = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== editing?.id
    );
    if (duplicate) {
      toast({ title: "Error", description: "Ya existe una categoría con ese nombre", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = { name, icon: formIcon, store_id: storeId };

    if (editing) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
      else toast({ title: "Categoría actualizada" });
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) toast({ title: "Error", description: "Error al crear", variant: "destructive" });
      else toast({ title: "Categoría creada" });
    }
    setSaving(false);
    setModalOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    // Nullify category on products
    await supabase.from("products").update({ category_id: null }).eq("category_id", deleteTarget.id);
    const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Error", description: "Error al eliminar", variant: "destructive" });
    else toast({ title: "Categoría eliminada" });
    setDeleteTarget(null);
    fetchCategories();
  };

  const handleSuggestion = (s: { name: string; icon: string }) => {
    setFormName(s.name);
    setFormIcon(s.icon);
    setFormDesc("");
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Categorías</h1>
          <p className="text-sm text-muted-foreground">{categories.length} categorías creadas</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Nueva categoría
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        /* Empty state */
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">No tienes categorías aún</h3>
              <p className="mt-1 text-sm text-muted-foreground">Crea tu primera categoría o usa nuestras plantillas</p>
            </div>
            <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
              {SUGGESTED_CATEGORIES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => handleSuggestion(s)}
                  className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Category grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="text-5xl leading-none">{cat.icon || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {productCounts[cat.id] || 0} producto{(productCounts[cat.id] || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
            <DialogDescription>
              {editing ? "Modifica los detalles de la categoría" : "Crea una nueva categoría para organizar tus productos"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <Label htmlFor="cat-name">Nombre *</Label>
              <Input
                id="cat-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nombre de categoría (2-30 chars)"
                className="mt-1.5"
                maxLength={30}
              />
              <p className="mt-1 text-xs text-muted-foreground">{formName.length}/30</p>
            </div>

            <div>
              <Label>Icono / Emoji</Label>
              <div className="mt-1.5 grid grid-cols-10 gap-1.5 rounded-lg border p-3">
                {EMOJI_GRID.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormIcon(emoji)}
                    className={`flex h-9 w-9 items-center justify-center rounded-md text-lg transition-colors ${
                      formIcon === emoji
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cat-desc">Descripción (opcional)</Label>
                <span className="text-xs text-muted-foreground">{formDesc.length}/100</span>
              </div>
              <Textarea
                id="cat-desc"
                value={formDesc}
                onChange={(e) => { if (e.target.value.length <= 100) setFormDesc(e.target.value); }}
                placeholder="Descripción breve de la categoría"
                className="mt-1.5"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Los productos de esta categoría quedarán sin categoría asignada. Esta acción no se puede deshacer.
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

export default Categories;
