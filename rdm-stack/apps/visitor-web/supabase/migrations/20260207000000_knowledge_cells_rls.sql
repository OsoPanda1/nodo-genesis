ALTER TABLE public.territorial_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_cells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de celdas territoriales activas" ON public.territorial_cells;
DROP POLICY IF EXISTS "Permitir actualizaciones solo a agentes de la misma federación" ON public.territorial_cells;
DROP POLICY IF EXISTS "Permitir lectura de celdas de conocimiento" ON public.knowledge_cells;

CREATE POLICY "Permitir lectura pública de celdas territoriales activas"
ON public.territorial_cells
FOR SELECT
USING (
  active = true
);

CREATE POLICY "Permitir actualizaciones solo a agentes de la misma federación"
ON public.territorial_cells
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'federationId')::integer = federation_id
)
WITH CHECK (
  (auth.jwt() ->> 'federationId')::integer = federation_id
);

CREATE POLICY "Permitir lectura de celdas de conocimiento"
ON public.knowledge_cells
FOR SELECT
TO authenticated, anon
USING (
  federation_id = 0 OR
  (auth.jwt() ->> 'federationId')::integer = federation_id
);

CREATE POLICY "Permitir inserción y borrado solo a service_role o administradores"
ON public.knowledge_cells
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
