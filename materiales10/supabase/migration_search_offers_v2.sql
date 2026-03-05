-- ============================================================
-- Actualizar search_offers para incluir image_url y free_shipping
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

DROP FUNCTION IF EXISTS search_offers(text, double precision, double precision, text, text, integer, integer);

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
  product_image_url text,
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
  distance_km double precision,
  branch_free_shipping boolean,
  branch_free_shipping_radius_km double precision
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
    o.image_url AS product_image_url,
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
    END AS distance_km,
    COALESCE(b.free_shipping, false) AS branch_free_shipping,
    b.free_shipping_radius_km::double precision AS branch_free_shipping_radius_km
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
