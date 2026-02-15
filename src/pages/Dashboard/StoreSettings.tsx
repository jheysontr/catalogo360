import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Store, Palette, Share2 } from "lucide-react";
import toast from "react-hot-toast";

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
}

const StoreSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);

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
    const ext = file.name.split(".").pop();
    const path = `${store?.id}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stores").upload(path, file);
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

    const { error } = await supabase
      .from("stores")
      .update({
        store_name: storeName.trim(),
        description: description.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        banner_url: bannerUrl,
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
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Configuración de Tienda</h1>
        <p className="text-sm text-muted-foreground">Personaliza la apariencia y datos de contacto de tu tienda</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Logo */}
              <div>
                <Label>Logo de tienda</Label>
                <div className="mt-2 flex items-center gap-4">
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
              </div>

              {/* Store name */}
              <div>
                <Label htmlFor="s-name">Nombre de tienda *</Label>
                <Input
                  id="s-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              {/* Slug (read-only) */}
              <div>
                <Label>URL de tu tienda</Label>
                <div className="mt-1.5 flex items-center rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  gocatalog.com/<span className="font-medium text-foreground">{storeSlug}</span>
                </div>
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

              {/* Email */}
              <div>
                <Label htmlFor="s-email">Email de contacto</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  placeholder="contacto@tutienda.com"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="s-phone">Teléfono</Label>
                <Input
                  id="s-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5"
                  placeholder="+1 234 567 890"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="s-address">Dirección</Label>
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
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Banner & Colors */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Personalización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Banner */}
              <div>
                <Label>Banner de tienda</Label>
                <label className="mt-2 block cursor-pointer">
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted">
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
              </div>

              {/* Colors */}
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
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                      maxLength={7}
                    />
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
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div>
                <Label>Vista previa</Label>
                <div className="mt-1.5 overflow-hidden rounded-lg border">
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

          {/* Social Media */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Share2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="s-fb">Facebook</Label>
                <Input
                  id="s-fb"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="mt-1.5"
                  placeholder="https://facebook.com/tutienda"
                />
              </div>
              <div>
                <Label htmlFor="s-ig">Instagram</Label>
                <Input
                  id="s-ig"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="mt-1.5"
                  placeholder="https://instagram.com/tutienda"
                />
              </div>
              <div>
                <Label htmlFor="s-tt">TikTok</Label>
                <Input
                  id="s-tt"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className="mt-1.5"
                  placeholder="https://tiktok.com/@tutienda"
                />
              </div>
              <div>
                <Label htmlFor="s-wa">WhatsApp</Label>
                <Input
                  id="s-wa"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-1.5"
                  placeholder="+1 234 567 890"
                />
                <p className="mt-1 text-xs text-muted-foreground">Se usará para recibir órdenes por WhatsApp</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="mt-8 flex justify-end gap-3 border-t pt-6">
        <Button variant="outline" onClick={handleCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
};

export default StoreSettings;
