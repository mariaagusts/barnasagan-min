-- ══ RÖDD BARNSINS ══
-- Upptökur af rödd barnsins (ekki foreldra). Skrárnar sjálfar liggja í
-- voice-recordings fötunni undir {user_id}/{child_id}/barnsrodd/.
-- Þak: 10 upptökur á barn (framfylgt í viðmótinu og hér með triggeri).

create table if not exists public.child_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  path text not null,
  label text,
  recorded_at date default current_date,
  duration_sec int,
  created_at timestamptz not null default now()
);

alter table public.child_recordings enable row level security;

drop policy if exists "child_recordings_owner" on public.child_recordings;
create policy "child_recordings_owner" on public.child_recordings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Geymsluþak: aldrei fleiri en 10 upptökur á hvert barn
create or replace function public.enforce_child_recording_cap()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.child_recordings
      where child_id = new.child_id and user_id = new.user_id) >= 10 then
    raise exception 'Geymslan er full: 10 upptökur á barn';
  end if;
  return new;
end $$;

drop trigger if exists child_recording_cap on public.child_recordings;
create trigger child_recording_cap
  before insert on public.child_recordings
  for each row execute function public.enforce_child_recording_cap();
