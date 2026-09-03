-- ══════════════════════════════════════════════
--  RÖDD BÓKARINNAR: opinber deiling einnar upptöku
--  af rödd barnsins fyrir QR-kóðann í PDF-bókinni.
--  Keyra EINU SINNI í Supabase SQL Editor.
-- ══════════════════════════════════════════════

-- Opinber fata: hver skrá fær langt tilviljunarnafn (token-öryggi),
-- aðeins sá sem hefur hlekkinn (QR-kóðann) finnur skrána.
insert into storage.buckets (id, name, public)
values ('voice-shares', 'voice-shares', true)
on conflict (id) do nothing;

-- Innskráðir notendur hlaða upp í sína eigin möppu (uid/random.webm)
create policy "upload own voice shares" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'voice-shares' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "delete own voice shares" on storage.objects
  for delete to authenticated
  using (bucket_id = 'voice-shares' and (storage.foldername(name))[1] = auth.uid()::text);
