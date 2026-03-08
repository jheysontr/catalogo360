
-- Recreate stores_public WITHOUT security_invoker so it can read the base table
-- The view itself filters to is_active=true and excludes sensitive columns
DROP VIEW IF EXISTS public.stores_public;
CREATE VIEW public.stores_public AS
  SELECT 
    id, store_name, store_slug, description, logo_url, banner_url,
    primary_color, secondary_color, currency, is_active,
    social_media, payment_methods, shipping_config, linkbox_config, 
    storefront_config, plan_id, created_at, updated_at
  FROM public.stores
  WHERE is_active = true;
