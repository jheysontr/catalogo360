-- Remove the overly permissive public SELECT on stores base table
-- Public access should go through stores_public view (no email, user_id, address, payment_methods, shipping_config)
DROP POLICY "Anyone can view active stores" ON public.stores;

-- Add a restricted public SELECT that only exposes non-sensitive columns via the stores_public view
-- The base table should only be directly readable by owners and admins (policies already exist for those)
