-- Raddgeymslan: lokuð (private) geymslufata fyrir raddupptökur.
-- Keyra EINU SINNI í Supabase SQL Editor (eins og story_versions.sql).

insert into storage.buckets (id, name, public)
values ('voice-recordings', 'voice-recordings', false)
on conflict (id) do nothing;

create policy "upload own voice recordings" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'voice-recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "read own voice recordings" on storage.objects
  for select to authenticated
  using (bucket_id = 'voice-recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "delete own voice recordings" on storage.objects
  for delete to authenticated
  using (bucket_id = 'voice-recordings' and (storage.foldername(name))[1] = auth.uid()::text);
