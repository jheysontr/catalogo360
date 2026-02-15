import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Link2, Plus, Pencil, Trash2, GripVertical, ExternalLink, Eye, Copy, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const ICON_OPTIONS = [
  { value: "🔗", label: "Enlace" },
  { value: "🌐", label: "Web" },
  { value: "📱", label: "WhatsApp" },
  { value: "📸", label: "Instagram" },
  { value: "📘", label: "Facebook" },
  { value: "🎵", label: "TikTok" },
  { value: "🐦", label: "Twitter/X" },
  { value: "📺", label: "YouTube" },
  { value: "💼", label: "LinkedIn" },
  { value: "🛒", label: "Tienda" },
  { value: "📧", label: "Email" },
  { value: "📍", label: "Ubicación" },
  { value: "📄", label: "Documento" },
  { value: "🎨", label: "Portafolio" },
  { value: "💬", label: "Chat" },
];

const Linkbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("🔗");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("stores")
        .select("id, store_slug")
        .eq("user_id", user.id)
        .limit(1);
      if (data?.[0]) {
        setStoreId(data[0].id);
        setStoreSlug(data[0].store_slug);
        await fetchLinks(data[0].id);
      }
      setLoading(false);
    })();
  }, [user]);

  const fetchLinks = async (sid: string) => {
    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("store_id", sid)
      .order("sort_order", { ascending: true });
    setLinks((data as LinkItem[]) ?? []);
  };

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setUrl("");
    setIcon("🔗");
    setDialogOpen(true);
  };

  const openEdit = (link: LinkItem) => {
    setEditing(link);
    setTitle(link.title);
    setUrl(link.url);
    setIcon(link.icon || "🔗");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!storeId) return;
    if (!title.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }
    if (!url.trim()) {
      toast({ title: "Error", description: "La URL es obligatoria", variant: "destructive" });
      return;
    }
    // Basic URL validation
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    setSaving(true);
    if (editing) {
      await supabase
        .from("links")
        .update({ title: title.trim(), url: finalUrl, icon })
        .eq("id", editing.id);
      toast({ title: "Enlace actualizado" });
    } else {
      const maxOrder = links.length > 0 ? Math.max(...links.map((l) => l.sort_order)) + 1 : 0;
      await supabase
        .from("links")
        .insert({ store_id: storeId, title: title.trim(), url: finalUrl, icon, sort_order: maxOrder });
      toast({ title: "Enlace creado" });
    }
    setSaving(false);
    setDialogOpen(false);
    await fetchLinks(storeId);
  };

  const handleDelete = async (id: string) => {
    if (!storeId) return;
    await supabase.from("links").delete().eq("id", id);
    toast({ title: "Enlace eliminado" });
    await fetchLinks(storeId);
  };

  const toggleActive = async (link: LinkItem) => {
    if (!storeId) return;
    await supabase.from("links").update({ is_active: !link.is_active }).eq("id", link.id);
    await fetchLinks(storeId);
  };

  const moveLink = async (index: number, direction: "up" | "down") => {
    if (!storeId) return;
    const newLinks = [...links];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;

    const tempOrder = newLinks[index].sort_order;
    newLinks[index].sort_order = newLinks[swapIndex].sort_order;
    newLinks[swapIndex].sort_order = tempOrder;

    await Promise.all([
      supabase.from("links").update({ sort_order: newLinks[index].sort_order }).eq("id", newLinks[index].id),
      supabase.from("links").update({ sort_order: newLinks[swapIndex].sort_order }).eq("id", newLinks[swapIndex].id),
    ]);
    await fetchLinks(storeId);
  };

  const copyLinkboxUrl = () => {
    if (!storeSlug) return;
    const url = `${window.location.origin}/linkbox/${storeSlug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "¡URL copiada!" });
  };

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
          <h1 className="font-display text-2xl font-bold text-foreground">Linkbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu página de enlaces personalizada tipo Linktree
          </p>
        </div>
        <div className="flex gap-2">
          {storeSlug && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={copyLinkboxUrl}>
                <Copy className="h-3.5 w-3.5" /> Copiar URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a href={`/linkbox/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-3.5 w-3.5" /> Vista previa
                </a>
              </Button>
            </>
          )}
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Agregar enlace
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Sin enlaces aún</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Agrega tus redes sociales, sitio web y otros enlaces para compartirlos en una sola página.
          </p>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Crear primer enlace
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {links.map((link, index) => (
            <Card
              key={link.id}
              className={`transition-all ${!link.is_active ? "opacity-50" : ""}`}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveLink(index, "up")}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveLink(index, "down")}
                    disabled={index === links.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </button>
                </div>

                <span className="text-2xl">{link.icon || "🔗"}</span>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{link.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                </div>

                <Switch
                  checked={link.is_active}
                  onCheckedChange={() => toggleActive(link)}
                />

                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(link)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar enlace" : "Nuevo enlace"}</DialogTitle>
            <DialogDescription>
              {editing ? "Modifica los datos de tu enlace" : "Agrega un nuevo enlace a tu Linkbox"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Ícono</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setIcon(opt.value)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl transition-colors ${
                      icon === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-muted hover:bg-accent"
                    }`}
                    title={opt.label}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="link-title">Título *</Label>
              <Input
                id="link-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mi Instagram"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/mitienda"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Guardar cambios" : "Crear enlace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Linkbox;
