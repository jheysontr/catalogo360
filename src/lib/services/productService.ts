import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type ProductInsert = TablesInsert<"products">;
type ProductUpdate = TablesUpdate<"products">;

export const productService = {
  async getStoreProducts(storeId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProduct(productId: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createProduct(storeId: string, productData: Omit<ProductInsert, "store_id">): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...productData, store_id: storeId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(productId: string, updates: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;
  },

  async getProductsByCategory(storeId: string, categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
