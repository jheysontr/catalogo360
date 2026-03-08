
-- 1. Create a security definer function to fetch store checkout config (payment + shipping)
CREATE OR REPLACE FUNCTION public.get_store_checkout_config(p_store_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'payment_methods', COALESCE(payment_methods, '{}'::jsonb),
    'shipping_config', COALESCE(shipping_config, '{}'::jsonb)
  )
  FROM public.stores
  WHERE id = p_store_id AND is_active = true
$$;

-- 2. Recreate stores_public WITHOUT payment_methods and shipping_config
-- Use security_barrier to prevent information leakage through predicates
DROP VIEW IF EXISTS public.stores_public;
CREATE VIEW public.stores_public
WITH (security_barrier=on) AS
  SELECT 
    id, store_name, store_slug, description, logo_url, banner_url,
    primary_color, secondary_color, currency, is_active,
    social_media, linkbox_config, storefront_config, plan_id,
    created_at, updated_at
  FROM public.stores
  WHERE is_active = true;

-- 3. Grant access to the view
GRANT SELECT ON public.stores_public TO anon, authenticated;
