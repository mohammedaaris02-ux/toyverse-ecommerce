create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  order_number text not null unique,
  status text not null default 'processing',
  payment_status text not null default 'paid',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency text not null default 'INR',
  shipping_full_name text not null,
  shipping_phone text not null,
  shipping_address_line1 text not null,
  shipping_address_line2 text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postal_code text not null,
  shipping_country text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_image text,
  sku text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null,
  status text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists payments_order_idx on public.payments(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders" on public.orders for select to authenticated
using (user_id = auth.uid() or public.is_admin());
drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items" on public.order_items for select to authenticated
using (exists (select 1 from public.orders where orders.id = order_id and (orders.user_id = auth.uid() or public.is_admin())));
drop policy if exists "Customers read own payments" on public.payments;
create policy "Customers read own payments" on public.payments for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create or replace function public.place_demo_order(p_shipping jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2);
  v_item_count integer;
begin
  if v_user is null then raise exception 'Please sign in again before placing your order.'; end if;
  if coalesce(trim(p_shipping->>'full_name'), '') = ''
    or coalesce(trim(p_shipping->>'phone'), '') = ''
    or coalesce(trim(p_shipping->>'address_line1'), '') = ''
    or coalesce(trim(p_shipping->>'city'), '') = ''
    or coalesce(trim(p_shipping->>'state'), '') = ''
    or coalesce(trim(p_shipping->>'postal_code'), '') = ''
    or coalesce(trim(p_shipping->>'country'), '') = ''
  then raise exception 'Complete all required delivery details.'; end if;

  perform 1 from public.products p
  join public.cart_items c on c.product_id = p.id
  where c.user_id = v_user for update of p;

  select count(*), sum(p.price * c.quantity)
  into v_item_count, v_subtotal
  from public.cart_items c join public.products p on p.id = c.product_id
  where c.user_id = v_user and p.is_active and c.quantity > 0 and c.quantity <= p.stock;

  if not exists (select 1 from public.cart_items where user_id = v_user) then
    raise exception 'Your cart is empty.';
  end if;
  if v_item_count <> (select count(*) from public.cart_items where user_id = v_user) then
    raise exception 'One or more cart items are unavailable or have insufficient stock.';
  end if;

  v_order_number := 'TV-' || to_char(clock_timestamp(), 'YYYYMMDD-HH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.orders (
    user_id, order_number, status, payment_status, subtotal, shipping_amount,
    discount_amount, total_amount, currency, shipping_full_name, shipping_phone,
    shipping_address_line1, shipping_address_line2, shipping_city, shipping_state,
    shipping_postal_code, shipping_country
  ) values (
    v_user, v_order_number, 'processing', 'paid', v_subtotal, 0, 0, v_subtotal,
    'INR', trim(p_shipping->>'full_name'), trim(p_shipping->>'phone'),
    trim(p_shipping->>'address_line1'), nullif(trim(p_shipping->>'address_line2'), ''),
    trim(p_shipping->>'city'), trim(p_shipping->>'state'),
    trim(p_shipping->>'postal_code'), trim(p_shipping->>'country')
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id, product_id, product_name, product_slug, product_image, sku,
    unit_price, quantity, line_total
  ) select v_order_id, p.id, p.name, p.slug, p.featured_image, p.sku,
    p.price, c.quantity, p.price * c.quantity
  from public.cart_items c join public.products p on p.id = c.product_id
  where c.user_id = v_user;

  update public.products p set stock = p.stock - c.quantity, updated_at = now()
  from public.cart_items c where c.user_id = v_user and c.product_id = p.id;

  -- Development demo payment flow. Replace with real payment verification before production.
  insert into public.payments (order_id, user_id, provider, status, amount, currency)
  values (v_order_id, v_user, 'demo', 'paid', v_subtotal, 'INR');

  delete from public.cart_items where user_id = v_user;
  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number,
    'total_amount', v_subtotal, 'status', 'processing', 'payment_status', 'paid');
end;
$$;

revoke all on function public.place_demo_order(jsonb) from public;
grant execute on function public.place_demo_order(jsonb) to authenticated;
