
-- =============================================
-- RDM Digital OS v4.1 – Full Schema Extension
-- =============================================

-- 1. BUSINESSES
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'COMERCIO',
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  price_range TEXT DEFAULT 'MODERADO',
  plan TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active businesses" ON public.businesses FOR SELECT TO public USING (status = 'active' OR status = 'pending');
CREATE POLICY "Owners can update their business" ON public.businesses FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can insert businesses" ON public.businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- 2. BUSINESS PAYMENTS
CREATE TABLE public.business_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business owners can read their payments" ON public.business_payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
);

-- 3. RATINGS FOR PLACES
CREATE TABLE public.ratings_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, place_id)
);

ALTER TABLE public.ratings_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read place ratings" ON public.ratings_places FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can rate places" ON public.ratings_places FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. RATINGS FOR BUSINESSES
CREATE TABLE public.ratings_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

ALTER TABLE public.ratings_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read business ratings" ON public.ratings_businesses FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can rate businesses" ON public.ratings_businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. COMMUNITY POSTS
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'post',
  title TEXT,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active posts" ON public.community_posts FOR SELECT TO public USING (status = 'active');
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 6. COMMUNITY COMMENTS
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.community_comments FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can comment" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 7. COMMUNITY LIKES
CREATE TABLE public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read likes" ON public.community_likes FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can like" ON public.community_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.community_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8. TRANSPORT PROVIDERS
CREATE TABLE public.transport_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'taxi',
  name TEXT NOT NULL,
  plate TEXT,
  capacity INTEGER DEFAULT 4,
  service_area TEXT DEFAULT 'Real del Monte',
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active transport" ON public.transport_providers FOR SELECT TO public USING (status = 'active');
CREATE POLICY "Owners can manage their transport" ON public.transport_providers FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Auth users can register transport" ON public.transport_providers FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- 9. TRANSPORT REQUESTS
CREATE TABLE public.transport_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.transport_providers(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own requests" ON public.transport_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Providers can read assigned requests" ON public.transport_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.transport_providers tp WHERE tp.id = provider_id AND tp.owner_id = auth.uid())
);
CREATE POLICY "Auth users can create requests" ON public.transport_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can update request status" ON public.transport_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.transport_providers tp WHERE tp.id = provider_id AND tp.owner_id = auth.uid())
);

-- 10. SHUTTLE COMPANIES
CREATE TABLE public.shuttle_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  rfc TEXT,
  contact_email TEXT,
  phone TEXT,
  website TEXT,
  logo TEXT,
  monthly_plan TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shuttle_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active shuttle companies" ON public.shuttle_companies FOR SELECT TO public USING (status = 'active');
CREATE POLICY "Owners manage their company" ON public.shuttle_companies FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- 11. SHUTTLE ROUTES
CREATE TABLE public.shuttle_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.shuttle_companies(id) ON DELETE CASCADE NOT NULL,
  origin TEXT NOT NULL DEFAULT 'CDMX',
  destination TEXT NOT NULL DEFAULT 'Real del Monte',
  days_of_week JSONB DEFAULT '["lun","mar","mie","jue","vie","sab","dom"]'::jsonb,
  departure_time TEXT,
  return_time TEXT,
  price_per_person NUMERIC(10,2) DEFAULT 0,
  capacity INTEGER DEFAULT 20,
  pickup_points JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shuttle_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active routes" ON public.shuttle_routes FOR SELECT TO public USING (status = 'active');

-- 12. SHUTTLE BOOKINGS
CREATE TABLE public.shuttle_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  route_id UUID REFERENCES public.shuttle_routes(id) ON DELETE SET NULL NOT NULL,
  travel_date DATE NOT NULL,
  passengers INTEGER DEFAULT 1,
  total_amount NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  booking_status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shuttle_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own bookings" ON public.shuttle_bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth users can book" ON public.shuttle_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 13. PACKAGES
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'cultural',
  description TEXT,
  duration_hours NUMERIC(5,1) DEFAULT 4,
  intensity TEXT DEFAULT 'moderada',
  price_from NUMERIC(10,2) DEFAULT 0,
  includes JSONB DEFAULT '[]'::jsonb,
  hero_image TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active packages" ON public.packages FOR SELECT TO public USING (status = 'active');

-- 14. PACKAGE-PLACE RELATIONS
CREATE TABLE public.package_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER DEFAULT 0
);

ALTER TABLE public.package_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read package places" ON public.package_places FOR SELECT TO public USING (true);

-- 15. PACKAGE-BUSINESS RELATIONS
CREATE TABLE public.package_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.package_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read package businesses" ON public.package_businesses FOR SELECT TO public USING (true);
