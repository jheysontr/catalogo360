import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Store, Upload, Palette, Layout, Share2, Rocket, Loader2, Check,
  ChevronRight, ChevronLeft, Sparkles, Globe, MessageCircle, Instagram, Facebook,
  ImagePlus, X
} from "lucide-react";
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
  { id: "welcome", icon: Rocket, title: "Bienvenida", subtitle: "Comencemos" },
  { id: "identity", icon: Store, title: "Identidad", subtitle: "Nombre y datos" },
  { id: "branding", icon: Palette, title: "Marca", subtitle: "Logo y colores" },
  { id: "template", icon: Layout, title: "Diseño", subtitle: "Elige plantilla" },
  { id: "social", icon: Share2, title: "Contacto", subtitle: "Redes sociales" },
  { id: "done", icon: Check, title: "¡Listo!", subtitle: "Todo configurado" },
];

const STEP_ILLUSTRATIONS = [
  { icon: Rocket, gradient: "from-primary/20 to-accent", title: "Tu catálogo online\nen minutos", desc: "Solo necesitas completar unos pasos sencillos para tener tu tienda lista." },
  { icon: Store, gradient: "from-primary/20 to-accent", title: "Dale identidad\na tu negocio", desc: "Un buen nombre y una URL memorable hacen la diferencia." },
  { icon: Palette, gradient: "from-primary/20 to-accent", title: "Tu marca,\ntu estilo", desc: "Sube tu logo y elige los colores que representen tu negocio." },
  { icon: Layout, gradient: "from-primary/20 to-accent", title: "Diseño que\nenamora", desc: "Elige la plantilla perfecta para mostrar tus productos." },
  { icon: MessageCircle, gradient: "from-primary/20 to-accent", title: "Conecta con\ntus clientes", desc: "Agrega tus redes para que tus clientes te encuentren fácilmente." },
  { icon: Sparkles, gradient: "from-primary/20 to-accent", title: "¡Felicitaciones!", desc: "Tu tienda está lista para recibir clientes." },
];

const SetupWizard = ({ storeId, storeName: initialName, storeSlug: initialSlug, onComplete }: SetupWizardProps) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

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

  const progress = ((step) / (STEPS.length - 1)) * 100;

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
    if (step === 1 && !storeName.trim()) {
      toast.error("El nombre de tu tienda es obligatorio");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const illustration = STEP_ILLUSTRATIONS[step];
  const IllustrationIcon = illustration.icon;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent"
            >
              <Rocket className="h-12 w-12 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                ¡Bienvenido a Catalogo360!
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                En solo 4 pasos tendrás tu catálogo online listo para compartir con tus clientes.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-2">
              {[
                { icon: Store, label: "Nombra" },
                { icon: Palette, label: "Personaliza" },
                { icon: Layout, label: "Diseña" },
                { icon: Share2, label: "Conecta" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-medium">Nombre de tu tienda <span className="text-destructive">*</span></Label>
              <Input
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value);
                  if (!storeSlug || storeSlug.startsWith("tienda")) {
                    setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }
                }}
                className="mt-1.5 h-11"
                placeholder="Ej: Boutique María"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-sm font-medium">URL de tu tienda</Label>
              <div className="mt-1.5 flex items-center rounded-lg border bg-muted/50 overflow-hidden">
                <span className="px-3 py-2.5 text-sm text-muted-foreground whitespace-nowrap border-r bg-muted">
                  <Globe className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                  catalogo360.online/
                </span>
                <Input
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 font-mono text-sm h-11"
                  placeholder="mi-tienda"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Descripción <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 160))}
                maxLength={160}
                rows={3}
                className="mt-1.5 resize-none"
                placeholder="Describe tu tienda en pocas palabras..."
              />
              <div className="mt-1 flex justify-end">
                <span className={`text-xs ${description.length > 140 ? "text-destructive" : "text-muted-foreground"}`}>
                  {description.length}/160
                </span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="font-medium">{c.symbol}</span>
                      <span className="text-muted-foreground ml-2">{c.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Logo */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Logo de tu tienda</Label>
              <div className="flex items-center gap-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-accent/30 group">
                  {logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      <button
                        onClick={() => setLogoUrl(null)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center flex-col gap-1">
                      <ImagePlus className="h-7 w-7 text-primary/40" />
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label>
                    <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" asChild>
                      <span><Upload className="h-3.5 w-3.5" /> {logoUrl ? "Cambiar" : "Subir logo"}</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadFile(file, "logo", setUploadingLogo);
                      if (url) setLogoUrl(url);
                    }} />
                  </label>
                  <p className="text-xs text-muted-foreground">PNG o JPG, máx. 5MB</p>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Banner</Label>
              <div className="relative h-36 w-full overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-accent/30 group">
                {bannerUrl ? (
                  <>
                    <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setBannerUrl(null)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center flex-col gap-2">
                    <ImagePlus className="h-8 w-8 text-primary/40" />
                    <span className="text-xs text-muted-foreground">1200 × 400px recomendado</span>
                  </div>
                )}
                {uploadingBanner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
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
            </div>

            {/* Colors */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Colores de tu marca</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-3 space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Principal</span>
                  <div className="flex items-center gap-2">
                    <label className="relative cursor-pointer">
                      <div
                        className="h-10 w-10 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono text-xs h-9" />
                  </div>
                </div>
                <div className="rounded-xl border p-3 space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Secundario</span>
                  <div className="flex items-center gap-2">
                    <label className="relative cursor-pointer">
                      <div
                        className="h-10 w-10 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                    <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono text-xs h-9" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <motion.button
                  key={t.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTemplate(t.value)}
                  className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                    template === t.value
                      ? "border-primary bg-accent shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-accent/30"
                  }`}
                >
                  {template === t.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                  <span className="text-3xl block">{t.emoji}</span>
                  <p className="mt-2 text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="rounded-xl border bg-accent/30 p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4.5 w-4.5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agrega tus redes para que tus clientes puedan contactarte directamente desde tu tienda.
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp
              </Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1.5 h-11" placeholder="+591 70000000" />
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Instagram className="h-4 w-4 text-primary" /> Instagram
              </Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mt-1.5 h-11" placeholder="@mi_tienda" />
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Facebook className="h-4 w-4 text-primary" /> Facebook
              </Label>
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="mt-1.5 h-11" placeholder="https://facebook.com/mitienda" />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent"
            >
              <Sparkles className="h-12 w-12 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                ¡Todo listo!
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Tu tienda está configurada y lista para recibir clientes.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border bg-accent/30 p-4 space-y-1"
            >
              <p className="text-xs text-muted-foreground">Tu tienda estará disponible en</p>
              <p className="text-sm font-bold text-primary flex items-center gap-1.5 justify-center">
                <Globe className="h-4 w-4" />
                catalogo360.online/{storeSlug}
              </p>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-background overflow-hidden">
      {/* Left panel - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-gradient-to-br from-primary/5 via-accent/30 to-background flex-col items-center justify-center p-10 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/15 to-accent shadow-lg shadow-primary/10"
            >
              <IllustrationIcon className="h-14 w-14 text-primary" />
            </motion.div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground tracking-tight whitespace-pre-line leading-tight">
                {illustration.title}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                {illustration.desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step counter */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className="text-xs font-medium text-muted-foreground">
            Paso {step + 1} de {STEPS.length}
          </span>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm">Catalogo360</span>
          </div>
          {step === 0 && (
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground text-xs">
              Configurar después
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-4 sm:px-8 pb-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          {/* Step pills */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <s.icon className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8">
          <div className="max-w-lg mx-auto pb-8">
            {/* Step header (for form steps) */}
            {step > 0 && step < 5 && (
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {STEPS[step].subtitle}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {step === 1 && "Elige un nombre, URL y moneda para tu tienda."}
                  {step === 2 && "Sube tu logo, banner y elige los colores de tu marca."}
                  {step === 3 && "Selecciona la plantilla que mejor se adapte a tu negocio."}
                  {step === 4 && "¿Cómo pueden contactarte tus clientes?"}
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="border-t bg-card/80 backdrop-blur-sm px-4 sm:px-8 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              {step > 0 && step < 5 && (
                <Button variant="ghost" onClick={prev} className="gap-1.5">
                  <ChevronLeft className="h-4 w-4" /> Atrás
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {step < 5 && (
                <Button onClick={next} className="gap-1.5 h-10 px-6">
                  {step === 0 ? "Comenzar" : "Siguiente"} <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {step === 5 && (
                <Button onClick={handleFinish} disabled={saving} className="gap-2 h-10 px-6">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Ir a mi tienda
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
