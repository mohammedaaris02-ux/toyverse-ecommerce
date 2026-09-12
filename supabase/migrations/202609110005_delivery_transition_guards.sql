create or replace function public.admin_update_delivery_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_assignment uuid;
  v_current text;
  v_allowed text[];
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  select id, status into v_assignment, v_current
  from public.delivery_assignments
  where order_id = p_order_id
  for update;

  if v_assignment is null then raise exception 'Assign a delivery agent first.'; end if;

  v_allowed := case v_current
    when 'assigned' then array['picked_up', 'delivery_failed', 'cancelled']
    when 'picked_up' then array['in_transit', 'delivery_failed', 'cancelled']
    when 'in_transit' then array['out_for_delivery', 'delivery_failed', 'cancelled']
    when 'out_for_delivery' then array['delivered', 'delivery_failed', 'cancelled']
    else array[]::text[]
  end;

  if not (p_status = any(v_allowed)) then
    raise exception 'Invalid delivery transition from % to %.', v_current, p_status;
  end if;

  update public.delivery_assignments set
    status = p_status,
    picked_up_at = case when p_status = 'picked_up' then now() else picked_up_at end,
    out_for_delivery_at = case when p_status = 'out_for_delivery' then now() else out_for_delivery_at end,
    delivered_at = case when p_status = 'delivered' then now() else delivered_at end
  where id = v_assignment;

  update public.orders set
    status = case
      when p_status = 'delivered' then 'delivered'
      when p_status = 'cancelled' then 'cancelled'
      when p_status in ('picked_up', 'in_transit', 'out_for_delivery') then 'shipped'
      else status
    end,
    updated_at = now()
  where id = p_order_id;

  insert into public.delivery_events(order_id, delivery_assignment_id, status, message, created_by)
  values (
    p_order_id,
    v_assignment,
    p_status,
    case p_status
      when 'picked_up' then 'Order picked up.'
      when 'in_transit' then 'Order is in transit.'
      when 'out_for_delivery' then 'Order is out for delivery.'
      when 'delivered' then 'Order delivered successfully.'
      when 'delivery_failed' then 'Delivery attempt was unsuccessful.'
      else 'Delivery cancelled.'
    end,
    auth.uid()
  );
end $$;

revoke all on function public.admin_update_delivery_status(uuid, text) from public;
grant execute on function public.admin_update_delivery_status(uuid, text) to authenticated;
