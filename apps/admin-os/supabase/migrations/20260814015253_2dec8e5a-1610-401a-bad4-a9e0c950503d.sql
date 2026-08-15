-- 1. Profiles: no anonymous exposure
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Authenticated can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- 2. Guardian actions: admin-only writes
DROP POLICY IF EXISTS "Guardians can update actions" ON public.guardian_actions;
DROP POLICY IF EXISTS "System can insert actions" ON public.guardian_actions;
CREATE POLICY "Admins insert guardian actions" ON public.guardian_actions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update guardian actions" ON public.guardian_actions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete guardian actions" ON public.guardian_actions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Interactions: telemetry stays writable, reads admin-only
DROP POLICY IF EXISTS "Anyone can read interactions" ON public.interactions;
CREATE POLICY "Admins read interactions" ON public.interactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Admin-managed public catalogs
CREATE POLICY "Admins manage dichos" ON public.dichos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage places" ON public.places FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage packages" ON public.packages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage package places" ON public.package_places FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage package businesses" ON public.package_businesses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage shuttle routes" ON public.shuttle_routes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage federation streams" ON public.federation_data_streams FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dichos, public.places, public.packages, public.package_places, public.package_businesses, public.shuttle_routes, public.federation_data_streams, public.guardian_actions, public.interactions, public.profiles TO authenticated;
GRANT SELECT ON public.dichos, public.places, public.packages, public.package_places, public.package_businesses, public.shuttle_routes, public.federation_data_streams, public.guardian_actions TO anon;
GRANT INSERT ON public.interactions TO anon;