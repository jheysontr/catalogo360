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
} from "lucide-react";
import toast from "react-hot-toast";

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

const ITEMS_PER_PAGE = 10;

const Products = () => {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Fetch store ID
  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setStoreId(data[0].id);
      });
  }, [user]);

  // Fetch categories
  useEffect(() => {
    if (!storeId) return;
    supabase
      .from("categories")
      .select("id, name")
      .eq("store_id", storeId)
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, [storeId]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("store_id", storeId);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }
    if (filterCategory !== "all") {
      query = query.eq("category_id", filterCategory);
    }
    if (filterStatus === "active") {
      query = query.gt("stock", 0).eq("on_sale", false);
    } else if (filterStatus === "inactive") {
      query = query.eq("stock", 0);
    } else if (filterStatus === "on_sale") {
      query = query.eq("on_sale", true);
    }

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error("Error al cargar productos");
    } else {
      setProducts(data ?? []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [storeId, search, filterCategory, filterStatus, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterStatus]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "Sin categoría";
    return categories.find((c) => c.id === catId)?.name ?? "Sin categoría";
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormCategory("");
    setFormPrice("");
    setFormStock("");
    setFormOnSale(false);
    setFormDiscount("");
    setFormImageFile(null);
    setFormImagePreview(null);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

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
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB");
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
      toast.error("Error al subir imagen");
      return null;
    }
    const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!storeId) return;
    if (!formName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!formPrice || Number(formPrice) < 0) {
      toast.error("Ingresa un precio válido");
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
      stock: Number(formStock) || 0,
      on_sale: formOnSale,
      discount_percent: formOnSale ? Number(formDiscount) || 0 : 0,
      image_url: imageUrl,
      store_id: storeId,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id);
      if (error) {
        toast.error("Error al actualizar producto");
      } else {
        toast.success("Producto actualizado");
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        toast.error("Error al crear producto");
      } else {
        toast.success("Producto creado");
      }
    }

    setSaving(false);
    setModalOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleDuplicate = async (product: Product) => {
    if (!storeId) return;
    const { id, ...rest } = product;
    const { error } = await supabase.from("products").insert({
      ...rest,
      name: `${product.name} (copia)`,
      store_id: storeId,
    });
    if (error) {
      toast.error("Error al duplicar");
    } else {
      toast.success("Producto duplicado");
      fetchProducts();
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Producto eliminado");
      fetchProducts();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground">{totalCount} productos en total</p>
        </div>
        <Button className="gap-2" onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Agregar producto
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
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
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
            <SelectItem value="on_sale">En oferta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table / Empty state */}
      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Card className="mt-12">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No hay productos</h3>
            <p className="text-sm text-muted-foreground">Agrega tu primer producto para comenzar a vender</p>
            <Button className="gap-2" onClick={openAddModal}>
              <Plus className="h-4 w-4" /> Agregar producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-6 rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{p.name}</span>
                      {p.on_sale && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          -{p.discount_percent}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{getCategoryName(p.category_id)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${p.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={p.stock === 0 ? "text-destructive" : "text-foreground"}>
                        {p.stock}
                      </span>
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
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {showEllipsis && (
                          <PaginationItem>
                            <span className="px-2 text-muted-foreground">…</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            isActive={p === page}
                            onClick={() => setPage(p)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </span>
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
        </>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); resetForm(); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar producto" : "Agregar producto"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Modifica los detalles del producto" : "Completa los campos para crear un nuevo producto"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Image upload */}
            <div>
              <Label>Imagen</Label>
              <label className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input p-6 transition-colors hover:border-primary/50">
                {formImagePreview ? (
                  <img src={formImagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
                ) : (
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {formImagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div>
              <Label htmlFor="prod-name">Nombre *</Label>
              <Input
                id="prod-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nombre del producto"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="prod-desc">Descripción</Label>
              <Textarea
                id="prod-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prod-price">Precio *</Label>
                <Input
                  id="prod-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="prod-stock">Stock</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="prod-sale"
                checked={formOnSale}
                onCheckedChange={setFormOnSale}
              />
              <Label htmlFor="prod-sale">En oferta</Label>
            </div>

            {formOnSale && (
              <div>
                <Label htmlFor="prod-discount">Descuento (%)</Label>
                <Input
                  id="prod-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  placeholder="10"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm(); }} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingProduct ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
