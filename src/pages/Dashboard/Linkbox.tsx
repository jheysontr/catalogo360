import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Link2, Plus, Pencil, Trash2, GripVertical, ExternalLink, Eye, Copy, Loader2,
  Palette, Type, Layout,
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

interface LinkboxConfig {
  bio?: string;
  theme?: string;
  buttonStyle?: string;
  fontFamily?: string;
  showStoreLink?: boolean;
  showLogo?: boolean;
  backgroundType?: string;
  customBgColor1?: string;
  customBgColor2?: string;
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
  { value: "🎙️", label: "Podcast" },
  { value: "📰", label: "Blog" },
  { value: "🎮", label: "Gaming" },
  { value: "🎁", label: "Ofertas" },
  { value: "📞", label: "Teléfono" },
];

const THEMES = [
  { value: "gradient", label: "Degradado", preview: "bg-gradient-to-br from-primary to-secondary" },
  { value: "dark", label: "Oscuro", preview: "bg-gray-900" },
  { value: "light", label: "Claro", preview: "bg-gray-100" },
  { value: "neon", label: "Neón", preview: "bg-purple-900" },
  { value: "nature", label: "Naturaleza", preview: "bg-green-800" },
  { value: "sunset", label: "Atardecer", preview: "bg-gradient-to-br from-orange-500 to-pink-500" },
  { value: "ocean", label: "Océano", preview: "bg-gradient-to-br from-cyan-600 to-blue-800" },
  { value: "custom", label: "Personalizado", preview: "bg-muted" },
];

const BUTTON_STYLES = [
  { value: "rounded", label: "Redondeado" },
  { value: "pill", label: "Píldora" },
  { value: "square", label: "Cuadrado" },
  { value: "outline", label: "Contorno" },
  { value: "shadow", label: "Con sombra" },
  { value: "glass", label: "Cristal" },
];

const FONTS = [
  { value: "default", label: "Por defecto" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monoespaciada" },
  { value: "cursive", label: "Cursiva" },
];

const Linkbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LinkboxConfig>({
    bio: "",
    theme: "gradient",
    buttonStyle: "rounded",
    fontFamily: "default",
    showStoreLink: true,
    showLogo: true,
    backgroundType: "gradient",
    customBgColor1: "#6366f1",
    customBgColor2: "#8b5cf6",
  });
  const [savingConfig, setSavingConfig] = useState(false);

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
        .select("id, store_slug, linkbox_config")
        .eq("user_id", user.id)
        .limit(1);
      if (data?.[0]) {
        setStoreId(data[0].id);
        setStoreSlug(data[0].store_slug);
        if (data[0].linkbox_config && typeof data[0].linkbox_config === "object") {
          setConfig((prev) => ({ ...prev, ...(data[0].linkbox_config as LinkboxConfig) }));
        }
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
    const linkUrl = `${window.location.origin}/linkbox/${storeSlug}`;
    navigator.clipboard.writeText(linkUrl);
    toast({ title: "¡URL copiada!" });
  };

  const saveConfig = async () => {
    if (!storeId) return;
    setSavingConfig(true);
    const { error } = await supabase
      .from("stores")
      .update({ linkbox_config: config as any })
      .eq("id", storeId);
    setSavingConfig(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configuración guardada" });
    }
  };

  const updateConfig = (key: keyof LinkboxConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
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
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
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

      <Tabs defaultValue="links" className="mt-6">
        <TabsList>
          <TabsTrigger value="links" className="gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> Enlaces
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Apariencia
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5">
            <Type className="h-3.5 w-3.5" /> Contenido
          </TabsTrigger>
        </TabsList>

        {/* LINKS TAB */}
        <TabsContent value="links" className="mt-4">
          {links.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
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
            <div className="space-y-3">
              {links.map((link, index) => (
                <Card key={link.id} className={`transition-all ${!link.is_active ? "opacity-50" : ""}`}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveLink(index, "up")} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </button>
                      <button onClick={() => moveLink(index, "down")} disabled={index === links.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </button>
                    </div>
                    <span className="text-2xl">{link.icon || "🔗"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{link.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <Switch checked={link.is_active} onCheckedChange={() => toggleActive(link)} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(link)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(link.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="mt-4 space-y-6">
          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" /> Tema de Fondo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => updateConfig("theme", theme.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      config.theme === theme.value ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`h-10 w-full rounded-md ${theme.preview}`} />
                    <span className="text-xs font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
              {config.theme === "custom" && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Color 1</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.customBgColor1 || "#6366f1"}
                        onChange={(e) => updateConfig("customBgColor1", e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded border"
                      />
                      <Input value={config.customBgColor1 || "#6366f1"} onChange={(e) => updateConfig("customBgColor1", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Color 2</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.customBgColor2 || "#8b5cf6"}
                        onChange={(e) => updateConfig("customBgColor2", e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded border"
                      />
                      <Input value={config.customBgColor2 || "#8b5cf6"} onChange={(e) => updateConfig("customBgColor2", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Button style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layout className="h-4 w-4" /> Estilo de Botones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {BUTTON_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => updateConfig("buttonStyle", style.value)}
                    className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                      config.buttonStyle === style.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Font */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4" /> Tipografía
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={config.fontFamily || "default"} onValueChange={(v) => updateConfig("fontFamily", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Button onClick={saveConfig} disabled={savingConfig} className="w-full gap-1.5">
            {savingConfig && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar apariencia
          </Button>
        </TabsContent>

        {/* CONTENT TAB */}
        <TabsContent value="content" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biografía / Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.bio || ""}
                onChange={(e) => updateConfig("bio", e.target.value)}
                placeholder="Escribe una breve descripción sobre ti o tu negocio..."
                className="min-h-[100px]"
                maxLength={200}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">{(config.bio || "").length}/200 caracteres</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opciones de visualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar logo</Label>
                  <p className="text-xs text-muted-foreground">Muestra el logo de tu tienda en el Linkbox</p>
                </div>
                <Switch checked={config.showLogo !== false} onCheckedChange={(v) => updateConfig("showLogo", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enlace a la tienda</Label>
                  <p className="text-xs text-muted-foreground">Muestra un botón para visitar tu tienda</p>
                </div>
                <Switch checked={config.showStoreLink !== false} onCheckedChange={(v) => updateConfig("showStoreLink", v)} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveConfig} disabled={savingConfig} className="w-full gap-1.5">
            {savingConfig && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar contenido
          </Button>
        </TabsContent>
      </Tabs>

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
                      icon === opt.value ? "border-primary bg-primary/10" : "border-transparent bg-muted hover:bg-accent"
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
              <Input id="link-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mi Instagram" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="link-url">URL *</Label>
              <Input id="link-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://instagram.com/mitienda" className="mt-1.5" />
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
