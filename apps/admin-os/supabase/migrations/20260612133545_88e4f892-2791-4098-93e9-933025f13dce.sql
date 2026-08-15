
CREATE POLICY "Tracks audio public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tracks-audio');

CREATE POLICY "Admins upload tracks audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tracks-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tracks audio"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'tracks-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete tracks audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tracks-audio' AND public.has_role(auth.uid(), 'admin'));
