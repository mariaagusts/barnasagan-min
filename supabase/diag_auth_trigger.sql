-- Greining: "Database error saving new user" við nýskráningu.
-- Keyra í SQL Editor (BARNASAGAN-verkefnið). Breytir engu, sýnir bara.

-- 1) Allir triggerar á auth.users og fallið sem hver þeirra keyrir.
select t.tgname as trigger_nafn,
       p.proname as fall,
       pg_get_triggerdef(t.oid) as skilgreining,
       pg_get_functiondef(p.oid) as fall_kodi
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
where t.tgrelid = 'auth.users'::regclass
  and not t.tgisinternal;

-- 2) Töflur sem vísa í auth.users (til að sjá hvert triggerinn gæti verið að skrifa).
select conrelid::regclass as tafla, conname
from pg_constraint
where confrelid = 'auth.users'::regclass;
