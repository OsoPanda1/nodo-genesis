
-- Places table
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating FLOAT DEFAULT 4.5,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dichos table
CREATE TABLE public.dichos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personaje TEXT NOT NULL,
  texto TEXT NOT NULL,
  significado TEXT NOT NULL,
  jerga_original TEXT NOT NULL,
  categoria TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interactions table
CREATE TABLE public.interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  intent TEXT NOT NULL,
  query TEXT NOT NULL,
  latency_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dichos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Public read access for places and dichos
CREATE POLICY "Anyone can read places" ON public.places FOR SELECT USING (true);
CREATE POLICY "Anyone can read dichos" ON public.dichos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert interactions" ON public.interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read interactions" ON public.interactions FOR SELECT USING (true);

-- Enable realtime for interactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.interactions;
