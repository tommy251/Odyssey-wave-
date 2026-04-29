# Odyssey Wave — Supabase Setup

This is a one-time setup. Takes ~5 minutes.

## 1. Create a Supabase project
1. Go to https://supabase.com → New project
2. Save your project URL and `anon` (publishable) key — you'll need them in step 4

## 2. Run the SQL setup
Open Supabase Dashboard → **SQL Editor** → New query → paste the entire script below → Run.

```sql
-- =========================================
-- Odyssey Wave — initial schema
-- =========================================

-- Roles enum + table (NEVER store roles on profiles — security best practice)
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price_ngn integer not null check (price_ngn >= 0),
  description text not null default '',
  image_url text,
  category text,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select using (true);

create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update products"
  on public.products for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete products"
  on public.products for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid,
  product_name text not null,
  price_ngn integer not null,
  full_name text not null,
  phone text not null,
  address text not null,
  city text,
  state text,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Anyone can place an order"
  on public.orders for insert to anon, authenticated with check (true);

create policy "Admins can view orders"
  on public.orders for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update orders"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can view product images"
  on storage.objects for select using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
```

## 3. Create your admin user
1. Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: `tommybab7@gmail.com`, set a strong password, **check "Auto Confirm User"**
3. Copy the user's UUID (visible in the users list)
4. Back in **SQL Editor**, run:

```sql
insert into public.user_roles (user_id, role)
values ('PASTE-YOUR-USER-UUID-HERE', 'admin');
```

## 4. Connect the site to Supabase
Set these two environment variables in your Lovable project (Project settings → Environment):

- `VITE_SUPABASE_URL` = your Supabase project URL (e.g. `https://xxxxx.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` = your `anon` public key

After saving, the site will auto-reload. Go to `/admin`, sign in with `tommybab7@gmail.com`, and start adding products.

## You're done!
- `/` — Public storefront
- `/admin` — Login
- `/admin/dashboard` — Add products, view orders
