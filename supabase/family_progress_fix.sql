-- Lagfæring á family_progress(): framvindan sýndi alltaf tóman lista því state_json
-- er JSON-strengur inni í jsonb-dálki. Keyra þetta í SQL Editor (má keyra aftur og aftur).

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
          -- state_json er vistað sem JSON-strengur (JSON.stringify) inni í jsonb-dálki, svo
          -- (up.state_json)::jsonb er bara strengurinn og ->'chapters' skilar null.
          -- to_jsonb(..) #>> '{}' dregur strenginn út, ::jsonb þáttar hann; virkar líka fyrir text-dálk.
          from jsonb_array_elements((to_jsonb(up.state_json) #>> '{}')::jsonb->'chapters') ch
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
