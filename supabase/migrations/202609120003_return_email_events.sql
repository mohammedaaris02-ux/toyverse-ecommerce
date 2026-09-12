create table if not exists public.return_email_events (
  id uuid primary key default gen_random_uuid(),
  return_request_id uuid not null references public.return_requests(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null check (event_type in ('return_refunded')),
  recipient_email text not null,
  provider_message_id text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(return_request_id, event_type)
);

create index if not exists return_email_events_order_idx
  on public.return_email_events(order_id, created_at desc);

drop trigger if exists return_email_events_set_updated_at on public.return_email_events;
create trigger return_email_events_set_updated_at
before update on public.return_email_events
for each row execute function public.set_updated_at();

alter table public.return_email_events enable row level security;

create policy "Users read own return email events"
on public.return_email_events for select to authenticated
using (
  exists (
    select 1 from public.return_requests r
    where r.id = return_request_id
      and (r.user_id = auth.uid() or public.is_admin())
  )
);

create policy "Admins create return email events"
on public.return_email_events for insert to authenticated
with check (
  public.is_admin()
  and exists (
    select 1 from public.return_requests r
    join public.orders o on o.id = r.order_id
    where r.id = return_request_id
      and r.order_id = order_id
      and o.customer_email = recipient_email
  )
);

create policy "Admins update return email events"
on public.return_email_events for update to authenticated
using (public.is_admin())
with check (public.is_admin());
