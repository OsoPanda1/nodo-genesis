-- Create notes table for public demo/notes
create table if not exists public.notes (
  id bigint primary key generated always as identity,
  title text not null,
  content text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert sample data
insert into public.notes (title, content) values
  ('Hoy creé un proyecto en Supabase', 'El proyecto RDM Digital Hub está tomando forma con Isabella AI integrada.'),
  ('Agregué datos y los consulté desde Isabella', 'Isabella ahora puede responder preguntas sobre Real del Monte y su ecosistema.'),
  ('Fue increíble', 'La integración con Vercel Functions permite streaming en tiempo real.')
on conflict do nothing;

-- Enable RLS
alter table public.notes enable row level security;

-- Policy: public can read
create policy "public can read notes"
  on public.notes
  for select
  to anon, authenticated
  using (true);

-- Policy: authenticated users can insert
create policy "authenticated can insert notes"
  on public.notes
  for insert
  to authenticated
  with check (true);

-- Policy: owners can update/delete their own notes
create policy "owners can update notes"
  on public.notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owners can delete notes"
  on public.notes
  for delete
  to authenticated
  using (auth.uid() = user_id);
