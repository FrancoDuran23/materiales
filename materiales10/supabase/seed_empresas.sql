-- ============================================================
-- Materiales10 — SEED COMPLETO: Categorías, Productos y 2 Empresas
-- Este archivo incluye TODO lo necesario para funcionar
-- ============================================================

-- ============================================================
-- 1. CATEGORÍAS
-- ============================================================
INSERT INTO categories (id, name, slug, icon) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Albañilería', 'albanileria', 'Hammer'),
  ('c0000001-0000-0000-0000-000000000002', 'Plomería', 'plomeria', 'Droplet'),
  ('c0000001-0000-0000-0000-000000000003', 'Electricidad', 'electricidad', 'Zap'),
  ('c0000001-0000-0000-0000-000000000004', 'Ferretería', 'ferreteria', 'Wrench'),
  ('c0000001-0000-0000-0000-000000000005', 'Herrajes', 'herrajes', 'Lock'),
  ('c0000001-0000-0000-0000-000000000006', 'Pinturas', 'pinturas', 'Paintbrush'),
  ('c0000001-0000-0000-0000-000000000007', 'Techos', 'techos', 'Home'),
  ('c0000001-0000-0000-0000-000000000008', 'Gas', 'gas', 'Flame'),
  ('c0000001-0000-0000-0000-000000000009', 'Pisos', 'pisos', 'Grid')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. PRODUCTOS (busca categorías existentes por slug)
-- ============================================================

-- Albañilería
INSERT INTO products (name, category_id, unit)
SELECT 'Cemento Portland 50kg', id, 'bolsa' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Cal hidráulica 25kg', id, 'bolsa' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Arena gruesa', id, 'm³' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Arena fina', id, 'm³' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Piedra partida', id, 'm³' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Ladrillo común', id, 'millar' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Ladrillo hueco 12x18x33', id, 'unidad' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Hierro 8mm x 12m', id, 'barra' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Hierro 10mm x 12m', id, 'barra' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Hierro 12mm x 12m', id, 'barra' FROM categories WHERE slug = 'albanileria'
ON CONFLICT DO NOTHING;

-- Plomería
INSERT INTO products (name, category_id, unit)
SELECT 'Caño PVC 110mm x 4m', id, 'unidad' FROM categories WHERE slug = 'plomeria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Tanque de agua 1000L', id, 'unidad' FROM categories WHERE slug = 'plomeria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Codo PVC 110mm', id, 'unidad' FROM categories WHERE slug = 'plomeria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Grifería monocomando cocina', id, 'unidad' FROM categories WHERE slug = 'plomeria'
ON CONFLICT DO NOTHING;

-- Electricidad
INSERT INTO products (name, category_id, unit)
SELECT 'Cable unipolar 2.5mm² rollo 100m', id, 'rollo' FROM categories WHERE slug = 'electricidad'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Cable unipolar 4mm² rollo 100m', id, 'rollo' FROM categories WHERE slug = 'electricidad'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Térmica bipolar 20A', id, 'unidad' FROM categories WHERE slug = 'electricidad'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Disyuntor diferencial 40A', id, 'unidad' FROM categories WHERE slug = 'electricidad'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Tablero embutir 8 bocas', id, 'unidad' FROM categories WHERE slug = 'electricidad'
ON CONFLICT DO NOTHING;

-- Ferretería
INSERT INTO products (name, category_id, unit)
SELECT 'Clavo 2"', id, 'kg' FROM categories WHERE slug = 'ferreteria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Clavo 3"', id, 'kg' FROM categories WHERE slug = 'ferreteria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Tornillo autoperforante 10x1"', id, 'caja x100' FROM categories WHERE slug = 'ferreteria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Tornillo para madera 4x40mm', id, 'caja x100' FROM categories WHERE slug = 'ferreteria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Disco de corte 115mm', id, 'unidad' FROM categories WHERE slug = 'ferreteria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Cinta de teflón', id, 'unidad' FROM categories WHERE slug = 'ferreteria'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Silicona transparente 280ml', id, 'unidad' FROM categories WHERE slug = 'ferreteria'
ON CONFLICT DO NOTHING;

-- Herrajes
INSERT INTO products (name, category_id, unit)
SELECT 'Bisagra acero 3"', id, 'par' FROM categories WHERE slug = 'herrajes'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Cerradura embutir Prive 501', id, 'unidad' FROM categories WHERE slug = 'herrajes'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Manija doble balancín', id, 'juego' FROM categories WHERE slug = 'herrajes'
ON CONFLICT DO NOTHING;

-- Pinturas
INSERT INTO products (name, category_id, unit)
SELECT 'Látex interior 20L', id, 'balde' FROM categories WHERE slug = 'pinturas'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Látex exterior 20L', id, 'balde' FROM categories WHERE slug = 'pinturas'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Fijador sellador 20L', id, 'balde' FROM categories WHERE slug = 'pinturas'
ON CONFLICT DO NOTHING;

-- Techos
INSERT INTO products (name, category_id, unit)
SELECT 'Membrana asfáltica 4mm x 10m²', id, 'rollo' FROM categories WHERE slug = 'techos'
ON CONFLICT DO NOTHING;

-- Gas
INSERT INTO products (name, category_id, unit)
SELECT 'Caño epoxi 1/2 x 6m', id, 'unidad' FROM categories WHERE slug = 'gas'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Válvula esférica gas 1/2', id, 'unidad' FROM categories WHERE slug = 'gas'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Regulador gas envasado', id, 'unidad' FROM categories WHERE slug = 'gas'
ON CONFLICT DO NOTHING;

-- Pisos
INSERT INTO products (name, category_id, unit)
SELECT 'Cerámico 35x35 m²', id, 'm²' FROM categories WHERE slug = 'pisos'
ON CONFLICT DO NOTHING;
INSERT INTO products (name, category_id, unit)
SELECT 'Pegamento cerámico 30kg', id, 'bolsa' FROM categories WHERE slug = 'pisos'
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. EMPRESAS (VENDORS)
-- ============================================================

-- EMPRESA 1: Corralón El Norte (Salta)
INSERT INTO vendors (id, name, phone, whatsapp, email, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Corralón El Norte', '0387-4234567', '5493874234567', 'corralon.elnorte@email.com', true)
ON CONFLICT (id) DO NOTHING;

-- Sucursales de Corralón El Norte
INSERT INTO branches (id, vendor_id, name, address, city, province, lat, lng, phone, whatsapp, is_active) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Casa Central', 'Av. Entre Ríos 1500', 'Salta Capital', 'Salta',
   -24.7821, -65.4232, '0387-4234567', '5493874234567', true),
  ('aaaa2222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Sucursal Cerrillos', 'Ruta 68 Km 5', 'Cerrillos', 'Salta',
   -24.8958, -65.4861, '0387-4901234', '5493874901234', true)
ON CONFLICT (id) DO NOTHING;


-- EMPRESA 2: Ferretería San José (Jujuy)
INSERT INTO vendors (id, name, phone, whatsapp, email, is_active) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Ferretería San José', '0388-4567890', '5493884567890', 'ferreteria.sanjose@email.com', true)
ON CONFLICT (id) DO NOTHING;

-- Sucursales de Ferretería San José
INSERT INTO branches (id, vendor_id, name, address, city, province, lat, lng, phone, whatsapp, is_active) VALUES
  ('bbbb1111-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Local Centro', 'Belgrano 450', 'San Salvador de Jujuy', 'Jujuy',
   -24.1858, -65.2995, '0388-4567890', '5493884567890', true),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Sucursal Palpalá', 'Av. Libertad 200', 'Palpalá', 'Jujuy',
   -24.2573, -65.213, '0388-4123456', '5493884123456', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 4. OFERTAS (busca productos por nombre)
-- ============================================================

-- OFERTAS: Corralón El Norte - Casa Central (Salta)
INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 8500, 'disponible' FROM products WHERE name = 'Cemento Portland 50kg'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 3200, 'disponible' FROM products WHERE name = 'Cal hidráulica 25kg'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 45000, 'disponible' FROM products WHERE name = 'Arena gruesa'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 48000, 'disponible' FROM products WHERE name = 'Arena fina'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 52000, 'disponible' FROM products WHERE name = 'Piedra partida'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 85000, 'disponible' FROM products WHERE name = 'Ladrillo común'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 95, 'disponible' FROM products WHERE name = 'Ladrillo hueco 12x18x33'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 8900, 'disponible' FROM products WHERE name = 'Hierro 8mm x 12m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 12500, 'disponible' FROM products WHERE name = 'Hierro 10mm x 12m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 18000, 'disponible' FROM products WHERE name = 'Hierro 12mm x 12m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 32000, 'disponible' FROM products WHERE name = 'Membrana asfáltica 4mm x 10m²'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 18500, 'disponible' FROM products WHERE name = 'Caño PVC 110mm x 4m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 185000, 'consultar' FROM products WHERE name = 'Tanque de agua 1000L'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 2800, 'disponible' FROM products WHERE name = 'Clavo 2"'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', id, 2900, 'disponible' FROM products WHERE name = 'Clavo 3"'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;


-- OFERTAS: Corralón El Norte - Sucursal Cerrillos
INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 8300, 'disponible' FROM products WHERE name = 'Cemento Portland 50kg'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 42000, 'disponible' FROM products WHERE name = 'Arena gruesa'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 48000, 'disponible' FROM products WHERE name = 'Piedra partida'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 82000, 'disponible' FROM products WHERE name = 'Ladrillo común'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 12200, 'disponible' FROM products WHERE name = 'Hierro 10mm x 12m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 45000, 'disponible' FROM products WHERE name = 'Látex interior 20L'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 52000, 'disponible' FROM products WHERE name = 'Látex exterior 20L'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'aaaa2222-1111-1111-1111-111111111111', id, 28000, 'disponible' FROM products WHERE name = 'Fijador sellador 20L'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;


-- OFERTAS: Ferretería San José - Local Centro (Jujuy)
INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 4500, 'disponible' FROM products WHERE name = 'Tornillo autoperforante 10x1"'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 3800, 'disponible' FROM products WHERE name = 'Tornillo para madera 4x40mm'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 1200, 'disponible' FROM products WHERE name = 'Disco de corte 115mm'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 350, 'disponible' FROM products WHERE name = 'Cinta de teflón'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 4200, 'disponible' FROM products WHERE name = 'Silicona transparente 280ml'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 45000, 'disponible' FROM products WHERE name = 'Cable unipolar 2.5mm² rollo 100m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 72000, 'disponible' FROM products WHERE name = 'Cable unipolar 4mm² rollo 100m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 12500, 'disponible' FROM products WHERE name = 'Térmica bipolar 20A'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 28000, 'disponible' FROM products WHERE name = 'Disyuntor diferencial 40A'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 18500, 'disponible' FROM products WHERE name = 'Tablero embutir 8 bocas'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 1800, 'disponible' FROM products WHERE name = 'Bisagra acero 3"'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 15000, 'disponible' FROM products WHERE name = 'Cerradura embutir Prive 501'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 8500, 'disponible' FROM products WHERE name = 'Manija doble balancín'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 45000, 'disponible' FROM products WHERE name = 'Grifería monocomando cocina'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb1111-2222-2222-2222-222222222222', id, 1850, 'disponible' FROM products WHERE name = 'Codo PVC 110mm'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;


-- OFERTAS: Ferretería San José - Sucursal Palpalá
INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 8700, 'disponible' FROM products WHERE name = 'Cemento Portland 50kg'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 3400, 'disponible' FROM products WHERE name = 'Cal hidráulica 25kg'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 44000, 'disponible' FROM products WHERE name = 'Cable unipolar 2.5mm² rollo 100m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 12000, 'disponible' FROM products WHERE name = 'Térmica bipolar 20A'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 4200, 'disponible' FROM products WHERE name = 'Tornillo autoperforante 10x1"'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 1100, 'disponible' FROM products WHERE name = 'Disco de corte 115mm'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 8500, 'disponible' FROM products WHERE name = 'Caño epoxi 1/2 x 6m'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 3200, 'disponible' FROM products WHERE name = 'Válvula esférica gas 1/2'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 12000, 'disponible' FROM products WHERE name = 'Regulador gas envasado'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 12500, 'disponible' FROM products WHERE name = 'Cerámico 35x35 m²'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;

INSERT INTO offers (branch_id, product_id, price, stock_status)
SELECT 'bbbb2222-2222-2222-2222-222222222222', id, 8500, 'disponible' FROM products WHERE name = 'Pegamento cerámico 30kg'
ON CONFLICT (branch_id, product_id) DO UPDATE SET price = EXCLUDED.price, stock_status = EXCLUDED.stock_status;


-- ============================================================
-- 5. INSERTAR ADMIN (con tu UUID)
-- ============================================================
INSERT INTO admins (user_id, email) VALUES
  ('0d04d536-32a8-4ce5-8a99-694676bdeb2d', 'admin@materiales10.com')
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'Categorías:' as tabla, count(*) as total FROM categories;
SELECT 'Productos:' as tabla, count(*) as total FROM products;
SELECT 'Empresas:' as tabla, count(*) as total FROM vendors;
SELECT 'Sucursales:' as tabla, count(*) as total FROM branches;
SELECT 'Ofertas:' as tabla, count(*) as total FROM offers;
SELECT 'Admins:' as tabla, count(*) as total FROM admins;
