
-- referral_config: Restrict SELECT to store owner + admins only
DROP POLICY IF EXISTS "Anyone can view referral config" ON public.referral_config;

CREATE POLICY "Store owner can view referral config"
  ON public.referral_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = referral_config.store_id
        AND stores.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );
