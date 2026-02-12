-- ============================================================
-- Migración: Permitir auto-registro de vendedores
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================================

-- 1. Eliminar la política anterior que solo permite a admins crear vendors
DROP POLICY IF EXISTS "vendors_insert" ON vendors;

-- 2. Crear nueva política que permite:
--    - Admins pueden crear cualquier vendor
--    - Usuarios autenticados pueden crear su propio vendor (con owner_id = su id)
CREATE POLICY "vendors_insert" ON vendors FOR INSERT WITH CHECK (
  -- Admin puede crear cualquier vendor
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  OR
  -- Usuario autenticado puede crear su propio vendor
  (auth.uid() IS NOT NULL AND owner_id = auth.uid())
);

-- 3. Actualizar política de branches para permitir a vendedores aprobados crear sucursales
DROP POLICY IF EXISTS "branches_insert" ON branches;

CREATE POLICY "branches_insert" ON branches FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = branches.vendor_id
      AND vendors.is_active = true  -- Solo si el vendor está aprobado
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

-- 4. Actualizar política de offers para verificar que el vendor esté activo
DROP POLICY IF EXISTS "offers_insert" ON offers;

CREATE POLICY "offers_insert" ON offers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM branches
    JOIN vendors ON vendors.id = branches.vendor_id
    WHERE branches.id = offers.branch_id
      AND vendors.is_active = true  -- Solo si el vendor está aprobado
      AND branches.is_active = true -- Y la sucursal está activa
      AND (vendors.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  )
);

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================
