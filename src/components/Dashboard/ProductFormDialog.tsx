import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ──────────────────────────────────────── */

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  extra_images: unknown;
  variant_stock: unknown;
  on_sale: boolean;
  discount_percent: number | null;
  category_id: string | null;
  store_id: string;
  attributes: unknown;
}

export interface Category {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  storeId: string;
  categories: Category[];
  onSaved: () => void;
  onDelete: (product: Product) => void;
}

const generateSlug = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const discountedPrice = (price: number, discount: number) =>
  (price * (1 - discount / 100)).toFixed(2);

const ProductFormDialog = ({ open, onOpenChange, editingProduct, storeId, categories, onSaved, onDelete }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formOnSale, setFormOnSale] = useState(false);
  const [formDiscount, setFormDiscount] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formExtraImages, setFormExtraImages] = useState<string[]>([]);
  const [formExtraFiles, setFormExtraFiles] = useState<File[]>([]);
  const [formSlug, setFormSlug] = useState("");
  const [formMetaDesc, setFormMetaDesc] = useState("");
  const [formAttributes, setFormAttributes] = useState<ProductAttribute[]>([]);
  const [formVariantStock, setFormVariantStock] = useState<Record<string, number>>({});
  const [formVariantPrices, setFormVariantPrices] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize form when dialog opens or editingProduct changes
  const initializeForm = () => {
    if (editingProduct) {
      setFormName(editingProduct.name);
      setFormDescription(editingProduct.description ?? "");
      setFormCategory(editingProduct.category_id ?? "");
      setFormPrice(String(editingProduct.price));
      setFormStock(String(editingProduct.stock));
      setFormOnSale(editingProduct.on_sale);
      setFormDiscount(editingProduct.discount_percent ? String(editingProduct.discount_percent) : "");
      setFormImagePreview(editingProduct.image_url);
      setFormImageFile(null);
      setFormSlug(generateSlug(editingProduct.name));
      setFormMetaDesc(editingProduct.description?.slice(0, 160) ?? "");
      const attrs = editingProduct.attributes;
      setFormAttributes(Array.isArray(attrs) ? (attrs as ProductAttribute[]) : []);
      const extras = editingProduct.extra_images;
      setFormExtraImages(Array.isArray(extras) ? (extras as string[]) : []);
      setFormExtraFiles([]);
      const vs = editingProduct.variant_stock;
      setFormVariantStock((vs && typeof vs === "object" && !Array.isArray(vs)) ? (vs as Record<string, number>) : {});
      const vp = (editingProduct as any).variant_prices;
      setFormVariantPrices((vp && typeof vp === "object" && !Array.isArray(vp)) ? (vp as Record<string, number>) : {});
    } else {
      resetForm();
    }
  };

  // Sync initialization with open state
  if (open && !initialized) {
    initializeForm();
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  const resetForm = () => {
    setFormName(""); setFormDescription(""); setFormCategory(""); setFormPrice("");
    setFormStock(""); setFormOnSale(false); setFormDiscount(""); setFormImageFile(null);
    setFormImagePreview(null); setFormSlug(""); setFormMetaDesc("");
    setFormAttributes([]); setFormExtraImages([]); setFormExtraFiles([]); setFormVariantStock({}); setFormVariantPrices({});
  };

  /* ── Image handling ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "La imagen no debe superar 5MB", variant: "destructive" });
      return;
    }
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      toast({ title: "Error", description: "Solo JPG, PNG o WebP", variant: "destructive" });
      return;
    }
    setFormImageFile(file);
    setFormImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${storeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) {
      toast({ title: "Error", description: "Error al subir imagen", variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleExtraImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (formExtraImages.length + files.length > 5) {
      toast({ title: "Máximo 5 imágenes adicionales", variant: "destructive" });
      return;
    }
    const valid = ["image/jpeg", "image/png", "image/webp"];
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) { toast({ title: "Imagen muy grande (máx 5MB)", variant: "destructive" }); return; }
      if (!valid.includes(f.type)) { toast({ title: "Solo JPG, PNG o WebP", variant: "destructive" }); return; }
    }
    setFormExtraFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setFormExtraImages((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeExtraImage = (idx: number) => {
    setFormExtraImages((prev) => prev.filter((_, i) => i !== idx));
    setFormExtraFiles((prev) => {
      const alreadyUploadedCount = formExtraImages.filter((img) => img.startsWith("http")).length;
      if (idx >= alreadyUploadedCount) {
        const fileIdx = idx - alreadyUploadedCount;
        return prev.filter((_, i) => i !== fileIdx);
      }
      return prev;
    });
  };

  /* ── Save product ── */
  const handleSave = async (addAnother = false) => {
    if (!formName.trim() || formName.trim().length < 3) {
      toast({ title: "Error", description: "El nombre debe tener al menos 3 caracteres", variant: "destructive" });
      return;
    }
    const priceNum = Number(formPrice);
    if (!formPrice || priceNum <= 0) {
      toast({ title: "Error", description: "Ingresa un precio válido (> 0)", variant: "destructive" });
      return;
    }
    if (formPrice.includes(".") && formPrice.split(".")[1]?.length > 2) {
      toast({ title: "Error", description: "El precio debe tener máximo 2 decimales", variant: "destructive" });
      return;
    }
    if (formStock === "" || Number(formStock) < 0) {
      toast({ title: "Error", description: "El stock debe ser >= 0", variant: "destructive" });
      return;
    }
    if (formOnSale && (Number(formDiscount) < 0 || Number(formDiscount) > 100)) {
      toast({ title: "Error", description: "El descuento debe ser entre 0 y 100", variant: "destructive" });
      return;
    }

    setSaving(true);
    let imageUrl = editingProduct?.image_url ?? null;
    if (formImageFile) {
      const uploaded = await uploadImage(formImageFile);
      if (uploaded) imageUrl = uploaded;
    }

    const alreadyUploadedExtras = formExtraImages.filter((img) => img.startsWith("http"));
    const uploadedNewExtras: string[] = [];
    for (const file of formExtraFiles) {
      const url = await uploadImage(file);
      if (url) uploadedNewExtras.push(url);
    }
    const finalExtraImages = [...alreadyUploadedExtras, ...uploadedNewExtras];

    const cleanAttributes = formAttributes
      .filter(a => a.name.trim() && a.values.some(v => v.trim()))
      .map(a => ({ name: a.name.trim(), values: a.values.filter(v => v.trim()) }));

    const cleanVariantStock: Record<string, number> = {};
    const cleanVariantPrices: Record<string, number> = {};
    for (const attr of cleanAttributes) {
      for (const val of attr.values) {
        const key = `${attr.name}||${val}`;
        if (formVariantStock[key] !== undefined && formVariantStock[key] >= 0) cleanVariantStock[key] = formVariantStock[key];
        if (formVariantPrices[key] !== undefined && formVariantPrices[key] > 0) cleanVariantPrices[key] = formVariantPrices[key];
      }
    }

    const hasVariantStock = Object.keys(cleanVariantStock).length > 0;
    const computedStock = hasVariantStock ? Object.values(cleanVariantStock).reduce((a, b) => a + b, 0) : Number(formStock);

    const payload = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      category_id: formCategory || null,
      price: Number(formPrice),
      stock: computedStock,
      on_sale: formOnSale,
      discount_percent: formOnSale ? Number(formDiscount) || 0 : 0,
      image_url: imageUrl,
      store_id: storeId,
      attributes: cleanAttributes.length > 0 ? cleanAttributes : null,
      extra_images: finalExtraImages,
      variant_stock: cleanVariantStock,
      variant_prices: cleanVariantPrices,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
      else toast({ title: "Producto actualizado" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast({ title: "Error", description: "Error al crear", variant: "destructive" });
      else toast({ title: "Producto creado" });
    }

    setSaving(false);
    if (addAnother) {
      resetForm();
    } else {
      onOpenChange(false);
      resetForm();
    }
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onOpenChange(false); resetForm(); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingProduct ? `Editar ${editingProduct.name}` : "Agregar nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct ? "Modifica los detalles del producto" : "Completa los campos para crear un nuevo producto"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          {/* 1. Image */}
          <div>
            <Label className="text-sm font-semibold">Imagen</Label>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input p-6 transition-colors hover:border-primary/50">
              {formImagePreview ? (
                <img src={formImagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
              ) : (
                <ImagePlus className="h-10 w-10 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {formImagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
              </span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP (máx 5MB). Se redimensionará a 500x500px</span>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* 1b. Extra images gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Imágenes adicionales <span className="text-xs font-normal text-muted-foreground">({formExtraImages.length}/5)</span></Label>
              {formExtraImages.length < 5 && (
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                    <Plus className="h-3 w-3" /> Agregar foto
                  </span>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={handleExtraImageAdd} />
                </label>
              )}
            </div>
            {formExtraImages.length === 0 ? (
              <p className="text-xs text-muted-foreground">Agrega hasta 5 fotos adicionales para mostrar en la galería del producto.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formExtraImages.map((src, idx) => (
                  <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                    <img src={src} alt={`Extra ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExtraImage(idx)}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Basic info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Información básica</h3>
            <div>
              <Label htmlFor="prod-name">Nombre *</Label>
              <Input
                id="prod-name"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingProduct) setFormSlug(generateSlug(e.target.value));
                }}
                placeholder="Nombre del producto (min 3 caracteres)"
                className="mt-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="prod-desc">Descripción</Label>
                <span className="text-xs text-muted-foreground">{formDescription.length}/500</span>
              </div>
              <Textarea
                id="prod-desc"
                value={formDescription}
                onChange={(e) => { if (e.target.value.length <= 500) setFormDescription(e.target.value); }}
                placeholder="Descripción del producto"
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3. Price & inventory */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Detalles de precio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prod-price">Precio * ($)</Label>
                <Input id="prod-price" type="number" min="0.01" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="0.00" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="prod-stock">
                  Stock *
                  {Object.keys(formVariantStock).length > 0 && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(se calcula automáticamente de variantes)</span>
                  )}
                </Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  value={Object.keys(formVariantStock).length > 0
                    ? Object.values(formVariantStock).reduce((a, b) => a + b, 0)
                    : formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="0"
                  className="mt-1.5"
                  readOnly={Object.keys(formVariantStock).length > 0}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="prod-sale" checked={formOnSale} onCheckedChange={setFormOnSale} />
              <Label htmlFor="prod-sale">En oferta</Label>
            </div>
            {formOnSale && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-discount">Descuento (%)</Label>
                  <Input id="prod-discount" type="number" min="0" max="100" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} placeholder="10" className="mt-1.5" />
                </div>
                <div>
                  <Label>Precio con descuento</Label>
                  <Input
                    readOnly
                    value={formPrice && formDiscount ? `$${discountedPrice(Number(formPrice), Number(formDiscount))}` : "—"}
                    className="mt-1.5 bg-muted"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Attributes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Atributos (opcional)</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormAttributes([...formAttributes, { name: "", values: [""] }])}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar atributo
              </Button>
            </div>
            {formAttributes.length === 0 && (
              <p className="text-xs text-muted-foreground">Agrega atributos como Color, Talla, Material, etc. Puedes definir el stock disponible por cada variante.</p>
            )}
            {formAttributes.map((attr, attrIdx) => (
              <div key={attrIdx} className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nombre (ej: Color, Talla)"
                    value={attr.name}
                    onChange={(e) => {
                      const updated = [...formAttributes];
                      updated[attrIdx] = { ...updated[attrIdx], name: e.target.value };
                      setFormAttributes(updated);
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setFormAttributes(formAttributes.filter((_, i) => i !== attrIdx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center">
                  <span className="text-xs font-medium text-muted-foreground">Valor</span>
                  <span className="text-xs font-medium text-muted-foreground">Stock</span>
                  <span className="text-xs font-medium text-muted-foreground">Precio ($)</span>
                  <span />
                </div>
                <div className="space-y-2">
                  {attr.values.map((val, valIdx) => {
                    const vsKey = `${attr.name}||${val}`;
                    return (
                      <div key={valIdx} className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center">
                        <Input
                          placeholder="Ej: Rojo, Talla S..."
                          value={val}
                          onChange={(e) => {
                            const oldKey = `${attr.name}||${val}`;
                            const newKey = `${attr.name}||${e.target.value}`;
                            const updated = [...formAttributes];
                            const newValues = [...updated[attrIdx].values];
                            newValues[valIdx] = e.target.value;
                            updated[attrIdx] = { ...updated[attrIdx], values: newValues };
                            setFormAttributes(updated);
                            if (oldKey !== newKey) {
                              setFormVariantStock((prev) => {
                                const next = { ...prev };
                                if (next[oldKey] !== undefined) { next[newKey] = next[oldKey]; delete next[oldKey]; }
                                return next;
                              });
                              setFormVariantPrices((prev) => {
                                const next = { ...prev };
                                if (next[oldKey] !== undefined) { next[newKey] = next[oldKey]; delete next[oldKey]; }
                                return next;
                              });
                            }
                          }}
                        />
                        <Input
                          type="number" min="0" placeholder="0"
                          value={formVariantStock[vsKey] ?? ""}
                          onChange={(e) => {
                            const num = e.target.value === "" ? undefined : Math.max(0, Number(e.target.value));
                            setFormVariantStock((prev) => {
                              const next = { ...prev };
                              if (num === undefined) delete next[vsKey]; else next[vsKey] = num;
                              return next;
                            });
                          }}
                          className="text-center"
                        />
                        <Input
                          type="number" min="0" step="0.01" placeholder="—"
                          value={formVariantPrices[vsKey] ?? ""}
                          onChange={(e) => {
                            const num = e.target.value === "" ? undefined : Math.max(0, Number(e.target.value));
                            setFormVariantPrices((prev) => {
                              const next = { ...prev };
                              if (num === undefined) delete next[vsKey]; else next[vsKey] = num;
                              return next;
                            });
                          }}
                          className="text-center"
                        />
                        {attr.values.length > 1 ? (
                          <Button
                            type="button" variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => {
                              const updated = [...formAttributes];
                              updated[attrIdx] = { ...updated[attrIdx], values: updated[attrIdx].values.filter((_, i) => i !== valIdx) };
                              setFormAttributes(updated);
                              setFormVariantStock((prev) => { const next = { ...prev }; delete next[vsKey]; return next; });
                              setFormVariantPrices((prev) => { const next = { ...prev }; delete next[vsKey]; return next; });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        ) : <div />}
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="button" variant="outline" size="sm" className="h-8 gap-1"
                  onClick={() => {
                    const updated = [...formAttributes];
                    updated[attrIdx] = { ...updated[attrIdx], values: [...updated[attrIdx].values, ""] };
                    setFormAttributes(updated);
                  }}
                >
                  <Plus className="h-3 w-3" /> Agregar valor
                </Button>
              </div>
            ))}
          </div>

          {/* 5. SEO */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">SEO (opcional)</h3>
            <div>
              <Label htmlFor="prod-slug">URL slug</Label>
              <Input id="prod-slug" value={formSlug} onChange={(e) => setFormSlug(generateSlug(e.target.value))} placeholder="nombre-del-producto" className="mt-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="prod-meta">Meta descripción</Label>
                <span className="text-xs text-muted-foreground">{formMetaDesc.length}/160</span>
              </div>
              <Textarea
                id="prod-meta"
                value={formMetaDesc}
                onChange={(e) => { if (e.target.value.length <= 160) setFormMetaDesc(e.target.value); }}
                placeholder="Descripción para motores de búsqueda"
                className="mt-1.5"
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {editingProduct && (
            <Button
              variant="destructive"
              className="sm:mr-auto"
              onClick={() => { onDelete(editingProduct); onOpenChange(false); resetForm(); }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar producto
            </Button>
          )}
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={saving}>
            Cancelar
          </Button>
          {!editingProduct && (
            <Button variant="secondary" onClick={() => handleSave(true)} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar y agregar otro
            </Button>
          )}
          <Button onClick={() => handleSave(false)} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingProduct ? "Guardar cambios" : "Guardar producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
