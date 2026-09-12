create table if not exists public.delivery_agents (
  id uuid primary key default gen_random_uuid(), full_name text not null,
  phone text not null, email text, vehicle_type text, vehicle_number text,
  is_active boolean not null default true, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  delivery_agent_id uuid references public.delivery_agents(id) on delete set null,
  status text not null default 'unassigned' check (status in ('unassigned','assigned','picked_up','in_transit','out_for_delivery','delivered','delivery_failed','cancelled')),
  assigned_at timestamptz, picked_up_at timestamptz, out_for_delivery_at timestamptz,
  delivered_at timestamptz, expected_delivery_date date, delivery_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.delivery_events (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  delivery_assignment_id uuid references public.delivery_assignments(id) on delete cascade,
  status text not null, message text, created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists delivery_assignments_status_idx on public.delivery_assignments(status);
create index if not exists delivery_events_order_idx on public.delivery_events(order_id, created_at);

drop trigger if exists delivery_agents_set_updated_at on public.delivery_agents;
create trigger delivery_agents_set_updated_at before update on public.delivery_agents
for each row execute function public.set_updated_at();
drop trigger if exists delivery_assignments_set_updated_at on public.delivery_assignments;
create trigger delivery_assignments_set_updated_at before update on public.delivery_assignments
for each row execute function public.set_updated_at();

alter table public.delivery_agents enable row level security;
alter table public.delivery_assignments enable row level security;
alter table public.delivery_events enable row level security;
create policy "Admins manage delivery agents" on public.delivery_agents for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage delivery assignments" on public.delivery_assignments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Customers read own delivery assignments" on public.delivery_assignments for select to authenticated using (exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid()));
create policy "Admins manage delivery events" on public.delivery_events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Customers read own delivery events" on public.delivery_events for select to authenticated using (exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid()));
create policy "Customers read assigned delivery agent" on public.delivery_agents for select to authenticated using (exists (select 1 from public.delivery_assignments da join public.orders o on o.id = da.order_id where da.delivery_agent_id = delivery_agents.id and o.user_id = auth.uid()));

create or replace function public.admin_assign_delivery(p_order_id uuid, p_agent_id uuid, p_expected date default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_assignment uuid;
begin
  if not public.is_admin() then raise exception 'Administrator access required.'; end if;
  if not exists(select 1 from public.delivery_agents where id=p_agent_id and is_active) then raise exception 'Select an active delivery agent.'; end if;
  insert into public.delivery_assignments(order_id,delivery_agent_id,status,assigned_at,expected_delivery_date)
  values(p_order_id,p_agent_id,'assigned',now(),p_expected)
  on conflict(order_id) do update set delivery_agent_id=excluded.delivery_agent_id,status='assigned',assigned_at=now(),expected_delivery_date=excluded.expected_delivery_date
  returning id into v_assignment;
  update public.orders set status='processing',updated_at=now() where id=p_order_id and status not in ('delivered','cancelled');
  insert into public.delivery_events(order_id,delivery_assignment_id,status,message,created_by)
  values(p_order_id,v_assignment,'assigned','Delivery partner assigned.',auth.uid());
end; $$;

create or replace function public.admin_update_delivery_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare v_assignment uuid; v_current text;
begin
  if not public.is_admin() then raise exception 'Administrator access required.'; end if;
  if p_status not in ('picked_up','in_transit','out_for_delivery','delivered','delivery_failed','cancelled') then raise exception 'Invalid delivery status.'; end if;
  select id,status into v_assignment,v_current from public.delivery_assignments where order_id=p_order_id for update;
  if v_assignment is null then raise exception 'Assign a delivery agent first.'; end if;
  if v_current in ('delivered','cancelled') then raise exception 'This delivery is already closed.'; end if;
  update public.delivery_assignments set status=p_status,
    picked_up_at=case when p_status='picked_up' then now() else picked_up_at end,
    out_for_delivery_at=case when p_status='out_for_delivery' then now() else out_for_delivery_at end,
    delivered_at=case when p_status='delivered' then now() else delivered_at end
  where id=v_assignment;
  update public.orders set status=case when p_status='delivered' then 'delivered' when p_status='cancelled' then 'cancelled' when p_status in ('picked_up','in_transit','out_for_delivery') then 'shipped' else status end,updated_at=now() where id=p_order_id;
  insert into public.delivery_events(order_id,delivery_assignment_id,status,message,created_by)
  values(p_order_id,v_assignment,p_status,case p_status when 'picked_up' then 'Order picked up.' when 'in_transit' then 'Order is in transit.' when 'out_for_delivery' then 'Order is out for delivery.' when 'delivered' then 'Order delivered successfully.' when 'delivery_failed' then 'Delivery attempt was unsuccessful.' else 'Delivery cancelled.' end,auth.uid());
end; $$;
revoke all on function public.admin_assign_delivery(uuid,uuid,date) from public;
revoke all on function public.admin_update_delivery_status(uuid,text) from public;
grant execute on function public.admin_assign_delivery(uuid,uuid,date) to authenticated;
grant execute on function public.admin_update_delivery_status(uuid,text) to authenticated;
