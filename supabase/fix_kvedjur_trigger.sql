-- Lagfæring: "Database error saving new user" við nýskráningu á barnasagan.is.
-- Orsök: afgangs-trigger frá kvedjur.is (kvedjur_on_auth_user_created) í BARNASAGAN-verkefninu.
-- Kveðjur eru nú í eigin Supabase-verkefni, svo triggerinn hér gerir ekkert gagn.
-- Keyra í SQL Editor í BARNASAGAN-verkefninu. Eyðir engum gögnum og engum töflum.

drop trigger if exists kvedjur_on_auth_user_created on auth.users;

-- Staðfesting: á að skila engri röð (eða aðeins triggerum sem þú þekkir).
select t.tgname as trigger_nafn, p.proname as fall
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
where t.tgrelid = 'auth.users'::regclass
  and not t.tgisinternal;
