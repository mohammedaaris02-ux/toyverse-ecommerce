create or replace function public.set_order_customer_email()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if nullif(trim(coalesce(new.customer_email, '')), '') is null then
    select coalesce(
      nullif(trim(u.email), ''),
      nullif(trim(u.raw_user_meta_data ->> 'email'), '')
    )
    into new.customer_email
    from auth.users u
    where u.id = new.user_id;
  end if;
  return new;
end;
$$;

update public.orders o
set customer_email = coalesce(
  nullif(trim(u.email), ''),
  nullif(trim(u.raw_user_meta_data ->> 'email'), '')
)
from auth.users u
where u.id = o.user_id
  and nullif(trim(coalesce(o.customer_email, '')), '') is null;

create or replace function public.resolve_order_recipient_email(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_owner uuid;
  v_stored text;
  v_recipient text;
begin
  if v_actor is null then raise exception 'UNAUTHORIZED'; end if;

  select user_id, nullif(trim(customer_email), '')
  into v_owner, v_stored
  from public.orders
  where id = p_order_id;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_owner <> v_actor and not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;

  select coalesce(
    nullif(trim(u.email), ''),
    nullif(trim(u.raw_user_meta_data ->> 'email'), ''),
    v_stored
  )
  into v_recipient
  from auth.users u
  where u.id = v_owner;

  v_recipient := coalesce(v_recipient, v_stored);
  if v_recipient is not null and v_recipient is distinct from v_stored then
    update public.orders
    set customer_email = v_recipient, updated_at = now()
    where id = p_order_id;
  end if;

  return v_recipient;
end;
$$;

revoke all on function public.resolve_order_recipient_email(uuid) from public;
grant execute on function public.resolve_order_recipient_email(uuid) to authenticated;
