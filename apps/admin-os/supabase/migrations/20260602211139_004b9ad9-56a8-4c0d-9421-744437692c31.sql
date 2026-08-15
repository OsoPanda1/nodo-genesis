GRANT SELECT ON public.federation_data_streams TO anon, authenticated;
GRANT ALL ON public.federation_data_streams TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.federation_data_streams FROM anon, authenticated;

DROP POLICY IF EXISTS "System can insert streams" ON public.federation_data_streams;
DROP POLICY IF EXISTS "System can update streams" ON public.federation_data_streams;

CREATE UNIQUE INDEX IF NOT EXISTS federation_data_streams_source_repo_key
ON public.federation_data_streams (source_repo);

CREATE INDEX IF NOT EXISTS federation_data_streams_status_synced_idx
ON public.federation_data_streams (sync_status, last_synced_at DESC);