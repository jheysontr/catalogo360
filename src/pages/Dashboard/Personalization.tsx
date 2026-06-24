import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { effectiveUserId } from "@/lib/impersonation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ResponsiveTabsList from "@/components/Dashboard/ResponsiveTabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, Store, Palette, Layout, Eye, Image as ImageIcon, Type } from "lucide-react";
import TemplatePreview from "@/components/Dashboard/TemplatePreview";
import { STOREFRONT_FONTS, getFontStack } from "@/lib/storefrontFonts";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/imageCompression";

interface StoreData {
  id: string;
  store_name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  currency: string;
}

const TEMPLATES = [
  { value: "classic", emoji: "🏪", label: "Clásica", desc: "Banner + logo circular" },
  { value: "app", emoji: "📱", label: "App", desc: "Estilo app móvil moderno" },
  { value: "elegante", emoji: "✨", label: "Elegante", desc: "Minimalista y sofisticado" },
  { value: "moderna", emoji: "🚀", label: "Moderna", desc: "Audaz y dinámica" },
];

const Personalization = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [storefrontConfig, setStorefrontConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("apariencia");
  const [storeProducts, setStoreProducts] = useState<Array<{ name: string; price: number; image_url: string | null; description: string | null; on_sale: boolean; discount_percent: number | null }>>([]);

  // Form fields
  const [primaryColor, setPrimaryColor] = useState("#2a9d8f");
  const [secondaryColor, setSecondaryColor] = useState("#264653");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [storeTemplate, setStoreTemplate] = useState("classic");
  const [bannerGreeting, setBannerGreeting] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStore = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", effectiveUserId(user.id)!)
        .limit(1);

      if (data && data.length > 0) {
        const s = data[0] as any;
        setStore(s as StoreData);
        setPrimaryColor(s.primary_color ?? "#2a9d8f");
        setSecondaryColor(s.secondary_color ?? "#264653");
        setLogoUrl(s.logo_url);
        setBannerUrl(s.banner_url);
        const sfConfig = (s.storefront_config as Record<string, any>) || {};
        setStorefrontConfig(sfConfig);
        setStoreTemplate(sfConfig.template || "classic");
        setBannerGreeting(sfConfig.banner_greeting || "");
        setBannerDescription(sfConfig.banner_description || "");

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

  const uploadFile = async (file: File, folder: string, setUploading: (v: boolean) => void): Promise<string | null> => {
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
    setSaving(true);

    const updatedStorefrontConfig = {
      ...storefrontConfig,
      template: storeTemplate,
      banner_greeting: bannerGreeting.trim() || null,
      banner_description: bannerDescription.trim() || null,
    };

    const { error } = await supabase
      .from("stores")
      .update({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        storefront_config: updatedStorefrontConfig,
      })
      .eq("id", store.id);

    setSaving(false);
    if (error) {
      toast.error("Error al guardar cambios");
    } else {
      toast.success("Personalización guardada");
      setStorefrontConfig(updatedStorefrontConfig);
    }
  };

  const handleCancel = () => {
    if (!store) return;
    setPrimaryColor(store.primary_color ?? "#2a9d8f");
    setSecondaryColor(store.secondary_color ?? "#264653");
    setLogoUrl(store.logo_url);
    setBannerUrl(store.banner_url);
    setStoreTemplate(storefrontConfig.template || "classic");
    setBannerGreeting(storefrontConfig.banner_greeting || "");
    setBannerDescription(storefrontConfig.banner_description || "");
    toast("Cambios descartados");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Personalización</h1>
          <p className="text-sm text-muted-foreground">Logo, banner, colores, plantilla y textos visuales</p>
        </div>
        <div className="mt-3 flex gap-2 sm:mt-0">
          <Button variant="outline" onClick={handleCancel} disabled={saving} size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ResponsiveTabsList
          value={activeTab}
          onValueChange={setActiveTab}
          options={[
            { value: "apariencia", label: "Apariencia", icon: <Palette className="h-4 w-4" /> },
            { value: "imagenes", label: "Imágenes", icon: <ImageIcon className="h-4 w-4" /> },
            { value: "plantilla", label: "Plantilla", icon: <Layout className="h-4 w-4" /> },
          ]}
        />

        {/* APARIENCIA */}
        <TabsContent value="apariencia" className="mt-6 space-y-6">
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

              <div>
                <Label className="mb-1.5 flex items-center gap-1.5">
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
                    <span className="text-sm font-semibold text-white">{store?.store_name || "Tu Tienda"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Textos del banner</CardTitle>
              <CardDescription>Personaliza los textos del banner. Si los dejas vacíos se usan los de la plantilla.</CardDescription>
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
                <p className="mt-1 text-xs text-muted-foreground">{bannerGreeting.length}/60</p>
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
                <p className="mt-1 text-xs text-muted-foreground">{bannerDescription.length}/120</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMÁGENES */}
        <TabsContent value="imagenes" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
              <CardDescription>Imagen cuadrada, recomendado 200×200px</CardDescription>
            </CardHeader>
            <CardContent>
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
                <label>
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <span>
                      <Upload className="h-3.5 w-3.5" /> Cambiar logo
                    </span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Banner de portada</CardTitle>
              <CardDescription>Imagen principal que se muestra en tu tienda (800×400px)</CardDescription>
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
        </TabsContent>

        {/* PLANTILLA */}
        <TabsContent value="plantilla" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Elige el estilo de tu tienda</CardTitle>
              <CardDescription>Compara las plantillas y selecciona la que más te guste.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setStoreTemplate(t.value)}
                    className={`group relative rounded-2xl border-2 p-3 text-left transition-all ${
                      storeTemplate === t.value
                        ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    {storeTemplate === t.value && (
                      <div className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                        ✓ Activa
                      </div>
                    )}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">{t.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                    <div className="pointer-events-none origin-top scale-[0.85] transform">
                      <TemplatePreview
                        templateId={t.value}
                        storeName={store?.store_name || ""}
                        logoUrl={logoUrl}
                        bannerUrl={bannerUrl}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        description={store?.description ?? ""}
                        products={storeProducts}
                        currency={store?.currency || "BOB"}
                        customGreeting={bannerGreeting}
                        customBannerDescription={bannerDescription}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Personalization;
