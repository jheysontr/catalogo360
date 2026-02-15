import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus, Search, MoreVertical, Pencil, Copy, Trash2, ImagePlus, Package, Loader2,
  LayoutGrid, List, FolderPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ──────────────────────────────────────── */

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  on_sale: boolean;
  discount_percent: number | null;
  category_id: string | null;
  store_id: string;
}

interface Category {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 15;
const MAX_PRODUCTS = 60;

/* ─── Component ──────────────────────────────────── */

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat] = useState(false);

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
  // SEO fields
  const [formSlug, setFormSlug] = useState("");
  const [formMetaDesc, setFormMetaDesc] = useState("");

  /* ── Fetch store ── */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setStoreId(data[0].id);
      });
  }, [user]);

  /* ── Fetch categories ── */
  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("store_id", storeId);
    if (data) setCategories(data);
  }, [storeId]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ── Fetch products ── */
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("store_id", storeId);

    if (search) query = query.ilike("name", `%${search}%`);
    if (filterCategory !== "all") query = query.eq("category_id", filterCategory);
    if (filterStatus === "active") query = query.gt("stock", 0).eq("on_sale", false);
    else if (filterStatus === "inactive") query = query.eq("stock", 0);
    else if (filterStatus === "on_sale") query = query.eq("on_sale", true);

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast({ title: "Error", description: "Error al cargar productos", variant: "destructive" });
    } else {
      setProducts(data ?? []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [storeId, search, filterCategory, filterStatus, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, filterCategory, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "Sin categoría";
    return categories.find((c) => c.id === catId)?.name ?? "Sin categoría";
  };

  const getStatus = (p: Product) => {
    if (p.on_sale) return { label: "En oferta", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    if (p.stock === 0) return { label: "Inactivo", className: "bg-red-100 text-red-800 border-red-200" };
    return { label: "Activo", className: "bg-green-100 text-green-800 border-green-200" };
  };

  const discountedPrice = (price: number, discount: number) =>
    (price * (1 - discount / 100)).toFixed(2);

  /* ── Auto-generate slug from name ── */
  const generateSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* ── Form reset / open ── */
  const resetForm = () => {
    setFormName(""); setFormDescription(""); setFormCategory(""); setFormPrice("");
    setFormStock(""); setFormOnSale(false); setFormDiscount(""); setFormImageFile(null);
    setFormImagePreview(null); setEditingProduct(null); setFormSlug(""); setFormMetaDesc("");
  };

  const openAddModal = () => { resetForm(); setModalOpen(true); };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description ?? "");
    setFormCategory(product.category_id ?? "");
    setFormPrice(String(product.price));
    setFormStock(String(product.stock));
    setFormOnSale(product.on_sale);
    setFormDiscount(product.discount_percent ? String(product.discount_percent) : "");
    setFormImagePreview(product.image_url);
    setFormImageFile(null);
    setFormSlug(generateSlug(product.name));
    setFormMetaDesc(product.description?.slice(0, 160) ?? "");
    setModalOpen(true);
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
    const path = `${storeId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) {
      toast({ title: "Error", description: "Error al subir imagen", variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
    return urlData.publicUrl;
  };

  /* ── Save product ── */
  const handleSave = async (addAnother = false) => {
    if (!storeId) return;
    if (!formName.trim() || formName.trim().length < 3) {
      toast({ title: "Error", description: "El nombre debe tener al menos 3 caracteres", variant: "destructive" });
      return;
    }
    const priceNum = Number(formPrice);
    if (!formPrice || priceNum <= 0) {
      toast({ title: "Error", description: "Ingresa un precio válido (> 0)", variant: "destructive" });
      return;
    }
    // Validate max 2 decimal places
    if (formPrice.includes(".") && formPrice.split(".")[1]?.length > 2) {
      toast({ title: "Error", description: "El precio debe tener máximo 2 decimales", variant: "destructive" });
      return;
    }
    if (formStock === "" || Number(formStock) < 0) {
      toast({ title: "Error", description: "El stock debe ser >= 0", variant: "destructive" });
      return;
    }
    if (!editingProduct && !formImageFile && !formImagePreview) {
      toast({ title: "Error", description: "La imagen es requerida", variant: "destructive" });
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

    const payload = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      category_id: formCategory || null,
      price: Number(formPrice),
      stock: Number(formStock),
      on_sale: formOnSale,
      discount_percent: formOnSale ? Number(formDiscount) || 0 : 0,
      image_url: imageUrl,
      store_id: storeId,
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
      setModalOpen(false);
      resetForm();
    }
    fetchProducts();
  };

  /* ── Actions ── */
  const handleDuplicate = async (product: Product) => {
    if (!storeId) return;
    const { id, ...rest } = product;
    const { error } = await supabase.from("products").insert({
      ...rest,
      name: `${product.name} (copia)`,
      store_id: storeId,
    });
    if (error) toast({ title: "Error", description: "Error al duplicar", variant: "destructive" });
    else { toast({ title: "Producto duplicado" }); fetchProducts(); }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    // Clean up image from storage if exists
    if (product.image_url) {
      try {
        const url = new URL(product.image_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/products\/(.+)/);
        if (pathMatch?.[1]) {
          await supabase.storage.from("products").remove([decodeURIComponent(pathMatch[1])]);
        }
      } catch {
        // Ignore storage cleanup errors
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) toast({ title: "Error", description: "Error al eliminar", variant: "destructive" });
    else { toast({ title: "Producto eliminado" }); fetchProducts(); }
  };

  /* ── Add category ── */
  const handleAddCategory = async () => {
    if (!storeId || !newCatName.trim()) return;
    setSavingCat(true);
    const { error } = await supabase.from("categories").insert({ name: newCatName.trim(), store_id: storeId });
    if (error) toast({ title: "Error", description: "Error al crear categoría", variant: "destructive" });
    else {
      toast({ title: "Categoría creada" });
      setNewCatName("");
      setCatModalOpen(false);
      fetchCategories();
    }
    setSavingCat(false);
  };

  /* ── Pagination display ── */
  const fromItem = totalCount === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const toItem = Math.min(page * ITEMS_PER_PAGE, totalCount);

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground">{totalCount}/{MAX_PRODUCTS} productos usados</p>
        </div>
        <Button className="gap-2" onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Agregar producto
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="on_sale">En oferta</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCatModalOpen(true)}>
          <FolderPlus className="h-4 w-4" /> Agregar categoría
        </Button>
        <div className="flex rounded-lg border bg-muted p-0.5">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No tienes productos aún</h3>
            <p className="text-sm text-muted-foreground">Agrega tu primer producto para comenzar a vender</p>
            <Button className="gap-2" onClick={openAddModal}>
              <Plus className="h-4 w-4" /> Crear primer producto
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ── */
        <>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="hidden lg:table-cell">Estado</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const status = getStatus(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-[50px] w-[50px] rounded-md object-cover" />
                        ) : (
                          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          className="text-left font-medium text-foreground hover:text-primary hover:underline"
                          onClick={() => openEditModal(p)}
                        >
                          {p.name}
                        </button>
                        {p.on_sale && (
                          <Badge variant="secondary" className="ml-2 text-xs">-{p.discount_percent}%</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">{getCategoryName(p.category_id)}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">${p.price.toFixed(2)}</span>
                        {p.on_sale && p.discount_percent && (
                          <span className="ml-1 text-xs text-muted-foreground line-through">
                            ${discountedPrice(p.price, p.discount_percent)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={p.stock < 5 ? "font-medium text-destructive" : "text-foreground"}>
                          {p.stock} unidades
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(p)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(p)}>
                              <Copy className="mr-2 h-4 w-4" /> Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination info + controls */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Mostrando {fromItem}-{toItem} de {totalCount}
            </p>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let num: number;
                    if (totalPages <= 5) num = i + 1;
                    else if (page <= 3) num = i + 1;
                    else if (page >= totalPages - 2) num = totalPages - 4 + i;
                    else num = page - 2 + i;
                    return (
                      <PaginationItem key={num}>
                        <PaginationLink isActive={num === page} onClick={() => setPage(num)} className="cursor-pointer">
                          {num}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      ) : (
        /* ── GRID VIEW ── */
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => {
              const status = getStatus(p);
              return (
                <Card key={p.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="relative aspect-square bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge variant="outline" className={`absolute right-2 top-2 ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3 className="truncate font-semibold text-foreground">{p.name}</h3>
                    <Badge variant="outline" className="text-xs">{getCategoryName(p.category_id)}</Badge>
                    <p className="text-xl font-bold text-primary">${p.price.toFixed(2)}</p>
                    <p className={`text-xs ${p.stock < 5 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {p.stock} unidades
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEditModal(p)}>
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">Mostrando {fromItem}-{toItem} de {totalCount}</p>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let num: number;
                    if (totalPages <= 5) num = i + 1;
                    else if (page <= 3) num = i + 1;
                    else if (page >= totalPages - 2) num = totalPages - 4 + i;
                    else num = page - 2 + i;
                    return (
                      <PaginationItem key={num}>
                        <PaginationLink isActive={num === page} onClick={() => setPage(num)} className="cursor-pointer">{num}</PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      )}

      {/* ── ADD / EDIT PRODUCT MODAL ── */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); resetForm(); } }}>
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

            {/* 2. Información básica */}
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

            {/* 3. Precio e inventario */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Detalles de precio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-price">Precio * ($)</Label>
                  <Input id="prod-price" type="number" min="0.01" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="0.00" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="prod-stock">Stock *</Label>
                  <Input id="prod-stock" type="number" min="0" value={formStock} onChange={(e) => setFormStock(e.target.value)} placeholder="0" className="mt-1.5" />
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

            {/* 4. SEO */}
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
                onClick={() => { handleDelete(editingProduct); setModalOpen(false); resetForm(); }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar producto
              </Button>
            )}
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm(); }} disabled={saving}>
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

      {/* ── ADD CATEGORY MODAL ── */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Agregar categoría</DialogTitle>
            <DialogDescription>Crea una nueva categoría para organizar tus productos</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="cat-name">Nombre de categoría</Label>
            <Input id="cat-name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ej: Electrónica" className="mt-1.5" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCategory} disabled={savingCat || !newCatName.trim()} className="gap-2">
              {savingCat && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
