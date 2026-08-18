
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'citizen',
  is_guardian BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Guardian actions table
CREATE TABLE public.guardian_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  status TEXT DEFAULT 'pending',
  explanation TEXT,
  isabella_recommendation TEXT,
  isabella_confidence NUMERIC,
  ethical_flags JSONB DEFAULT '[]'::jsonb,
  guardian_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  msr_hash TEXT
);

ALTER TABLE public.guardian_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read guardian actions" ON public.guardian_actions FOR SELECT USING (true);
CREATE POLICY "System can insert actions" ON public.guardian_actions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Guardians can update actions" ON public.guardian_actions FOR UPDATE TO authenticated USING (true);

-- Federation Data Streams - the living chain between repos
CREATE TABLE public.federation_data_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_repo TEXT NOT NULL,
  federation TEXT NOT NULL,
  stream_type TEXT NOT NULL DEFAULT 'DATA_SYNC',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrity_hash TEXT,
  sync_status TEXT NOT NULL DEFAULT 'active',
  upstream_repo TEXT,
  downstream_repo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.federation_data_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read streams" ON public.federation_data_streams FOR SELECT USING (true);
CREATE POLICY "System can insert streams" ON public.federation_data_streams FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update streams" ON public.federation_data_streams FOR UPDATE USING (true);
