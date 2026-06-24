
-- 1) Stores: prevent email leakage via base table public reads; expose only via safe view
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;
DROP POLICY IF EXISTS "Anon can view stores via view" ON public.stores;

DROP VIEW IF EXISTS public.stores_public;
CREATE VIEW public.stores_public
WITH (security_invoker = false, security_barrier = true)
AS
SELECT id, store_name, store_slug, description, logo_url, banner_url,
       primary_color, secondary_color, currency, is_active,
       social_media, linkbox_config, storefront_config, plan_id,
       created_at, updated_at
FROM public.stores
WHERE is_active = true;

GRANT SELECT ON public.stores_public TO anon, authenticated;

-- 2) user_roles: admin-only insert/update/delete
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3) handle_new_user: defense in depth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_slug TEXT;
BEGIN
  IF NEW.id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, business_name)
  VALUES (NEW.id, NEW.email, '', '')
  ON CONFLICT (user_id) DO NOTHING;

  new_slug := public.generate_unique_slug('tienda');

  INSERT INTO public.stores (user_id, store_name, store_slug, email, description, logo_url, banner_url, primary_color, secondary_color, social_media, setup_completed)
  VALUES (NEW.id, '', new_slug, NEW.email, '', NULL, NULL, NULL, NULL, '{}'::jsonb, false);

  RETURN NEW;
END;
$function$;

-- 4) Lock down internal SECURITY DEFINER helpers so only the system runs them
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_unique_slug(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_tracking_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_active_store(uuid) FROM PUBLIC, anon, authenticated;
-- Keep has_role executable (used inside RLS as the calling role)
-- Keep validate_coupon and get_store_checkout_config executable (called from storefront)

-- 5) Storage: remove overbroad authenticated delete/update on stores bucket
DROP POLICY IF EXISTS "Authenticated users can delete store assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update store assets" ON storage.objects;

-- 6) Storage: drop public SELECT policies that allow listing; public buckets still serve files via public URLs
DROP POLICY IF EXISTS "Public read access for store assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
