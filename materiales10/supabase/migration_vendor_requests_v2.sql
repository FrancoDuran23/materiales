-- ============================================================
-- Agregar campos contact_name y user_id a vendor_requests
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

ALTER TABLE vendor_requests ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE vendor_requests ADD COLUMN IF NOT EXISTS user_id uuid;
