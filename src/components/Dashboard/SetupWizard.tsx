import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Upload, Palette, Layout, Share2, Rocket, Loader2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface SetupWizardProps {
  storeId: string;
  storeName: string;
  storeSlug: string;
  onComplete: () => void;
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
  { code: "BRL", name: "Real brasileño", symbol: "R$" },
];

const TEMPLATES = [
  { value: "classic", emoji: "🏪", label: "Clásica", desc: "Banner + logo circular" },
  { value: "app", emoji: "📱", label: "App", desc: "Estilo app móvil" },
  { value: "elegante", emoji: "✨", label: "Elegante", desc: "Minimalista y sofisticado" },
  { value: "moderna", emoji: "🚀", label: "Moderna", desc: "Audaz y dinámica" },
  { value: "comida", emoji: "🍔", label: "Comida", desc: "Restaurantes y delivery" },
  { value: "frutas", emoji: "🍎", label: "Frutas", desc: "Productos frescos" },
  { value: "moda", emoji: "👗", label: "Moda", desc: "Fashion editorial" },
  { value: "electronica", emoji: "🔌", label: "Electrónica", desc: "Tech y gadgets" },
];

const STEPS = [
  { id: "welcome", icon: Rocket, title: "¡Bienvenido!" },
  { id: "identity", icon: Store, title: "Tu tienda" },
  { id: "branding", icon: Palette, title: "Apariencia" },
  { id: "template", icon: Layout, title: "Plantilla" },
  { id: "social", icon: Share2, title: "Contacto" },
  { id: "done", icon: Check, title: "¡Listo!" },
];

const SetupWizard = ({ storeId, storeName: initialName, storeSlug: initialSlug, onComplete }: SetupWizardProps) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [storeName, setStoreName] = useState(initialName || "");
  const [storeSlug, setStoreSlug] = useState(initialSlug || "");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("BOB");
  const [primaryColor, setPrimaryColor] = useState("#2a9d8f");
  const [secondaryColor, setSecondaryColor] = useState("#264653");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [template, setTemplate] = useState("classic");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const uploadFile = async (file: File, folder: string, setUploading: (v: boolean) => void): Promise<string | null> => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB");
      return null;
    }
    setUploading(true);
    const compressed = await compressImage(file);
    const ext = compressed.name.split(".").pop();
    const path = `${storeId}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stores").upload(path, compressed);
    setUploading(false);
    if (error) {
      toast.error("Error al subir imagen");
      return null;
    }
    const { data: urlData } = supabase.storage.from("stores").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleFinish = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .update({
        store_name: storeName.trim() || initialName,
        store_slug: storeSlug.trim() || initialSlug,
        description: description.trim() || null,
        currency,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        storefront_config: { template },
        social_media: {
          whatsapp: whatsapp.trim(),
          instagram: instagram.trim(),
          facebook: facebook.trim(),
        },
        setup_completed: true,
      } as any)
      .eq("id", storeId);

    setSaving(false);
    if (error) {
      toast.error("Error al guardar configuración");
    } else {
      toast.success("¡Tienda configurada exitosamente!");
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const next = () => {
    // Validate required fields on identity step
    if (step === 1 && !storeName.trim()) {
      toast.error("El nombre de tu tienda es obligatorio");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">¡Bienvenido a Catalogo360!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configuremos tu tienda en unos pocos pasos para que puedas empezar a vender rápidamente.
            </p>
          </div>
        );

      case 1: // Identity
        return (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-foreground">Datos de tu tienda</h2>
              <p className="text-sm text-muted-foreground">Nombre, URL y descripción</p>
            </div>
            <div>
              <Label>Nombre de tu tienda *</Label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1" placeholder="Mi Tienda" />
            </div>
            <div>
              <Label>URL de tu tienda</Label>
              <div className="mt-1 flex items-center rounded-md border bg-muted overflow-hidden">
                <span className="px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">catalogo360.online/</span>
                <Input
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 font-medium"
                  placeholder="mi-tienda"
                />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 160))}
                maxLength={160}
                rows={3}
                className="mt-1"
                placeholder="Describe tu tienda en pocas palabras"
              />
              <p className="mt-1 text-xs text-muted-foreground">{description.length}/160</p>
            </div>
            <div>
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.symbol} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2: // Branding
        return (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-foreground">Apariencia</h2>
              <p className="text-sm text-muted-foreground">Logo, banner y colores</p>
            </div>

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
                    <span><Upload className="h-3.5 w-3.5" /> Subir logo</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFile(file, "logo", setUploadingLogo);
                    if (url) setLogoUrl(url);
                  }} />
                </label>
                <p className="mt-1 text-xs text-muted-foreground">Recomendado: 200×200px</p>
              </div>
            </div>

            {/* Banner */}
            <div>
              <Label>Banner</Label>
              <div className="mt-1 relative h-32 w-full overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center flex-col gap-1">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Subir banner</span>
                  </div>
                )}
                {uploadingBanner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFile(file, "banner", setUploadingBanner);
                    if (url) setBannerUrl(url);
                  }} />
                </label>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Recomendado: 1200×400px</p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color principal</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border-0" />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono text-sm" />
                </div>
              </div>
              <div>
                <Label>Color secundario</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border-0" />
                  <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono text-sm" />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Template
        return (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-foreground">Elige tu plantilla</h2>
              <p className="text-sm text-muted-foreground">Puedes cambiarla después en Configuración</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTemplate(t.value)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    template === t.value
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <p className="mt-1 text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Social
        return (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-foreground">Contacto y redes</h2>
              <p className="text-sm text-muted-foreground">¿Cómo te contactan tus clientes?</p>
            </div>
            <div>
              <Label>WhatsApp (con código de país)</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1" placeholder="+591 70000000" />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mt-1" placeholder="@mi_tienda" />
            </div>
            <div>
              <Label>Facebook</Label>
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="mt-1" placeholder="https://facebook.com/mitienda" />
            </div>
          </div>
        );

      case 5: // Done
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">¡Todo listo!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Tu tienda está configurada. Ahora puedes agregar productos y compartir tu catálogo.
            </p>
            <div className="rounded-lg bg-muted p-3 inline-block">
              <p className="text-sm text-muted-foreground">Tu tienda estará en:</p>
              <p className="text-sm font-bold text-primary">catalogo360.online/{storeSlug}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      {/* Top progress section */}
      <div className="w-full max-w-2xl mx-auto px-4 pt-6 sm:pt-10">
        {/* Progress bar */}
        <div className="mb-6 flex items-center justify-between gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step indicators */}
        <div className="mb-4 flex justify-center gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className={`flex flex-col items-center gap-1 transition-all ${i === step ? "opacity-100" : "opacity-30"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-[10px] text-muted-foreground hidden sm:block">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content area - centered and scrollable */}
      <div className="flex-1 overflow-y-auto flex items-start sm:items-center justify-center px-4 pb-4">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border bg-card p-6 shadow-lg min-h-[340px] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t">
              <div>
                {step > 0 && step < 5 && (
                  <Button variant="ghost" size="sm" onClick={prev} className="gap-1">
                    <ChevronLeft className="h-4 w-4" /> Atrás
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {step === 0 && (
                  <Button variant="ghost" size="sm" onClick={handleSkip} disabled={saving}>
                    Configurar después
                  </Button>
                )}
                {step < 5 && (
                  <Button size="sm" onClick={next} className="gap-1">
                    {step === 0 ? "Comenzar" : "Siguiente"} <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                {step === 5 && (
                  <Button onClick={handleFinish} disabled={saving} className="gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Ir a mi tienda
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
