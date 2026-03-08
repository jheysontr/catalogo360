
-- Fix: Use security_invoker=on (recommended) + add a restricted SELECT policy on stores for active stores
DROP VIEW IF EXISTS public.stores_public;
CREATE VIEW public.stores_public
WITH (security_invoker=on) AS
  SELECT 
    id, store_name, store_slug, description, logo_url, banner_url,
    primary_color, secondary_color, currency, is_active,
    social_media, payment_methods, shipping_config, linkbox_config, 
    storefront_config, plan_id, created_at, updated_at
  FROM public.stores
  WHERE is_active = true;

-- Allow anyone (including anon) to read active stores - needed for stores_public view and storefront
CREATE POLICY "Anyone can view active stores"
  ON public.stores FOR SELECT
  USING (is_active = true);
