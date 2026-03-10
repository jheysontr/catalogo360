import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Store, Palette, Share2, DollarSign, Layout, MapPin, Mail, Phone, Globe, Eye, Smartphone } from "lucide-react";
import TemplatePreview from "@/components/Dashboard/TemplatePreview";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/imageCompression";

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  social_media: Record<string, string> | null;
  currency: string;
}

const CURRENCIES = [
  { code: "USD", name: "Dólar estadounidense", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "BOB", name: "Boliviano", symbol: "Bs" },
  { code: "ARS", name: "Peso argentino", symbol: "$" },
  { code: "MXN", name: "Peso mexicano", symbol: "$" },
  { code: "CLP", name: "Peso chileno", symbol: "$" },
  { code: "COP", name: "Peso colombiano", symbol: "$" },
  { code: "PEN", name: "Sol peruano", symbol: "S/" },
  { code: "UYU", name: "Peso uruguayo", symbol: "$U" },
  { code: "BRL", name: "Real brasileño", symbol: "R$" },
  { code: "PYG", name: "Guaraní paraguayo", symbol: "₲" },
  { code: "GBP", name: "Libra esterlina", symbol: "£" },
];

const GENERAL_TEMPLATES = [
  { value: "classic", emoji: "🏪", label: "Clásica", desc: "Banner + logo circular" },
  { value: "app", emoji: "📱", label: "App", desc: "Estilo app móvil moderno" },
  { value: "elegante", emoji: "✨", label: "Elegante", desc: "Minimalista y sofisticado" },
  { value: "moderna", emoji: "🚀", label: "Moderna", desc: "Audaz y dinámica" },
];


const StoreSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [storeProducts, setStoreProducts] = useState<Array<{ name: string; price: number; image_url: string | null; description: string | null; on_sale: boolean; discount_percent: number | null }>>([]);

  // Form fields
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2a9d8f");
  const [secondaryColor, setSecondaryColor] = useState("#264653");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [currency, setCurrency] = useState("BOB");
  const [storeTemplate, setStoreTemplate] = useState("classic");
  const [bannerGreeting, setBannerGreeting] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");

  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStore = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (data && data.length > 0) {
        const s = data[0] as StoreData;
        setStore(s);
        setStoreName(s.store_name);
        setStoreSlug(s.store_slug);
        setDescription(s.description ?? "");
        setEmail(s.email ?? "");
        setAddress(s.address ?? "");
        setPrimaryColor(s.primary_color ?? "#2a9d8f");
        setSecondaryColor(s.secondary_color ?? "#264653");
        setLogoUrl(s.logo_url);
        setBannerUrl(s.banner_url);
        const social = (s.social_media ?? {}) as Record<string, string>;
        setFacebook(social.facebook ?? "");
        setInstagram(social.instagram ?? "");
        setTiktok(social.tiktok ?? "");
        setWhatsapp(social.whatsapp ?? "");
        setPhone(social.phone ?? "");
        setCurrency((s as any).currency ?? "BOB");
        const sfConfig = (data[0] as any).storefront_config as Record<string, any> | null;
        setStoreTemplate(sfConfig?.template || "classic");
        setBannerGreeting(sfConfig?.banner_greeting || "");
        setBannerDescription(sfConfig?.banner_description || "");

        // Fetch products for preview
        const { data: prods } = await supabase
          .from("products")
          .select("name, price, image_url, description, on_sale, discount_percent")
          .eq("store_id", s.id)
          .gt("stock", 0)
          .order("created_at", { ascending: false })
          .limit(6);
        setStoreProducts(prods ?? []);
      }
      setLoading(false);
    };
    fetchStore();
  }, [user]);

  const uploadFile = async (
    file: File,
    folder: string,
    setUploading: (v: boolean) => void
  ): Promise<string | null> => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB");
      return null;
    }
    setUploading(true);
    const compressed = await compressImage(file);
    const ext = compressed.name.split(".").pop();
    const path = `${store?.id}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stores").upload(path, compressed);
    setUploading(false);
    if (error) {
      toast.error("Error al subir imagen");
      return null;
    }
    const { data: urlData } = supabase.storage.from("stores").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "logo", setUploadingLogo);
    if (url) setLogoUrl(url);
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "banner", setUploadingBanner);
    if (url) setBannerUrl(url);
  };

  const handleSave = async () => {
    if (!store) return;
    if (!storeName.trim()) {
      toast.error("El nombre de la tienda es requerido");
      return;
    }
    setSaving(true);

    if (!storeSlug.trim() || storeSlug.trim().length < 3) {
      toast.error("La URL debe tener al menos 3 caracteres");
      setSaving(false);
      return;
    }

    const { data: slugCheck } = await supabase
      .from("stores")
      .select("id")
      .eq("store_slug", storeSlug.trim())
      .neq("id", store.id)
      .limit(1);

    if (slugCheck && slugCheck.length > 0) {
      toast.error("Esta URL ya está en uso, elige otra");
      setSaving(false);
      return;
    }

    const existingConfig = (store as any).storefront_config as Record<string, any> || {};
    const updatedStorefrontConfig = {
      ...existingConfig,
      template: storeTemplate,
      banner_greeting: bannerGreeting.trim() || null,
      banner_description: bannerDescription.trim() || null,
    };

    const { error } = await supabase
      .from("stores")
      .update({
        store_name: storeName.trim(),
        store_slug: storeSlug.trim(),
        description: description.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        currency,
        storefront_config: updatedStorefrontConfig,
        social_media: {
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          whatsapp: whatsapp.trim(),
          phone: phone.trim(),
        },
      })
      .eq("id", store.id);

    setSaving(false);
    if (error) {
      toast.error("Error al guardar cambios");
    } else {
      toast.success("Cambios guardados correctamente");
    }
  };

  const handleCancel = () => {
    if (!store) return;
    setStoreName(store.store_name);
    setDescription(store.description ?? "");
    setEmail(store.email ?? "");
    setAddress(store.address ?? "");
    setPrimaryColor(store.primary_color ?? "#2a9d8f");
    setSecondaryColor(store.secondary_color ?? "#264653");
    setLogoUrl(store.logo_url);
    setBannerUrl(store.banner_url);
    const social = (store.social_media ?? {}) as Record<string, string>;
    setFacebook(social.facebook ?? "");
    setInstagram(social.instagram ?? "");
    setTiktok(social.tiktok ?? "");
    setWhatsapp(social.whatsapp ?? "");
    setPhone(social.phone ?? "");
    setCurrency((store as any).currency ?? "BOB");
    const sfConfig = (store as any).storefront_config as Record<string, any> | null;
    setStoreTemplate(sfConfig?.template || "classic");
    setBannerGreeting(sfConfig?.banner_greeting || "");
    setBannerDescription(sfConfig?.banner_description || "");
    toast("Cambios descartados");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const TemplateButton = ({ t }: { t: { value: string; emoji: string; label: string; desc: string } }) => (
    <button
      onClick={() => setStoreTemplate(t.value)}
      className={`rounded-xl border-2 p-3 text-left transition-all ${
        storeTemplate === t.value
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{t.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.label}</p>
          <p className="text-[11px] text-muted-foreground">{t.desc}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground">Administra tu tienda, apariencia y contacto</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <Button variant="outline" onClick={handleCancel} disabled={saving} size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="general" className="dashboard-tab-trigger gap-1.5">
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="apariencia" className="dashboard-tab-trigger gap-1.5">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="plantilla" className="dashboard-tab-trigger gap-1.5">
            <Layout className="h-4 w-4" />
            Plantilla
          </TabsTrigger>
          <TabsTrigger value="contacto" className="dashboard-tab-trigger gap-1.5">
            <Share2 className="h-4 w-4" />
            Contacto
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════ TAB: GENERAL ═══════════════ */}
        <TabsContent value="general" className="mt-6 space-y-6">
          {/* Logo & Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identidad de la tienda</CardTitle>
              <CardDescription>Logo, nombre y URL pública</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-input bg-muted">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Store className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <label>
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <span>
                        <Upload className="h-3.5 w-3.5" /> Cambiar logo
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">Recomendado: 200×200px</p>
                </div>
              </div>

              <Separator />

              {/* Store name */}
              <div>
                <Label htmlFor="s-name">Nombre de tienda *</Label>
                <Input id="s-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1.5" />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="s-slug">URL de tu tienda</Label>
                <div className="mt-1.5 flex items-center gap-0 rounded-md border bg-muted overflow-hidden">
                  <span className="px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">catalogo360.online/</span>
                  <Input
                    id="s-slug"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 font-medium"
                    placeholder="mi-tienda"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Solo letras minúsculas, números y guiones</p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="s-desc">Descripción</Label>
                <Textarea
                  id="s-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 160))}
                  maxLength={160}
                  rows={3}
                  className="mt-1.5"
                  placeholder="Describe tu tienda en pocas palabras"
                />
                <p className="mt-1 text-xs text-muted-foreground">{description.length}/160 caracteres</p>
              </div>
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Moneda
              </CardTitle>
              <CardDescription>Moneda en la que se muestran tus precios</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="s-currency">
                  <SelectValue placeholder="Selecciona moneda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} — {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: APARIENCIA ═══════════════ */}
        <TabsContent value="apariencia" className="mt-6 space-y-6">
          {/* Banner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Banner de portada</CardTitle>
              <CardDescription>Imagen principal que se muestra en tu tienda</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="block cursor-pointer">
                <div className="relative h-44 w-full overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted transition-colors hover:border-primary/40">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Subir banner (800×400px)</span>
                    </div>
                  )}
                  {uploadingBanner && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
              </label>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colores de marca</CardTitle>
              <CardDescription>Define la paleta de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="s-primary">Color primario</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      id="s-primary"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" maxLength={7} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="s-secondary">Color secundario</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      id="s-secondary"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1" maxLength={7} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Live preview */}
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Vista previa
                </Label>
                <div className="overflow-hidden rounded-xl border">
                  <div className="h-16 w-full" style={{ backgroundColor: primaryColor }} />
                  <div className="flex items-center gap-3 p-3" style={{ backgroundColor: secondaryColor }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted" />
                    )}
                    <span className="text-sm font-semibold text-white">{storeName || "Tu Tienda"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banner Texts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Textos del banner</CardTitle>
              <CardDescription>Personaliza los textos que aparecen en el banner de tu tienda. Si los dejas vacíos, se usarán los textos por defecto de la plantilla.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="banner-greeting">Texto de saludo</Label>
                <Input
                  id="banner-greeting"
                  value={bannerGreeting}
                  onChange={(e) => setBannerGreeting(e.target.value.slice(0, 60))}
                  maxLength={60}
                  className="mt-1.5"
                  placeholder="Ej: Bienvenido a, Explora, ¡Descubre lo nuevo!"
                />
                <p className="mt-1 text-xs text-muted-foreground">{bannerGreeting.length}/60 — Deja vacío para usar el texto de la plantilla</p>
              </div>
              <div>
                <Label htmlFor="banner-desc">Subtítulo del banner</Label>
                <Textarea
                  id="banner-desc"
                  value={bannerDescription}
                  onChange={(e) => setBannerDescription(e.target.value.slice(0, 120))}
                  maxLength={120}
                  rows={2}
                  className="mt-1.5"
                  placeholder="Ej: Los mejores productos al mejor precio"
                />
                <p className="mt-1 text-xs text-muted-foreground">{bannerDescription.length}/120 — Deja vacío para usar la descripción de la tienda</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: PLANTILLA ═══════════════ */}
        <TabsContent value="plantilla" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr,auto]">
            {/* Template selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estilo de tienda</CardTitle>
                <CardDescription>Elige cómo se ve tu tienda. Los colores, logo y banner se aplican desde la pestaña Apariencia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* General */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Generales</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GENERAL_TEMPLATES.map((t) => (
                      <TemplateButton key={t.value} t={t} />
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Live preview */}
            <div className="lg:sticky lg:top-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                Vista previa en vivo
              </div>
              <TemplatePreview
                templateId={storeTemplate}
                storeName={storeName}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                description={description}
                products={storeProducts}
                currency={currency}
                customGreeting={bannerGreeting}
                customBannerDescription={bannerDescription}
              />
              <p className="text-center text-[10px] text-muted-foreground">
                Así se verá tu tienda con la plantilla <span className="font-semibold">{[...GENERAL_TEMPLATES, ...NICHE_TEMPLATES].find(t => t.value === storeTemplate)?.label || storeTemplate}</span>
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════ TAB: CONTACTO ═══════════════ */}
        <TabsContent value="contacto" className="mt-6 space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de contacto</CardTitle>
              <CardDescription>Información visible para tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="s-email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                  </Label>
                  <Input
                    id="s-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                    placeholder="contacto@tutienda.com"
                  />
                </div>
                <div>
                  <Label htmlFor="s-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Teléfono
                  </Label>
                  <Input
                    id="s-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="s-address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Dirección
                </Label>
                <Input
                  id="s-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5"
                  placeholder="Calle, ciudad, país"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Redes Sociales
              </CardTitle>
              <CardDescription>Links que aparecen en tu tienda pública</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="s-fb">Facebook</Label>
                  <Input id="s-fb" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="mt-1.5" placeholder="https://facebook.com/tutienda" />
                </div>
                <div>
                  <Label htmlFor="s-ig">Instagram</Label>
                  <Input id="s-ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mt-1.5" placeholder="https://instagram.com/tutienda" />
                </div>
                <div>
                  <Label htmlFor="s-tt">TikTok</Label>
                  <Input id="s-tt" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="mt-1.5" placeholder="https://tiktok.com/@tutienda" />
                </div>
                <div>
                  <Label htmlFor="s-wa">WhatsApp</Label>
                  <Input id="s-wa" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1.5" placeholder="+1 234 567 890" />
                  <p className="mt-1 text-xs text-muted-foreground">Se usará para recibir órdenes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreSettings;
