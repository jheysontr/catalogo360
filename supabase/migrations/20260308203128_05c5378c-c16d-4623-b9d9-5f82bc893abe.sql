-- Recreate stores_public view with security_invoker to fix linter warning
DROP VIEW IF EXISTS public.stores_public;

CREATE VIEW public.stores_public
WITH (security_invoker = true)
AS
SELECT id,
    store_name,
    store_slug,
    description,
    logo_url,
    banner_url,
    primary_color,
    secondary_color,
    currency,
    is_active,
    social_media,
    linkbox_config,
    storefront_config,
    plan_id,
    created_at,
    updated_at
FROM stores
WHERE is_active = true;