
-- These trigger/utility helpers must be executable by anon and authenticated
-- because their BEFORE UPDATE triggers fire under the calling user's role.
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_unique_slug(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_tracking_number() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_active_store(uuid) TO anon, authenticated, service_role;
