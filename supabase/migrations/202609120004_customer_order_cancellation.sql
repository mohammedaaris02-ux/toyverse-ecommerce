alter table public.orders
  add column if not exists cancellation_reason text,
  add column if not exists cancelled_at timestamptz;

do $$
declare constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    where c.conrelid = 'public.order_email_events'::regclass
      and c.contype = 'c'
      and a.attname = 'event_type'
  loop
    execute format(
      'alter table public.order_email_events drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.order_email_events
  add constraint order_email_events_event_type_check
  check (event_type in ('order_confirmation', 'order_delivered', 'order_cancelled'));

create or replace function public.cancel_customer_order(
  p_order_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_status text;
begin
  if v_user is null then raise exception 'UNAUTHORIZED'; end if;

  select user_id, status into v_owner, v_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_owner <> v_user then raise exception 'UNAUTHORIZED'; end if;
  if v_status = 'cancelled' then raise exception 'ORDER_ALREADY_CANCELLED'; end if;
  if v_status <> 'processing' then raise exception 'ORDER_NOT_CANCELLABLE'; end if;

  update public.products p
  set stock = p.stock + quantities.quantity,
      updated_at = now()
  from (
    select product_id, sum(quantity)::integer as quantity
    from public.order_items
    where order_id = p_order_id
    group by product_id
  ) quantities
  where p.id = quantities.product_id;

  update public.orders
  set status = 'cancelled',
      cancellation_reason = nullif(trim(coalesce(p_reason, '')), ''),
      cancelled_at = now(),
      updated_at = now()
  where id = p_order_id;

  update public.delivery_assignments
  set status = 'cancelled'
  where order_id = p_order_id and status <> 'delivered';
end;
$$;

revoke all on function public.cancel_customer_order(uuid, text) from public;
grant execute on function public.cancel_customer_order(uuid, text) to authenticated;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_allowed text[];
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  select status into v_current
  from public.orders
  where id = p_order_id
  for update;

  if not found then raise exception 'Order not found.'; end if;

  v_allowed := case v_current
    when 'pending' then array['processing', 'cancelled']
    when 'paid' then array['processing', 'cancelled']
    when 'processing' then array['packed', 'cancelled']
    when 'packed' then array['cancelled']
    else array[]::text[]
  end;

  if not (p_status = any(v_allowed)) then
    raise exception 'Invalid order status transition.';
  end if;

  if p_status = 'cancelled' then
    update public.products p
    set stock = p.stock + quantities.quantity,
        updated_at = now()
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id
      group by product_id
    ) quantities
    where p.id = quantities.product_id;
  end if;

  update public.orders
  set status = p_status,
      cancellation_reason = case
        when p_status = 'cancelled' then 'Cancelled by administrator'
        else cancellation_reason
      end,
      cancelled_at = case
        when p_status = 'cancelled' then now()
        else cancelled_at
      end,
      updated_at = now()
  where id = p_order_id;

  if p_status = 'cancelled' then
    update public.delivery_assignments
    set status = 'cancelled'
    where order_id = p_order_id and status <> 'delivered';

    insert into public.delivery_events(
      order_id, delivery_assignment_id, status, message, created_by
    )
    select p_order_id, id, 'cancelled', 'Order cancelled.', auth.uid()
    from public.delivery_assignments
    where order_id = p_order_id;
  end if;
end;
$$;

revoke all on function public.admin_update_order_status(uuid, text) from public;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated;

create or replace function public.admin_assign_delivery(
  p_order_id uuid,
  p_agent_id uuid,
  p_expected date default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_assignment uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;
  if not exists(
    select 1 from public.orders where id = p_order_id and status = 'packed'
  ) then
    raise exception 'Mark this order as Packed before assigning delivery.';
  end if;
  if not exists(
    select 1 from public.delivery_agents where id = p_agent_id and is_active
  ) then
    raise exception 'Select an active delivery agent.';
  end if;

  insert into public.delivery_assignments(
    order_id, delivery_agent_id, status, assigned_at, expected_delivery_date
  ) values (p_order_id, p_agent_id, 'assigned', now(), p_expected)
  on conflict(order_id) do update set
    delivery_agent_id = excluded.delivery_agent_id,
    status = 'assigned',
    assigned_at = now(),
    expected_delivery_date = excluded.expected_delivery_date
  returning id into v_assignment;

  insert into public.delivery_events(
    order_id, delivery_assignment_id, status, message, created_by
  ) values (
    p_order_id, v_assignment, 'assigned', 'Delivery partner assigned.', auth.uid()
  );
end;
$$;

revoke all on function public.admin_assign_delivery(uuid, uuid, date) from public;
grant execute on function public.admin_assign_delivery(uuid, uuid, date) to authenticated;
