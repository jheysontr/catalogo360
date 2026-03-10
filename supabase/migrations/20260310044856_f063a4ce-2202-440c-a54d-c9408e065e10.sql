CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_slug TEXT;
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, business_name)
  VALUES (NEW.id, NEW.email, '', '');

  new_slug := public.generate_unique_slug('tienda');

  INSERT INTO public.stores (user_id, store_name, store_slug, email, description, logo_url, banner_url, primary_color, secondary_color, social_media, setup_completed)
  VALUES (NEW.id, '', new_slug, NEW.email, '', NULL, NULL, NULL, NULL, '{}'::jsonb, false);

  RETURN NEW;
END;
$function$;