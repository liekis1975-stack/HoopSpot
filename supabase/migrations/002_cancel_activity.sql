-- Veiklą atšaukia tik jos kūrėjas; rezervacijų istorija nekeičiama.
begin;

create or replace function public.cancel_activity(p_activity_id bigint)
returns public.activities
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_user_id uuid := auth.uid();
  activity_row public.activities;
begin
  if current_user_id is null then
    raise exception 'Veiklos atšaukimui reikia prisijungti';
  end if;

  select * into activity_row
  from public.activities
  where id = p_activity_id and creator_id = current_user_id
  for update;

  if not found then
    raise exception 'Veikla nerasta arba neturite teisės jos atšaukti';
  end if;

  if activity_row.status = 'cancelled' then
    return activity_row;
  end if;

  update public.activities
  set status = 'cancelled'
  where id = activity_row.id
  returning * into activity_row;

  return activity_row;
end;
$$;

revoke all on function public.cancel_activity(bigint) from public, anon;
grant execute on function public.cancel_activity(bigint) to authenticated;

commit;
