-- Run against a disposable Supabase database with 001_initial_schema.sql applied.
-- Uses a transaction and rolls back all fixtures. Requires a database admin role.
begin;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-000000000051', 'organizer-a@example.invalid', '{"display_name":"Organizatorius A"}'),
  ('00000000-0000-4000-8000-000000000052', 'organizer-b@example.invalid', '{"display_name":"Organizatorius B"}'),
  ('00000000-0000-4000-8000-000000000053', 'organizer-c@example.invalid', '{"display_name":"Organizatorius C"}');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000051', true);
insert into public.activities (creator_id,title,description,activity_type,starts_at,ends_at,location,capacity)
values ('00000000-0000-4000-8000-000000000051','RLS test','','Krepšinis',now()+interval '1 day',now()+interval '2 days','Vilnius',8);

do $$
declare affected integer;
begin
  update public.activities set title = 'Owner edit' where creator_id = auth.uid();
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner must be able to edit'; end if;
  begin
    update public.activities set capacity = 20 where creator_id = auth.uid();
    raise exception 'Capacity update was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000052', true);
do $$
declare affected integer;
begin
  update public.activities set title = 'Foreign edit' where creator_id = '00000000-0000-4000-8000-000000000051';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Foreign activity was editable'; end if;
  begin
    insert into public.activities (creator_id,title,activity_type,starts_at,ends_at,location,capacity)
    values ('00000000-0000-4000-8000-000000000051','Forged owner','Krepšinis',now()+interval '1 day',now()+interval '2 days','Vilnius',8);
    raise exception 'Forged creator was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
-- A fixture only: this does not call or implement the participant reservation flow.
insert into public.reservations (activity_id, user_id)
select id, '00000000-0000-4000-8000-000000000052' from public.activities
where creator_id = '00000000-0000-4000-8000-000000000051';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000053', true);
do $$
begin
  if exists (select 1 from public.reservations where user_id = '00000000-0000-4000-8000-000000000052') then
    raise exception 'Unrelated user can see participants';
  end if;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000051', true);
do $$
begin
  if not exists (select 1 from public.reservations where user_id = '00000000-0000-4000-8000-000000000052') then
    raise exception 'Owner cannot see participants';
  end if;
end $$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  begin
    insert into public.activities (creator_id,title,activity_type,starts_at,ends_at,location,capacity)
    values ('00000000-0000-4000-8000-000000000051','Anonymous','Krepšinis',now()+interval '1 day',now()+interval '2 days','Vilnius',8);
    raise exception 'Anonymous creation was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
