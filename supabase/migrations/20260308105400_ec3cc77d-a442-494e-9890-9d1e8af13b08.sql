
-- Allow all authenticated users to view stores (for storefront access when logged in)
CREATE POLICY "Authenticated users can view stores"
  ON public.stores FOR SELECT
  TO authenticated
  USING (true);

-- Drop the redundant owner and admin SELECT policies since the above covers them
DROP POLICY IF EXISTS "Owner can view own stores" ON public.stores;
DROP POLICY IF EXISTS "Admins can view all stores" ON public.stores;
