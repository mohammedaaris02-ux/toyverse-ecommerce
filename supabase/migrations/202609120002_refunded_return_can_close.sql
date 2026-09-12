create or replace function public.admin_update_return(
  p_return_id uuid,
  p_status text,
  p_note text default null
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
  from public.return_requests
  where id = p_return_id
  for update;

  if v_current is null then
    raise exception 'Return request not found.';
  end if;

  v_allowed := case v_current
    when 'requested' then array['approved', 'rejected']
    when 'approved' then array['received']
    when 'received' then array['refunded', 'closed']
    when 'refunded' then array['closed']
    when 'rejected' then array['closed']
    else array[]::text[]
  end;

  if not (p_status = any(v_allowed)) then
    raise exception 'Invalid return status transition.';
  end if;

  update public.return_requests
  set
    status = p_status,
    admin_note = nullif(trim(coalesce(p_note, '')), ''),
    reviewed_at = case
      when p_status in ('approved', 'rejected') then now()
      else reviewed_at
    end,
    completed_at = case
      when p_status in ('refunded', 'closed') then now()
      else completed_at
    end
  where id = p_return_id;
end;
$$;

revoke all on function public.admin_update_return(uuid, text, text) from public;
grant execute on function public.admin_update_return(uuid, text, text) to authenticated;
