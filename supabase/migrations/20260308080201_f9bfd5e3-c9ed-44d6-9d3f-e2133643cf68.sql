
-- ============================================================
-- FIX 1: referrers — Restrict SELECT to store owner + admins
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view referrers" ON public.referrers;

CREATE POLICY "Store owner can view referrers"
  ON public.referrers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = referrers.store_id
        AND stores.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- FIX 2: platform_referrers — Restrict SELECT to admin + own user
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active platform referrers" ON public.platform_referrers;

CREATE POLICY "Users can view own platform referrer"
  ON public.platform_referrers FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- FIX 3: shipments — Restrict INSERT to authenticated store owners
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert shipments" ON public.shipments;

CREATE POLICY "Store owner can insert shipments"
  ON public.shipments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = shipments.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 4: referrals — Restrict INSERT to authenticated users
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert referrals" ON public.referrals;

CREATE POLICY "Authenticated users can insert referrals"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = referrals.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 5: platform_referrals — Restrict public INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert platform referrals" ON public.platform_referrals;

CREATE POLICY "Authenticated users can insert platform referrals"
  ON public.platform_referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.platform_referrers
      WHERE platform_referrers.id = platform_referrals.referrer_id
        AND (platform_referrers.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- ============================================================
-- FIX 6: referrers — Restrict INSERT to store owners (was open)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert referrers" ON public.referrers;

CREATE POLICY "Store owner can insert referrers"
  ON public.referrers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = referrers.store_id
        AND stores.user_id = auth.uid()
    )
  );
