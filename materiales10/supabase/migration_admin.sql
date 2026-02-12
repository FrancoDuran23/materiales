-- ============================================================
-- Materiales10 — MIGRACIÓN: Agregar soporte Admin
-- Ejecutar si ya tenés el schema anterior corrido
-- ============================================================

-- 0. Eliminar función vieja (necesario para cambiar nombres de parámetros)
DROP FUNCTION IF EXISTS search_offers(text, double precision, double precision, text, text, integer, integer);

-- 1. Agregar columnas nuevas a vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);

-- 2. Agregar columna is_active a branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 3. Crear tabla de admins
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Habilitar RLS en admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy para admins
DROP POLICY IF EXISTS "admins_read" ON admins;
CREATE POLICY "admins_read" ON admins FOR SELECT USING (
  auth.uid() = user_id
);

-- 5. Actualizar RLS de vendors para incluir admin
DROP POLICY IF EXISTS "vendors_insert" ON vendors;
DROP POLICY IF EXISTS "vendors_update" ON vendors;
DROP POLICY IF EXISTS "vendors_delete" ON vendors;

CREATE POLICY "vendors_insert" ON vendors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

CREATE POLICY "vendors_update" ON vendors FOR UPDATE USING (
  auth.uid() = owner_id
  OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

CREATE POLICY "vendors_delete" ON vendors FOR DELETE USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- 6. Actualizar RLS de branches para incluir admin
DROP POLICY IF EXISTS "branches_insert" ON branches;
DROP POLICY IF EXISTS "branches_update" ON branches;
DROP POLICY IF EXISTS "branches_delete" ON branches;

CREATE POLICY "branches_insert" ON branches FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = branches.vendor_id
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

CREATE POLICY "branches_update" ON branches FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = branches.vendor_id
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

CREATE POLICY "branches_delete" ON branches FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = branches.vendor_id
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

-- 7. Actualizar RLS de offers para incluir admin
DROP POLICY IF EXISTS "offers_insert" ON offers;
DROP POLICY IF EXISTS "offers_update" ON offers;
DROP POLICY IF EXISTS "offers_delete" ON offers;

CREATE POLICY "offers_insert" ON offers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM branches
    JOIN vendors ON vendors.id = branches.vendor_id
    WHERE branches.id = offers.branch_id
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

CREATE POLICY "offers_update" ON offers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM branches
    JOIN vendors ON vendors.id = branches.vendor_id
    WHERE branches.id = offers.branch_id
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

CREATE POLICY "offers_delete" ON offers FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM branches
    JOIN vendors ON vendors.id = branches.vendor_id
    WHERE branches.id = offers.branch_id
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

-- 8. Función is_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  );
$$;

-- 9. Actualizar search_offers para filtrar por is_active
CREATE OR REPLACE FUNCTION search_offers(
  p_q text DEFAULT '',
  p_buyer_lat double precision DEFAULT null,
  p_buyer_lng double precision DEFAULT null,
  p_category_slug text DEFAULT null,
  p_sort_mode text DEFAULT 'price',
  p_lim integer DEFAULT 50,
  p_off integer DEFAULT 0
)
RETURNS TABLE (
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
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS offer_id,
    p.name AS product_name,
    p.unit AS product_unit,
    c.slug AS category_slug,
    o.price,
    o.stock_status,
    v.name AS vendor_name,
    b.name AS branch_name,
    b.city AS branch_city,
    b.address AS branch_address,
    b.phone AS branch_phone,
    b.whatsapp AS branch_whatsapp,
    b.lat AS branch_lat,
    b.lng AS branch_lng,
    CASE
      WHEN p_buyer_lat IS NOT NULL AND p_buyer_lng IS NOT NULL AND b.lat IS NOT NULL AND b.lng IS NOT NULL THEN
        round(
          (6371 * acos(
            cos(radians(p_buyer_lat)) * cos(radians(b.lat))
            * cos(radians(b.lng) - radians(p_buyer_lng))
            + sin(radians(p_buyer_lat)) * sin(radians(b.lat))
          ))::numeric, 1
        )::double precision
      ELSE NULL
    END AS distance_km
  FROM offers o
  JOIN products p ON p.id = o.product_id
  JOIN categories c ON c.id = p.category_id
  JOIN branches b ON b.id = o.branch_id
  JOIN vendors v ON v.id = b.vendor_id
  WHERE
    v.is_active = true
    AND b.is_active = true
    AND (p_q = '' OR p.name ILIKE '%' || p_q || '%')
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
  ORDER BY
    CASE WHEN p_sort_mode = 'price' THEN o.price END ASC,
    CASE WHEN p_sort_mode = 'distance' AND p_buyer_lat IS NOT NULL THEN
      (6371 * acos(
        cos(radians(p_buyer_lat)) * cos(radians(COALESCE(b.lat, 0)))
        * cos(radians(COALESCE(b.lng, 0)) - radians(p_buyer_lng))
        + sin(radians(p_buyer_lat)) * sin(radians(COALESCE(b.lat, 0)))
      ))
    END ASC NULLS LAST,
    o.price ASC
  LIMIT p_lim
  OFFSET p_off;
END;
$$;


-- ============================================================
-- IMPORTANTE: Para hacerte admin, ejecutá esto reemplazando
-- el UUID y email con los tuyos:
-- ============================================================
--
-- INSERT INTO admins (user_id, email) VALUES
--   ('tu-uuid-de-auth-users', 'tu@email.com');
--
-- Para obtener tu UUID, andá a Authentication > Users en Supabase
-- ============================================================
