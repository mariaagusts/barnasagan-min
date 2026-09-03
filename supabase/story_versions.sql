-- Bokarutgafur vistadar i skyinu, per foreldri og barn
-- (speglar user_progress). Keyra EINU SINNI i Supabase SQL Editor.
-- child_id fylgir gerd children.id sjalfkrafa i gegnum FK.

create table if not exists public.story_versions (
  user_id       uuid not null references auth.users(id) on delete cascade,
  child_id      uuid not null references public.children(id) on delete cascade,
  versions_json text not null,
  updated_at    timestamptz not null default now(),
  primary key (user_id, child_id)
);
alter table public.story_versions enable row level security;

create policy "owner_select_versions" on public.story_versions
  for select to authenticated using (auth.uid() = user_id);
create policy "owner_insert_versions" on public.story_versions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner_update_versions" on public.story_versions
  for update to authenticated using (auth.uid() = user_id);
create policy "owner_delete_versions" on public.story_versions
  for delete to authenticated using (auth.uid() = user_id);
