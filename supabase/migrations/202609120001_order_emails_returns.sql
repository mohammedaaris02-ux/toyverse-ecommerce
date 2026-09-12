alter table public.orders add column if not exists customer_email text;

create or replace function public.set_order_customer_email()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if new.customer_email is null then
    select email into new.customer_email from auth.users where id = new.user_id;
  end if;
  return new;
end $$;

drop trigger if exists orders_set_customer_email on public.orders;
create trigger orders_set_customer_email before insert on public.orders
for each row execute function public.set_order_customer_email();

update public.orders o set customer_email = u.email
from auth.users u where u.id = o.user_id and o.customer_email is null;

create table if not exists public.order_email_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null check (event_type in ('order_confirmation','order_delivered')),
  recipient_email text not null,
  provider_message_id text,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id, event_type)
);

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'requested' check (status in ('requested','approved','rejected','received','refunded','closed')),
  admin_note text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id)
);

create index if not exists return_requests_user_idx on public.return_requests(user_id, requested_at desc);
create index if not exists return_requests_status_idx on public.return_requests(status, requested_at desc);

drop trigger if exists order_email_events_set_updated_at on public.order_email_events;
create trigger order_email_events_set_updated_at before update on public.order_email_events
for each row execute function public.set_updated_at();
drop trigger if exists return_requests_set_updated_at on public.return_requests;
create trigger return_requests_set_updated_at before update on public.return_requests
for each row execute function public.set_updated_at();

alter table public.order_email_events enable row level security;
alter table public.return_requests enable row level security;

create policy "Users read own order email events" on public.order_email_events for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "Users create own order email events" on public.order_email_events for insert to authenticated
with check (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin()) and o.customer_email=recipient_email));
create policy "Users update own order email events" on public.order_email_events for update to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())))
with check (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin()) and o.customer_email=recipient_email));

create policy "Customers read own returns" on public.return_requests for select to authenticated
using (user_id=auth.uid() or public.is_admin());
create policy "Admins manage returns" on public.return_requests for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create or replace function public.request_order_return(p_order_id uuid, p_reason text, p_details text default null)
returns public.return_requests language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid(); v_delivered timestamptz; v_result public.return_requests;
begin
  if v_user is null then raise exception 'UNAUTHORIZED'; end if;
  if not exists(select 1 from public.orders where id=p_order_id) then raise exception 'ORDER_NOT_FOUND'; end if;
  if not exists(select 1 from public.orders where id=p_order_id and user_id=v_user) then raise exception 'UNAUTHORIZED'; end if;
  select da.delivered_at into v_delivered from public.delivery_assignments da join public.orders o on o.id=da.order_id
  where da.order_id=p_order_id and o.user_id=v_user and o.status='delivered';
  if v_delivered is null then raise exception 'RETURN_NOT_DELIVERED'; end if;
  if now()>v_delivered+interval '7 days' then raise exception 'RETURN_WINDOW_EXPIRED'; end if;
  if exists(select 1 from public.return_requests where order_id=p_order_id) then raise exception 'RETURN_ALREADY_EXISTS'; end if;
  if trim(coalesce(p_reason,''))='' then raise exception 'RETURN_REASON_REQUIRED'; end if;
  insert into public.return_requests(order_id,user_id,reason,details)
  values(p_order_id,v_user,trim(p_reason),nullif(trim(coalesce(p_details,'')),'')) returning * into v_result;
  return v_result;
exception when unique_violation then raise exception 'RETURN_ALREADY_EXISTS';
end $$;

create or replace function public.admin_update_return(p_return_id uuid,p_status text,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare v_current text; v_allowed text[];
begin
  if not public.is_admin() then raise exception 'Administrator access required.'; end if;
  select status into v_current from public.return_requests where id=p_return_id for update;
  if v_current is null then raise exception 'Return request not found.'; end if;
  v_allowed:=case v_current when 'requested' then array['approved','rejected'] when 'approved' then array['received'] when 'received' then array['refunded','closed'] when 'rejected' then array['closed'] else array[]::text[] end;
  if not (p_status=any(v_allowed)) then raise exception 'Invalid return status transition.'; end if;
  update public.return_requests set status=p_status,admin_note=nullif(trim(coalesce(p_note,'')),''),
    reviewed_at=case when p_status in ('approved','rejected') then now() else reviewed_at end,
    completed_at=case when p_status in ('refunded','closed') then now() else completed_at end
  where id=p_return_id;
end $$;

revoke all on function public.request_order_return(uuid,text,text) from public;
revoke all on function public.admin_update_return(uuid,text,text) from public;
grant execute on function public.request_order_return(uuid,text,text) to authenticated;
grant execute on function public.admin_update_return(uuid,text,text) to authenticated;
