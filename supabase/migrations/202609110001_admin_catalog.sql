create extension if not exists pgcrypto;

alter table public.products add column if not exists age_group text;
alter table public.products add column if not exists recommended_age text;
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists material text;
alter table public.products add column if not exists rating numeric(2,1) not null default 0 check (rating between 0 and 5);
alter table public.products add column if not exists review_count integer not null default 0 check (review_count >= 0);
alter table public.products add column if not exists is_on_sale boolean not null default false;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
  on public.product_images(product_id, sort_order);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
for select using (is_active = true or public.is_admin());
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories" on public.categories
for select using (is_active = true or public.is_admin());
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read active product images" on public.product_images;
create policy "Public can read active product images" on public.product_images
for select using (
  exists (select 1 from public.products where products.id = product_id and products.is_active = true)
  or public.is_admin()
);
drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
for select using (bucket_id = 'product-images');
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
for update to authenticated using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

