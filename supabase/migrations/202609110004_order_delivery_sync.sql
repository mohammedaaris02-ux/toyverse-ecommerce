do $$
declare constraint_name text;
begin
  for constraint_name in
    select c.conname from pg_constraint c
    join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey)
    where c.conrelid='public.orders'::regclass and c.contype='c' and a.attname='status'
  loop execute format('alter table public.orders drop constraint %I',constraint_name); end loop;
end $$;
alter table public.orders add constraint orders_status_check
check (status in ('pending','paid','processing','packed','shipped','delivered','cancelled','failed')) not valid;
alter table public.orders validate constraint orders_status_check;

drop policy if exists "Customers read own delivery assignments" on public.delivery_assignments;
create policy "Customers read own delivery assignments" on public.delivery_assignments for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
drop policy if exists "Customers read assigned delivery agent" on public.delivery_agents;
create policy "Customers read assigned delivery agent" on public.delivery_agents for select to authenticated
using (exists(select 1 from public.delivery_assignments da join public.orders o on o.id=da.order_id where da.delivery_agent_id=delivery_agents.id and o.user_id=auth.uid()));
drop policy if exists "Customers read own delivery events" on public.delivery_events;
create policy "Customers read own delivery events" on public.delivery_events for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

create or replace function public.admin_update_order_status(p_order_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required.'; end if;
  if p_status not in ('processing','packed','cancelled') then raise exception 'Invalid manual order status.'; end if;
  if exists(select 1 from public.orders where id=p_order_id and status in ('delivered','cancelled')) then raise exception 'This order is already closed.'; end if;
  update public.orders set status=p_status,updated_at=now() where id=p_order_id;
  if not found then raise exception 'Order not found.'; end if;
  if p_status='cancelled' then
    update public.delivery_assignments set status='cancelled' where order_id=p_order_id and status<>'delivered';
    insert into public.delivery_events(order_id,delivery_assignment_id,status,message,created_by)
    select p_order_id,id,'cancelled','Order cancelled.',auth.uid() from public.delivery_assignments where order_id=p_order_id;
  end if;
end $$;
revoke all on function public.admin_update_order_status(uuid,text) from public;
grant execute on function public.admin_update_order_status(uuid,text) to authenticated;

create or replace function public.admin_assign_delivery(p_order_id uuid,p_agent_id uuid,p_expected date default null)
returns void language plpgsql security definer set search_path=public as $$
declare v_assignment uuid;
begin
  if not public.is_admin() then raise exception 'Administrator access required.'; end if;
  if not exists(select 1 from public.orders where id=p_order_id and status='packed') then raise exception 'Mark this order as Packed before assigning delivery.'; end if;
  if not exists(select 1 from public.delivery_agents where id=p_agent_id and is_active) then raise exception 'Select an active delivery agent.'; end if;
  insert into public.delivery_assignments(order_id,delivery_agent_id,status,assigned_at,expected_delivery_date)
  values(p_order_id,p_agent_id,'assigned',now(),p_expected)
  on conflict(order_id) do update set delivery_agent_id=excluded.delivery_agent_id,status='assigned',assigned_at=now(),expected_delivery_date=excluded.expected_delivery_date
  returning id into v_assignment;
  insert into public.delivery_events(order_id,delivery_assignment_id,status,message,created_by)
  values(p_order_id,v_assignment,'assigned','Delivery partner assigned.',auth.uid());
end $$;
revoke all on function public.admin_assign_delivery(uuid,uuid,date) from public;
grant execute on function public.admin_assign_delivery(uuid,uuid,date) to authenticated;
