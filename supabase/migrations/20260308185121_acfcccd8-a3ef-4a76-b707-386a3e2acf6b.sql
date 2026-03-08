
-- Remove broad public SELECT on stores base table
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;

-- Use a SECURITY DEFINER view so it bypasses RLS on stores table
DROP VIEW IF EXISTS public.stores_public;
CREATE VIEW public.stores_public
WITH (security_barrier=on) AS
  SELECT 
    id, store_name, store_slug, description, logo_url, banner_url,
    primary_color, secondary_color, currency, is_active,
    social_media, payment_methods, shipping_config, linkbox_config, 
    storefront_config, plan_id, created_at, updated_at
  FROM public.stores
  WHERE is_active = true;

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.stores_public TO anon, authenticated;

-- Update orders INSERT policy to use a security definer function for store validation
CREATE OR REPLACE FUNCTION public.is_active_store(store_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_uuid AND is_active = true
  )
$$;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_active_store(store_id));
