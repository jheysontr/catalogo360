
-- Create coupons table
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_purchase numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, code)
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can view active coupons (for storefront validation)
CREATE POLICY "Anyone can view coupons" ON public.coupons FOR SELECT USING (true);

-- Store owner can insert coupons
CREATE POLICY "Store owner can insert coupons" ON public.coupons FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()));

-- Store owner can update coupons
CREATE POLICY "Store owner can update coupons" ON public.coupons FOR UPDATE
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()));

-- Store owner can delete coupons
CREATE POLICY "Store owner can delete coupons" ON public.coupons FOR DELETE
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
