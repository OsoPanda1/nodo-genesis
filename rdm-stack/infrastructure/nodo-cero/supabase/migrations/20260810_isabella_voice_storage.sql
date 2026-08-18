insert into storage.buckets (id, name, public)
values ('isabella-voice-cache', 'isabella-voice-cache', false)
on conflict (id) do update set public = false;

create policy "Authenticated users can read Isabella audio"
on storage.objects
for select
to authenticated
using (bucket_id = 'isabella-voice-cache');

create policy "Service role writes Isabella audio"
on storage.objects
for insert
to service_role
with check (bucket_id = 'isabella-voice-cache');
