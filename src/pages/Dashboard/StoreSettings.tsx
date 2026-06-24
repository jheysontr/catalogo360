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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Store, Share2, DollarSign, MapPin, Mail, Phone, Globe } from "lucide-react";
import toast from "react-hot-toast";

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  email: string | null;
  address: string | null;
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

const StoreSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [currency, setCurrency] = useState("BOB");

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
        const s = data[0] as StoreData;
        setStore(s);
        setStoreName(s.store_name);
        setStoreSlug(s.store_slug);
        setDescription(s.description ?? "");
        setEmail(s.email ?? "");
        setAddress(s.address ?? "");
        const social = (s.social_media ?? {}) as Record<string, string>;
        setFacebook(social.facebook ?? "");
        setInstagram(social.instagram ?? "");
        setTiktok(social.tiktok ?? "");
        setWhatsapp(social.whatsapp ?? "");
        setPhone(social.phone ?? "");
        setCurrency((s as any).currency ?? "BOB");
      }
      setLoading(false);
    };
    fetchStore();
  }, [user]);

  const handleSave = async () => {
    if (!store) return;
    if (!storeName.trim()) {
      toast.error("El nombre de la tienda es requerido");
      return;
    }
    if (!storeSlug.trim() || storeSlug.trim().length < 3) {
      toast.error("La URL debe tener al menos 3 caracteres");
      return;
    }
    setSaving(true);

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

    const { error } = await supabase
      .from("stores")
      .update({
        store_name: storeName.trim(),
        store_slug: storeSlug.trim(),
        description: description.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        currency,
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
      toast.success("Ajustes guardados correctamente");
    }
  };

  const handleCancel = () => {
    if (!store) return;
    setStoreName(store.store_name);
    setStoreSlug(store.store_slug);
    setDescription(store.description ?? "");
    setEmail(store.email ?? "");
    setAddress(store.address ?? "");
    const social = (store.social_media ?? {}) as Record<string, string>;
    setFacebook(social.facebook ?? "");
    setInstagram(social.instagram ?? "");
    setTiktok(social.tiktok ?? "");
    setWhatsapp(social.whatsapp ?? "");
    setPhone(social.phone ?? "");
    setCurrency((store as any).currency ?? "BOB");
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
          <h1 className="font-display text-2xl font-bold text-foreground">Ajustes</h1>
          <p className="text-sm text-muted-foreground">Datos de tu tienda, moneda y contacto</p>
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
            { value: "general", label: "General", icon: <Store className="h-4 w-4" /> },
            { value: "contacto", label: "Contacto", icon: <Share2 className="h-4 w-4" /> },
          ]}
        />

        {/* GENERAL */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identidad de la tienda</CardTitle>
              <CardDescription>Nombre, URL pública y descripción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="s-name">Nombre de tienda *</Label>
                <Input id="s-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="s-slug">URL de tu tienda</Label>
                <div className="mt-1.5 flex items-center gap-0 overflow-hidden rounded-md border bg-muted">
                  <span className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground">catalogo360.online/</span>
                  <Input
                    id="s-slug"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="border-0 bg-transparent font-medium shadow-none focus-visible:ring-0"
                    placeholder="mi-tienda"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Solo letras minúsculas, números y guiones</p>
              </div>

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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
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

        {/* CONTACTO */}
        <TabsContent value="contacto" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de contacto</CardTitle>
              <CardDescription>Información visible para tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="s-email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                  </Label>
                  <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="contacto@tutienda.com" />
                </div>
                <div>
                  <Label htmlFor="s-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Teléfono
                  </Label>
                  <Input id="s-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" placeholder="+1 234 567 890" />
                </div>
              </div>
              <div>
                <Label htmlFor="s-address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Dirección
                </Label>
                <Input id="s-address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5" placeholder="Calle, ciudad, país" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-primary" />
                Redes Sociales
              </CardTitle>
              <CardDescription>Links que aparecen en tu tienda pública</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
