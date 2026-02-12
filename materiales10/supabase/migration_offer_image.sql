-- ============================================================
-- Materiales10 — Agregar columna image_url a offers
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================================

-- Agregar columna image_url a la tabla offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS image_url text;

-- Comentario: Esta columna almacena la URL de la imagen
-- personalizada que el vendor sube para su oferta
COMMENT ON COLUMN offers.image_url IS 'URL de imagen personalizada del vendor para esta oferta';
