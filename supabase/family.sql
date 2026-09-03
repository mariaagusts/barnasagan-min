-- ══════════════════════════════════════════════
--  FJÖLSKYLDAN Á BARNASAGAN.IS
--  - Foreldri býr til boðshlekk fyrir hvert barn (family_links)
--  - Fjölskyldan sendir inn spurningar (fjolskylda.html)
--  - Foreldri samþykkir/hafnar; samþykkt spurning fer í valinn kafla
--  - Framvinda (aðeins fjöldatölur) og deildir kaflar sýnileg með hlekknum
--  Keyra EINU SINNI í SQL Editor.
-- ══════════════════════════════════════════════

-- Boðshlekkir: einn (eða fleiri) tokens á hvert barn
create table if not exists public.family_links (
  token       text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  child_id    uuid not null references public.children(id) on delete cascade,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.family_links enable row level security;

create policy "owner_select_links" on public.family_links
  for select to authenticated using (auth.uid() = user_id);
create policy "owner_insert_links" on public.family_links
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner_update_links" on public.family_links
  for update to authenticated using (auth.uid() = user_id);

-- Spurningar sem fjölskyldan sendir inn
create table if not exists public.family_questions (
  id          bigint generated always as identity primary key,
  token       text not null references public.family_links(token) on delete cascade,
  asker_name  text not null check (char_length(asker_name) between 1 and 80),
  question    text not null check (char_length(question) between 5 and 500),
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  chapter_id  int,
  created_at  timestamptz not null default now()
);
alter table public.family_questions enable row level security;

-- Security definer fall: leyfir nafnlausa innsendingu án þess að
-- opna lestraraðgang að family_links
create or replace function public.family_token_valid(t text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.family_links where token = t and active);
$$;

-- Hver sem er með gildan hlekk má senda inn spurningu
create policy "anyone_with_token_inserts" on public.family_questions
  for insert to anon, authenticated
  with check (public.family_token_valid(token));

-- Aðeins eigandi hlekksins les og afgreiðir
create policy "owner_select_questions" on public.family_questions
  for select to authenticated
  using (exists (select 1 from public.family_links fl
                 where fl.token = family_questions.token
                   and fl.user_id = auth.uid()));
create policy "owner_update_questions" on public.family_questions
  for update to authenticated
  using (exists (select 1 from public.family_links fl
                 where fl.token = family_questions.token
                   and fl.user_id = auth.uid()));

create index if not exists family_questions_token_idx
  on public.family_questions (token, status);

-- Kaflar sem foreldri hefur deilt (AI-textinn, aldrei hrásvörin)
create table if not exists public.shared_chapters (
  id          bigint generated always as identity primary key,
  token       text not null references public.family_links(token) on delete cascade,
  chapter_id  int not null,
  title       text not null check (char_length(title) <= 200),
  content     text not null check (char_length(content) <= 20000),
  updated_at  timestamptz not null default now(),
  unique (token, chapter_id)
);
alter table public.shared_chapters enable row level security;

create policy "owner_all_shared_chapters" on public.shared_chapters
  for all to authenticated
  using (exists (select 1 from public.family_links fl
                 where fl.token = shared_chapters.token and fl.user_id = auth.uid()))
  with check (exists (select 1 from public.family_links fl
                 where fl.token = shared_chapters.token and fl.user_id = auth.uid()));

-- Framvinda fyrir fjölskylduna: AÐEINS fjöldatölur og nafn barnsins,
-- aldrei svartextar. Sótt eftir barni hlekksins (user_id + child_id).
create or replace function public.family_progress(t text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case
    when not exists (select 1 from public.family_links fl where fl.token = t and fl.active)
    then null
    else (
      select jsonb_build_object(
        'child', c.child_name,
        'updated', up.updated_at,
        'chapters', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', (ch->>'id')::int,
            'answers', jsonb_array_length(coalesce(ch->'answers', '[]'::jsonb)),
            'complete', coalesce((ch->>'complete')::boolean, false)
          ))
          from jsonb_array_elements((up.state_json)::jsonb->'chapters') ch
        ), '[]'::jsonb)
      )
      from public.family_links fl2
      join public.children c on c.id = fl2.child_id
      left join public.user_progress up
        on up.user_id = fl2.user_id and up.child_id = fl2.child_id
      where fl2.token = t and fl2.active
      limit 1
    )
  end
$$;

-- Deildu kaflarnir fyrir fjölskylduna
create or replace function public.family_shared(t text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select case
    when not exists (select 1 from public.family_links fl where fl.token = t and fl.active)
    then null
    else coalesce((
      select jsonb_agg(jsonb_build_object(
        'chapter_id', sc.chapter_id,
        'title', sc.title,
        'content', sc.content,
        'updated_at', sc.updated_at
      ) order by sc.chapter_id)
      from public.shared_chapters sc
      where sc.token = t
    ), '[]'::jsonb)
  end
$$;
