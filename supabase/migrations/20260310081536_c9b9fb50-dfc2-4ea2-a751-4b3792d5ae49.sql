-- Re-add a restricted public SELECT policy for active stores
-- This is needed because stores_public view uses security_invoker=true
-- and needs a base table policy to read from
CREATE POLICY "Anyone can view active stores" ON public.stores
FOR SELECT
USING (is_active = true);