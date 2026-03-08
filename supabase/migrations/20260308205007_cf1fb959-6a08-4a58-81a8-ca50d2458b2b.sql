CREATE POLICY "Anyone can view active stores"
ON public.stores
FOR SELECT
USING (is_active = true);