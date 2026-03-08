
-- 1. Remove the public SELECT policy that exposes sensitive data
DROP POLICY IF EXISTS "Public can view active stores" ON public.stores;

-- 2. Harden orders INSERT policy to validate store exists and is active
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = orders.store_id
        AND stores.is_active = true
    )
  );
