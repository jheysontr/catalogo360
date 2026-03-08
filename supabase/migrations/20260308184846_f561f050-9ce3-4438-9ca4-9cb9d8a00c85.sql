
-- 1. Recreate stores_public view WITHOUT email, address, and user_id
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

-- 2. Remove the broad authenticated SELECT policy
DROP POLICY IF EXISTS "Authenticated can view active stores" ON public.stores;
