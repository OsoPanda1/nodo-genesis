-- 1) federation_data_streams: admin-only read
DROP POLICY IF EXISTS "Anyone can read streams" ON public.federation_data_streams;
CREATE POLICY "Admins read federation streams"
ON public.federation_data_streams FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.federation_data_streams FROM anon;

-- 2) guardian_actions: admin-only read
DROP POLICY IF EXISTS "Anyone can read guardian actions" ON public.guardian_actions;
CREATE POLICY "Admins read guardian actions"
ON public.guardian_actions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.guardian_actions FROM anon;

-- 3) interactions: no public insert, no realtime broadcast
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.interactions;
CREATE POLICY "Authenticated insert own interactions"
ON public.interactions FOR INSERT TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid()::text);
REVOKE INSERT, SELECT ON public.interactions FROM anon;
ALTER PUBLICATION supabase_realtime DROP TABLE public.interactions;

-- 4) profiles: own profile or admin only
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Users read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.profiles FROM anon;

-- 5) shuttle_companies: hide rfc / contact_email / phone via column grants
REVOKE SELECT ON public.shuttle_companies FROM anon, authenticated;
GRANT SELECT (id, owner_id, name, website, logo, monthly_plan, status, created_at)
  ON public.shuttle_companies TO anon, authenticated;
CREATE POLICY "Owners and admins read full company"
ON public.shuttle_companies FOR SELECT TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- 6) SECURITY DEFINER function not executable by anonymous visitors
DROP POLICY IF EXISTS "Tracks are publicly readable" ON public.tracks;
CREATE POLICY "Anon read active tracks"
ON public.tracks FOR SELECT TO anon
USING (is_active = true);
CREATE POLICY "Authenticated read tracks"
ON public.tracks FOR SELECT TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.tracks_set_updated_at() FROM anon, authenticated, public;