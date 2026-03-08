
-- 1. Drop the two overly permissive SELECT policies on stores
DROP POLICY IF EXISTS "Anon can view stores via view" ON public.stores;
DROP POLICY IF EXISTS "Authenticated users can view stores" ON public.stores;

-- 2. Add restrictive SELECT policies: owner + admin only
CREATE POLICY "Owner can view own stores"
  ON public.stores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stores"
  ON public.stores FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Recreate stores_public view WITHOUT user_id, WITH security_invoker
DROP VIEW IF EXISTS public.stores_public;

CREATE VIEW public.stores_public
WITH (security_invoker = on) AS
  SELECT
    id,
    store_name,
    store_slug,
    description,
    logo_url,
    banner_url,
    primary_color,
    secondary_color,
    currency,
    email,
    address,
    social_media,
    is_active,
    plan_id,
    payment_methods,
    shipping_config,
    linkbox_config,
    storefront_config,
    created_at,
    updated_at
  FROM public.stores
  WHERE is_active = true;

-- 4. Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.stores_public TO anon;
GRANT SELECT ON public.stores_public TO authenticated;

-- 5. Since the view uses security_invoker, we need a policy allowing 
-- anyone to SELECT from stores BUT only for active stores
CREATE POLICY "Public can view active stores"
  ON public.stores FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can view active stores"
  ON public.stores FOR SELECT
  TO authenticated
  USING (is_active = true);
