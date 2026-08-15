CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  trend_score NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (trend_score >= 0 AND trend_score <= 5),
  is_open BOOLEAN NOT NULL DEFAULT false,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_businesses_tags ON businesses USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses (category);

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geofences (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  radius_meters INT NOT NULL CHECK (radius_meters > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
