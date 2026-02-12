-- ============================================================
-- Materiales10 — Supabase Schema
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================================

-- 0. Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- Categorías (rubros)
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text not null default '',
  created_at timestamptz not null default now()
);

-- Productos (catálogo global)
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category_id uuid not null references categories(id),
  unit text not null default 'unidad',
  created_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_name_trgm on products using gin (name gin_trgm_ops);

-- Vendedores (los crea el admin)
create table if not exists vendors (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid,  -- puede ser null hasta que se asigne usuario
  name text not null,
  logo_url text,
  phone text,
  whatsapp text,
  email text,  -- email del vendedor para login
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_vendors_owner on vendors(owner_id);
create index if not exists idx_vendors_email on vendors(email);

-- Sucursales
create table if not exists branches (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  address text not null,
  city text not null,
  province text not null default 'Salta',
  lat double precision,
  lng double precision,
  phone text,
  whatsapp text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_branches_vendor on branches(vendor_id);

-- Ofertas (precio de un producto en una sucursal)
create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references branches(id) on delete cascade,
  product_id uuid not null references products(id),
  price numeric(12,2) not null,
  stock_status text not null default 'disponible'
    check (stock_status in ('disponible', 'consultar', 'sin_stock')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(branch_id, product_id)
);
create index if not exists idx_offers_branch on offers(branch_id);
create index if not exists idx_offers_product on offers(product_id);

-- Pedidos / Reservas
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_name text not null,
  buyer_phone text not null,
  buyer_email text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

-- Items del pedido
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  offer_id uuid not null references offers(id),
  quantity integer not null default 1,
  price_snapshot numeric(12,2) not null
);
create index if not exists idx_order_items_order on order_items(order_id);

-- Tabla de admins (emails que pueden acceder al panel admin)
create table if not exists admins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique,
  email text not null,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 2. RLS (Row Level Security)
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table vendors enable row level security;
alter table branches enable row level security;
alter table offers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admins enable row level security;

-- Categorías: lectura pública
create policy "categories_read" on categories for select using (true);

-- Productos: lectura pública
create policy "products_read" on products for select using (true);

-- Vendors: lectura pública, insert/update solo admin o owner
create policy "vendors_read" on vendors for select using (true);
create policy "vendors_insert" on vendors for insert with check (
  exists (select 1 from admins where admins.user_id = auth.uid())
);
create policy "vendors_update" on vendors for update using (
  auth.uid() = owner_id
  or exists (select 1 from admins where admins.user_id = auth.uid())
);
create policy "vendors_delete" on vendors for delete using (
  exists (select 1 from admins where admins.user_id = auth.uid())
);

-- Branches: lectura pública, escritura owner o admin
create policy "branches_read" on branches for select using (true);
create policy "branches_insert" on branches for insert with check (
  exists (
    select 1 from vendors
    where vendors.id = branches.vendor_id
      and (vendors.owner_id = auth.uid()
           or exists (select 1 from admins where admins.user_id = auth.uid()))
  )
);
create policy "branches_update" on branches for update using (
  exists (
    select 1 from vendors
    where vendors.id = branches.vendor_id
      and (vendors.owner_id = auth.uid()
           or exists (select 1 from admins where admins.user_id = auth.uid()))
  )
);
create policy "branches_delete" on branches for delete using (
  exists (
    select 1 from vendors
    where vendors.id = branches.vendor_id
      and (vendors.owner_id = auth.uid()
           or exists (select 1 from admins where admins.user_id = auth.uid()))
  )
);

-- Offers: lectura pública, escritura owner o admin
create policy "offers_read" on offers for select using (true);
create policy "offers_insert" on offers for insert with check (
  exists (
    select 1 from branches
    join vendors on vendors.id = branches.vendor_id
    where branches.id = offers.branch_id
      and (vendors.owner_id = auth.uid()
           or exists (select 1 from admins where admins.user_id = auth.uid()))
  )
);
create policy "offers_update" on offers for update using (
  exists (
    select 1 from branches
    join vendors on vendors.id = branches.vendor_id
    where branches.id = offers.branch_id
      and (vendors.owner_id = auth.uid()
           or exists (select 1 from admins where admins.user_id = auth.uid()))
  )
);
create policy "offers_delete" on offers for delete using (
  exists (
    select 1 from branches
    join vendors on vendors.id = branches.vendor_id
    where branches.id = offers.branch_id
      and (vendors.owner_id = auth.uid()
           or exists (select 1 from admins where admins.user_id = auth.uid()))
  )
);

-- Orders: cualquiera puede crear (anónimo), lectura pública
create policy "orders_insert" on orders for insert with check (true);
create policy "orders_read" on orders for select using (true);

-- Order items: cualquiera puede crear, lectura pública
create policy "order_items_insert" on order_items for insert with check (true);
create policy "order_items_read" on order_items for select using (true);

-- Admins: solo lectura para admins
create policy "admins_read" on admins for select using (
  auth.uid() = user_id
);


-- ============================================================
-- 3. RPC: search_offers
-- ============================================================

create or replace function search_offers(
  p_q text default '',
  p_buyer_lat double precision default null,
  p_buyer_lng double precision default null,
  p_category_slug text default null,
  p_sort_mode text default 'price',
  p_lim integer default 50,
  p_off integer default 0
)
returns table (
  offer_id uuid,
  product_name text,
  product_unit text,
  category_slug text,
  price numeric,
  stock_status text,
  vendor_name text,
  branch_name text,
  branch_city text,
  branch_address text,
  branch_phone text,
  branch_whatsapp text,
  branch_lat double precision,
  branch_lng double precision,
  distance_km double precision
)
language plpgsql
stable
as $$
begin
  return query
  select
    o.id as offer_id,
    p.name as product_name,
    p.unit as product_unit,
    c.slug as category_slug,
    o.price,
    o.stock_status,
    v.name as vendor_name,
    b.name as branch_name,
    b.city as branch_city,
    b.address as branch_address,
    b.phone as branch_phone,
    b.whatsapp as branch_whatsapp,
    b.lat as branch_lat,
    b.lng as branch_lng,
    case
      when p_buyer_lat is not null and p_buyer_lng is not null and b.lat is not null and b.lng is not null then
        round(
          (6371 * acos(
            cos(radians(p_buyer_lat)) * cos(radians(b.lat))
            * cos(radians(b.lng) - radians(p_buyer_lng))
            + sin(radians(p_buyer_lat)) * sin(radians(b.lat))
          ))::numeric, 1
        )::double precision
      else null
    end as distance_km
  from offers o
  join products p on p.id = o.product_id
  join categories c on c.id = p.category_id
  join branches b on b.id = o.branch_id
  join vendors v on v.id = b.vendor_id
  where
    v.is_active = true
    and b.is_active = true
    and (p_q = '' or p.name ilike '%' || p_q || '%')
    and (p_category_slug is null or c.slug = p_category_slug)
  order by
    case when p_sort_mode = 'price' then o.price end asc,
    case when p_sort_mode = 'distance' and p_buyer_lat is not null then
      (6371 * acos(
        cos(radians(p_buyer_lat)) * cos(radians(coalesce(b.lat, 0)))
        * cos(radians(coalesce(b.lng, 0)) - radians(p_buyer_lng))
        + sin(radians(p_buyer_lat)) * sin(radians(coalesce(b.lat, 0)))
      ))
    end asc nulls last,
    o.price asc
  limit p_lim
  offset p_off;
end;
$$;

-- Función para verificar si usuario es admin
create or replace function is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from admins where user_id = auth.uid()
  );
$$;


-- ============================================================
-- 4. SEED DATA — Categorías
-- ============================================================

insert into categories (name, slug, icon) values
  ('Plomería',     'plomeria',     '🔧'),
  ('Albañilería',  'albanileria',  '🧱'),
  ('Electricidad', 'electricidad', '⚡'),
  ('Gas',          'gas',          '🔥'),
  ('Ferretería',   'ferreteria',   '🔩'),
  ('Herrajes',     'herrajes',     '🚪')
on conflict (slug) do nothing;


-- ============================================================
-- 5. SEED DATA — Productos
-- ============================================================

insert into products (name, category_id, unit) values
  -- Plomería
  ('Caño PVC 110mm x 4m',           (select id from categories where slug='plomeria'), 'unidad'),
  ('Caño PVC 63mm x 4m',            (select id from categories where slug='plomeria'), 'unidad'),
  ('Caño PVC 50mm x 4m',            (select id from categories where slug='plomeria'), 'unidad'),
  ('Codo PVC 110mm',                (select id from categories where slug='plomeria'), 'unidad'),
  ('Codo PVC 63mm',                 (select id from categories where slug='plomeria'), 'unidad'),
  ('Pileta de cocina acero inox',   (select id from categories where slug='plomeria'), 'unidad'),
  ('Grifería monocomando cocina',   (select id from categories where slug='plomeria'), 'unidad'),
  ('Tanque de agua 500L',           (select id from categories where slug='plomeria'), 'unidad'),
  ('Tanque de agua 1000L',          (select id from categories where slug='plomeria'), 'unidad'),
  ('Flotante bronce 3/4',           (select id from categories where slug='plomeria'), 'unidad'),

  -- Albañilería
  ('Cemento Portland 50kg',         (select id from categories where slug='albanileria'), 'bolsa'),
  ('Cal hidráulica 25kg',           (select id from categories where slug='albanileria'), 'bolsa'),
  ('Arena gruesa',                  (select id from categories where slug='albanileria'), 'm³'),
  ('Arena fina',                    (select id from categories where slug='albanileria'), 'm³'),
  ('Piedra partida',                (select id from categories where slug='albanileria'), 'm³'),
  ('Ladrillo común',                (select id from categories where slug='albanileria'), 'millar'),
  ('Ladrillo hueco 12x18x33',       (select id from categories where slug='albanileria'), 'unidad'),
  ('Ladrillo hueco 8x18x33',        (select id from categories where slug='albanileria'), 'unidad'),
  ('Hierro 6mm x 12m',              (select id from categories where slug='albanileria'), 'barra'),
  ('Hierro 8mm x 12m',              (select id from categories where slug='albanileria'), 'barra'),
  ('Hierro 10mm x 12m',             (select id from categories where slug='albanileria'), 'barra'),
  ('Hierro 12mm x 12m',             (select id from categories where slug='albanileria'), 'barra'),
  ('Malla de acero 15x15 4mm',      (select id from categories where slug='albanileria'), 'paño'),
  ('Membrana asfáltica 4mm x 10m²', (select id from categories where slug='albanileria'), 'rollo'),

  -- Electricidad
  ('Cable unipolar 2.5mm² rollo 100m', (select id from categories where slug='electricidad'), 'rollo'),
  ('Cable unipolar 4mm² rollo 100m',   (select id from categories where slug='electricidad'), 'rollo'),
  ('Cable unipolar 1.5mm² rollo 100m', (select id from categories where slug='electricidad'), 'rollo'),
  ('Térmica bipolar 20A',              (select id from categories where slug='electricidad'), 'unidad'),
  ('Térmica bipolar 32A',              (select id from categories where slug='electricidad'), 'unidad'),
  ('Disyuntor diferencial 40A',        (select id from categories where slug='electricidad'), 'unidad'),
  ('Tablero embutir 8 bocas',          (select id from categories where slug='electricidad'), 'unidad'),
  ('Caño corrugado 3/4 rollo 25m',     (select id from categories where slug='electricidad'), 'rollo'),

  -- Gas
  ('Caño epoxi 1/2 x 6m',          (select id from categories where slug='gas'), 'tramo'),
  ('Caño epoxi 3/4 x 6m',          (select id from categories where slug='gas'), 'tramo'),
  ('Válvula esférica gas 1/2',     (select id from categories where slug='gas'), 'unidad'),
  ('Flexible gas 1/2 x 40cm',      (select id from categories where slug='gas'), 'unidad'),
  ('Regulador gas envasado',       (select id from categories where slug='gas'), 'unidad'),

  -- Ferretería
  ('Tornillo autoperforante 10x1"', (select id from categories where slug='ferreteria'), 'caja x100'),
  ('Tornillo para madera 4x40mm',   (select id from categories where slug='ferreteria'), 'caja x100'),
  ('Clavo 2"',                      (select id from categories where slug='ferreteria'), 'kg'),
  ('Clavo 3"',                      (select id from categories where slug='ferreteria'), 'kg'),
  ('Disco de corte 115mm',          (select id from categories where slug='ferreteria'), 'unidad'),
  ('Cinta de teflón',               (select id from categories where slug='ferreteria'), 'unidad'),
  ('Silicona transparente 280ml',   (select id from categories where slug='ferreteria'), 'unidad'),
  ('Lija al agua #150',             (select id from categories where slug='ferreteria'), 'unidad'),

  -- Herrajes
  ('Bisagra acero 3"',              (select id from categories where slug='herrajes'), 'par'),
  ('Cerradura embutir Prive 501',   (select id from categories where slug='herrajes'), 'unidad'),
  ('Manija doble balancín',         (select id from categories where slug='herrajes'), 'juego'),
  ('Picaporte bronce',              (select id from categories where slug='herrajes'), 'unidad'),
  ('Pasador 4"',                    (select id from categories where slug='herrajes'), 'unidad'),
  ('Riel para cajón 350mm',         (select id from categories where slug='herrajes'), 'par')
on conflict do nothing;


-- ============================================================
-- 6. SEED DATA — Empresas de ejemplo (2 vendedores)
-- ============================================================

-- EMPRESA 1: Corralón El Norte (Salta)
insert into vendors (id, name, phone, whatsapp, email, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Corralón El Norte', '0387-4234567', '5493874234567', 'corralon.elnorte@email.com', true);

-- Sucursales de Corralón El Norte
insert into branches (id, vendor_id, name, address, city, province, lat, lng, phone, whatsapp, is_active) values
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Casa Central', 'Av. Entre Ríos 1500', 'Salta Capital', 'Salta',
   -24.7821, -65.4232, '0387-4234567', '5493874234567', true),
  ('aaaa2222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Sucursal Cerrillos', 'Ruta 68 Km 5', 'Cerrillos', 'Salta',
   -24.8958, -65.4861, '0387-4901234', '5493874901234', true);


-- EMPRESA 2: Ferretería San José (Jujuy)
insert into vendors (id, name, phone, whatsapp, email, is_active) values
  ('22222222-2222-2222-2222-222222222222', 'Ferretería San José', '0388-4567890', '5493884567890', 'ferreteria.sanjose@email.com', true);

-- Sucursales de Ferretería San José
insert into branches (id, vendor_id, name, address, city, province, lat, lng, phone, whatsapp, is_active) values
  ('bbbb1111-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Local Centro', 'Belgrano 450', 'San Salvador de Jujuy', 'Jujuy',
   -24.1858, -65.2995, '0388-4567890', '5493884567890', true),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Sucursal Palpalá', 'Av. Libertad 200', 'Palpalá', 'Jujuy',
   -24.2573, -65.213, '0388-4123456', '5493884123456', true);


-- ============================================================
-- 7. SEED DATA — Ofertas de las 2 empresas
-- ============================================================

-- Ofertas de Corralón El Norte - Casa Central (Salta)
insert into offers (branch_id, product_id, price, stock_status) values
  -- Albañilería
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Cemento Portland 50kg'), 8500, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Cal hidráulica 25kg'), 3200, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Arena gruesa'), 45000, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Arena fina'), 48000, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Piedra partida'), 52000, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Ladrillo común'), 85000, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Ladrillo hueco 12x18x33'), 95, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Hierro 8mm x 12m'), 8900, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Hierro 10mm x 12m'), 12500, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Hierro 12mm x 12m'), 18000, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Membrana asfáltica 4mm x 10m²'), 32000, 'disponible'),
  -- Plomería
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Caño PVC 110mm x 4m'), 18500, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Tanque de agua 1000L'), 185000, 'consultar'),
  -- Ferretería
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Clavo 2"'), 2800, 'disponible'),
  ('aaaa1111-1111-1111-1111-111111111111', (select id from products where name='Clavo 3"'), 2900, 'disponible');

-- Ofertas de Corralón El Norte - Sucursal Cerrillos
insert into offers (branch_id, product_id, price, stock_status) values
  ('aaaa2222-1111-1111-1111-111111111111', (select id from products where name='Cemento Portland 50kg'), 8300, 'disponible'),
  ('aaaa2222-1111-1111-1111-111111111111', (select id from products where name='Arena gruesa'), 42000, 'disponible'),
  ('aaaa2222-1111-1111-1111-111111111111', (select id from products where name='Piedra partida'), 48000, 'disponible'),
  ('aaaa2222-1111-1111-1111-111111111111', (select id from products where name='Ladrillo común'), 82000, 'disponible'),
  ('aaaa2222-1111-1111-1111-111111111111', (select id from products where name='Hierro 10mm x 12m'), 12200, 'disponible');

-- Ofertas de Ferretería San José - Local Centro (Jujuy)
insert into offers (branch_id, product_id, price, stock_status) values
  -- Ferretería
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Tornillo autoperforante 10x1"'), 4500, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Tornillo para madera 4x40mm'), 3800, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Disco de corte 115mm'), 1200, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Cinta de teflón'), 350, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Silicona transparente 280ml'), 4200, 'disponible'),
  -- Electricidad
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Cable unipolar 2.5mm² rollo 100m'), 45000, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Cable unipolar 4mm² rollo 100m'), 72000, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Térmica bipolar 20A'), 12500, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Disyuntor diferencial 40A'), 28000, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Tablero embutir 8 bocas'), 18500, 'disponible'),
  -- Herrajes
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Bisagra acero 3"'), 1800, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Cerradura embutir Prive 501'), 15000, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Manija doble balancín'), 8500, 'disponible'),
  -- Plomería
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Grifería monocomando cocina'), 45000, 'disponible'),
  ('bbbb1111-2222-2222-2222-222222222222', (select id from products where name='Codo PVC 110mm'), 1850, 'disponible');

-- Ofertas de Ferretería San José - Sucursal Palpalá
insert into offers (branch_id, product_id, price, stock_status) values
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Cemento Portland 50kg'), 8700, 'disponible'),
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Cal hidráulica 25kg'), 3400, 'disponible'),
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Cable unipolar 2.5mm² rollo 100m'), 44000, 'disponible'),
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Térmica bipolar 20A'), 12000, 'disponible'),
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Tornillo autoperforante 10x1"'), 4200, 'disponible'),
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Disco de corte 115mm'), 1100, 'disponible'),
  -- Gas
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Caño epoxi 1/2 x 6m'), 8500, 'disponible'),
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Válvula esférica gas 1/2'), 3200, 'disponible'),
  ('bbbb2222-2222-2222-2222-222222222222', (select id from products where name='Regulador gas envasado'), 12000, 'disponible');


-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
--
-- NOTA: Para agregar un admin, primero crear el usuario en Auth,
-- luego ejecutar:
--
-- INSERT INTO admins (user_id, email) VALUES
--   ('uuid-del-usuario', 'admin@email.com');
--
-- ============================================================
