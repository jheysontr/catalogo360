
-- Allow admins to insert pricing plans
CREATE POLICY "Admins can insert pricing plans"
ON public.pricing_plans
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update pricing plans
CREATE POLICY "Admins can update pricing plans"
ON public.pricing_plans
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete pricing plans
CREATE POLICY "Admins can delete pricing plans"
ON public.pricing_plans
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
