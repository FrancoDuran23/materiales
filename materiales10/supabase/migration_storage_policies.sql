-- ============================================================
-- Materiales10 — Storage Policies para bucket "product-images"
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================================

-- 1. Política para LEER imágenes (público)
-- Cualquiera puede ver las imágenes
create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- 2. Política para SUBIR imágenes (usuarios autenticados)
-- Admins pueden subir cualquier imagen
-- Vendors activos pueden subir a la carpeta products/
create policy "Authenticated users can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and (
    -- Es admin
    exists (select 1 from admins where admins.user_id = auth.uid())
    or
    -- Es vendor activo
    exists (
      select 1 from vendors
      where vendors.owner_id = auth.uid()
      and vendors.is_active = true
    )
  )
);

-- 3. Política para ACTUALIZAR imágenes (usuarios autenticados)
create policy "Authenticated users can update product images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and (
    exists (select 1 from admins where admins.user_id = auth.uid())
    or
    exists (
      select 1 from vendors
      where vendors.owner_id = auth.uid()
      and vendors.is_active = true
    )
  )
);

-- 4. Política para ELIMINAR imágenes (solo admins)
create policy "Admins can delete product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and exists (select 1 from admins where admins.user_id = auth.uid())
);

-- ============================================================
-- NOTA: Asegurate de que el bucket "product-images" esté
-- configurado como PÚBLICO en Supabase Dashboard:
-- Storage > product-images > Settings > Make bucket public
-- ============================================================
