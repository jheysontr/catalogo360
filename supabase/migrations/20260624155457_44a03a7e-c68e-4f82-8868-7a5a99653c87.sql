
CREATE OR REPLACE FUNCTION public.enforce_product_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  plan_max integer;
BEGIN
  SELECT COALESCE(pp.max_products, 10)
    INTO plan_max
  FROM public.stores s
  LEFT JOIN public.pricing_plans pp ON pp.id = s.plan_id
  WHERE s.id = NEW.store_id;

  IF plan_max IS NULL THEN
    plan_max := 10;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM public.products
  WHERE store_id = NEW.store_id;

  IF current_count >= plan_max THEN
    RAISE EXCEPTION 'Límite del plan alcanzado: tu plan permite máximo % productos. Mejora tu plan para agregar más.', plan_max
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_product_limit_trigger ON public.products;
CREATE TRIGGER enforce_product_limit_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_product_limit();

REVOKE EXECUTE ON FUNCTION public.enforce_product_limit() FROM PUBLIC, anon, authenticated;
