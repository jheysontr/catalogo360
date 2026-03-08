
-- 1) Create public view of stores without user_id (email kept as business contact)
CREATE VIEW public.stores_public
WITH (security_invoker = on) AS
  SELECT id, store_name, store_slug, description, logo_url, banner_url,
         primary_color, secondary_color, email, address, social_media,
         currency, is_active, plan_id, payment_methods, shipping_config,
         linkbox_config, storefront_config, created_at, updated_at
  FROM public.stores;

-- 2) Drop the overly permissive "Anyone can view stores" policy
DROP POLICY IF EXISTS "Anyone can view stores" ON public.stores;

-- 3) Owner can SELECT own stores
CREATE POLICY "Owner can view own stores"
  ON public.stores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4) Admins can SELECT all stores
CREATE POLICY "Admins can view all stores"
  ON public.stores FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5) Anon users can SELECT via the view (need base table access for security_invoker)
CREATE POLICY "Anon can view stores via view"
  ON public.stores FOR SELECT
  TO anon
  USING (true);

-- 6) Restrict coupons: drop public SELECT, add store-owner policy
DROP POLICY IF EXISTS "Anyone can view coupons" ON public.coupons;

CREATE POLICY "Store owner can view coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()
  ));

-- 7) Create RPC for coupon validation (unauthenticated customers)
CREATE OR REPLACE FUNCTION public.validate_coupon(p_store_id uuid, p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coupon_row RECORD;
BEGIN
  SELECT id, code, discount_type, discount_value, min_purchase, max_uses, used_count, is_active, expires_at
  INTO coupon_row
  FROM public.coupons
  WHERE store_id = p_store_id
    AND LOWER(code) = LOWER(p_code)
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cupón no encontrado');
  END IF;

  IF coupon_row.expires_at IS NOT NULL AND coupon_row.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cupón expirado');
  END IF;

  IF coupon_row.max_uses IS NOT NULL AND coupon_row.used_count >= coupon_row.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cupón agotado');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'id', coupon_row.id,
    'code', coupon_row.code,
    'discount_type', coupon_row.discount_type,
    'discount_value', coupon_row.discount_value,
    'min_purchase', coupon_row.min_purchase,
    'max_uses', coupon_row.max_uses,
    'used_count', coupon_row.used_count
  );
END;
$$;
