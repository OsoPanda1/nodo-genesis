
REVOKE EXECUTE ON FUNCTION public.award_points(UUID, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_points(UUID, TEXT, INTEGER, JSONB) TO service_role;
