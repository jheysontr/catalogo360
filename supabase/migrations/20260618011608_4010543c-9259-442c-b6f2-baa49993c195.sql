
-- Admin full access to manage any store's data (impersonation support)

-- products: admin already has SELECT, add ALL
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- categories
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
CREATE POLICY "Admins can manage all categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- coupons
DROP POLICY IF EXISTS "Admins can manage all coupons" ON public.coupons;
CREATE POLICY "Admins can manage all coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- shipments
DROP POLICY IF EXISTS "Admins can manage all shipments" ON public.shipments;
CREATE POLICY "Admins can manage all shipments" ON public.shipments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- links
DROP POLICY IF EXISTS "Admins can manage all links" ON public.links;
CREATE POLICY "Admins can manage all links" ON public.links
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
