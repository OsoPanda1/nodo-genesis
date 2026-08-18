
-- 1. Whitelist de correos admin
CREATE TABLE IF NOT EXISTS public.admin_email_whitelist (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_email_whitelist TO authenticated;
GRANT ALL ON public.admin_email_whitelist TO service_role;
ALTER TABLE public.admin_email_whitelist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read whitelist" ON public.admin_email_whitelist
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_email_whitelist(email) VALUES
  ('tamvonlinenetwork@outlook.es'),
  ('ecastillotrejo1983@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Otorgar admin a usuarios existentes con esos correos
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) IN ('tamvonlinenetwork@outlook.es','ecastillotrejo1983@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Trigger para futuros signups
CREATE OR REPLACE FUNCTION public.auto_grant_admin_from_whitelist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.admin_email_whitelist w
    WHERE lower(w.email) = lower(NEW.email)
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin_whitelist ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_whitelist
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_grant_admin_from_whitelist();

-- 4. Tabla songs
CREATE TABLE IF NOT EXISTS public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text,
  description text,
  storage_path text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('audio/mpeg','audio/mp4','audio/x-m4a','audio/aac')),
  duration_seconds integer,
  size_bytes bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO authenticated;
GRANT ALL ON public.songs TO service_role;

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can read songs"
  ON public.songs FOR SELECT TO authenticated USING (true);

CREATE POLICY "admins insert songs"
  ON public.songs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update songs"
  ON public.songs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete songs"
  ON public.songs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Políticas RLS para storage.objects en bucket 'songs'
CREATE POLICY "authenticated read songs bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'songs');

CREATE POLICY "admins upload songs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'songs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update songs storage"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'songs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete songs storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'songs' AND public.has_role(auth.uid(), 'admin'));
