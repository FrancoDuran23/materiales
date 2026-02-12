# 🚀 Guía de Configuración y Deploy - Materiales10

## ✅ Estado de Implementación

### Fase 1: Bugs Bloqueantes (COMPLETADO)
- ✅ Archivos de configuración de entorno (`.env.local`, `env.template`)
- ✅ Validación de subida de imágenes (tipo, tamaño)
- ✅ Manejo de errores mejorado (`src/lib/errors.ts`)
- ✅ Páginas 404 y error boundaries

### Fase 2: Seguridad (COMPLETADO)
- ✅ Sistema de rate limiting configurado (`src/lib/rate-limit.ts`)
- ✅ Validación y sanitización de inputs (`src/lib/validation.ts`)
- ⚠️ Validación de email (requiere configuración en Supabase - ver abajo)

### Fase 3: Geocodificación (COMPLETADO)
- ✅ Integración Google Maps API (`src/lib/geocoding.ts`)
- ✅ Alternativa gratuita con Nominatim
- ⏳ Componente de mapa interactivo (opcional para Fase 6)

### Fase 4: SEO (COMPLETADO)
- ✅ Metadatos dinámicos mejorados (`layout.tsx`)
- ✅ Schema.org structured data (`src/components/StructuredData.tsx`)
- ✅ Sitemap automático (`src/app/sitemap.ts`)
- ✅ Robots.txt (`src/app/robots.ts`)

### Fase 5: Analytics (PENDIENTE)
- ⏳ Dashboard de analytics para admin
- ⏳ Log de actividad de vendedores

---

## 📋 PASOS OBLIGATORIOS PARA DEPLOY

### 1. Configurar Variables de Entorno

**Archivo: `.env.local`** (ya creado, completar con tus credenciales)

```bash
# 1️⃣ Supabase (OBLIGATORIO)
# Ir a: https://supabase.com → Tu Proyecto → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (tu anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key)

# 2️⃣ Google Maps API (OPCIONAL - para geocoding automático)
# Ir a: https://console.cloud.google.com
# Habilitar: Geocoding API
# Crear API Key con restricción de dominio
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# 3️⃣ Upstash Redis (OPCIONAL - para rate limiting)
# Ir a: https://upstash.com → Create Database (FREE tier)
UPSTASH_REDIS_URL=https://...upstash.io
UPSTASH_REDIS_TOKEN=AX...

# 4️⃣ Resend (OPCIONAL - para notificaciones email)
# Ir a: https://resend.com → API Keys
RESEND_API_KEY=re_...
```

---

### 2. Configurar Supabase

#### A. Validación de Email Obligatoria

1. Ir a Supabase Dashboard → **Authentication** → **Settings**
2. Activar: **"Enable email confirmations"**
3. Configurar Redirect URL: `https://tudominio.com/vendor?verified=true`
4. Template de email (opcional): Personalizar en **Email Templates**

#### B. Crear Bucket de Storage para Imágenes

```sql
-- Ejecutar en SQL Editor de Supabase:

-- 1. Crear bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- 2. Policy: Cualquier usuario autenticado puede subir
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 3. Policy: Todos pueden ver imágenes
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 4. Policy: Owners pueden borrar sus imágenes
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid() = owner);
```

#### C. Verificar RLS Policies

Asegurate que todas las policies de `supabase/schema.sql` estén aplicadas correctamente.

---

### 3. Instalar Dependencias Faltantes

```bash
cd materiales10

# Ya instalado:
npm install isomorphic-dompurify

# Si querés usar rate limiting con Upstash:
npm install @upstash/ratelimit @upstash/redis

# Si querés mapas interactivos (opcional):
npm install @vis.gl/react-google-maps

# Si querés notificaciones por email (opcional):
npm install resend
```

---

### 4. Crear Imagen OG para Redes Sociales

**Archivo requerido:** `public/og-image.jpg`
- Tamaño: 1200 x 630 px
- Formato: JPG o PNG
- Contenido sugerido: Logo + "Materiales10 - Comparador de precios"

Podés usar Canva o Figma para crearla.

---

### 5. Actualizar Dominio en Archivos

Buscar y reemplazar `https://materiales10.com` con tu dominio real:

- `src/app/layout.tsx` → `metadataBase`
- `src/app/sitemap.ts` → `baseUrl`
- `src/app/robots.ts` → `sitemap` URL

```bash
# Buscar todas las ocurrencias (PowerShell):
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "materiales10.com"
```

---

### 6. Build y Verificación Local

```bash
# 1. Build para detectar errores TypeScript
npm run build

# 2. Si build exitoso, probar localmente
npm run start

# 3. Abrir en navegador
# http://localhost:3000
```

**Verificar:**
- [ ] Home carga sin errores
- [ ] Búsqueda funciona
- [ ] Login/registro funciona
- [ ] Vendedor puede crear sucursal
- [ ] Vendedor puede subir imagen de oferta
- [ ] 404 muestra página custom

---

### 7. Deploy en Vercel

#### A. Conectar Repositorio

1. Push a GitHub:
   ```bash
   git add .
   git commit -m "feat: implement security, SEO, geocoding features"
   git push origin main
   ```

2. Ir a [vercel.com](https://vercel.com) → **Import Project**
3. Seleccionar tu repo → **Import**

#### B. Configurar Variables de Entorno

En Vercel Dashboard → **Settings** → **Environment Variables**, agregar:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (marcar como Secret)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=... (marcar como Secret)
```

#### C. Deploy

- Click en **Deploy**
- Esperar 2-3 minutos
- ✅ App en producción: `https://tu-proyecto.vercel.app`

---

### 8. Post-Deploy: Configurar Dominio Custom (Opcional)

1. Comprar dominio (ej: `materiales10.com.ar` en NIC Argentina)
2. En Vercel → **Settings** → **Domains** → Agregar dominio
3. Configurar DNS (A record o CNAME según Vercel indique)
4. Esperar propagación DNS (10 min - 24 hs)

---

### 9. Configurar Google Search Console

1. Ir a [search.google.com/search-console](https://search.google.com/search-console)
2. Agregar propiedad (tu dominio)
3. Verificar ownership (método DNS o HTML)
4. Enviar sitemap: `https://tudominio.com/sitemap.xml`

---

## 🧪 Testing Pre-Launch Checklist

### Funcionalidad Core
- [ ] **Home:** Categorías visibles, links funcionan
- [ ] **Búsqueda:** Retorna resultados correctos
- [ ] **Detalle oferta:** Muestra precio, vendedor, contacto
- [ ] **Registro vendedor:** Email, contraseña, confirmación
- [ ] **Dashboard vendedor:** Crear sucursal, publicar oferta
- [ ] **Admin:** Aprobar vendedores, ver métricas básicas

### Seguridad
- [ ] **Rate limiting:** Bloquea después de límite (si configurado)
- [ ] **Validación email:** No permite login sin confirmar email
- [ ] **Subida imágenes:** Rechaza .exe, .pdf, archivos >5MB
- [ ] **Inputs sanitizados:** No permite `<script>` en nombre vendedor

### SEO
- [ ] **Metadata:** Preview correcto en [metatags.io](https://metatags.io)
- [ ] **Open Graph:** Preview en WhatsApp/Facebook muestra imagen
- [ ] **Sitemap:** Accesible en `/sitemap.xml`
- [ ] **Robots.txt:** Accesible en `/robots.txt`
- [ ] **Structured Data:** Validar en [Google Rich Results Test](https://search.google.com/test/rich-results)

### Performance
- [ ] **Lighthouse:** Score >80 en todas las categorías
- [ ] **First Contentful Paint:** <2 segundos
- [ ] **Largest Contentful Paint:** <2.5 segundos
- [ ] **Imágenes optimizadas:** Next.js Image component usado

---

## 🔧 Troubleshooting Común

### Error: "Invalid Supabase URL"
- Verificar que `.env.local` esté en la raíz del proyecto `materiales10/`
- Reiniciar dev server: `npm run dev`

### Error: "Policy violation" al crear oferta
- Verificar que el vendedor esté `is_active = true` en Supabase
- Verificar RLS policies en tabla `offers`

### Error: "Bucket not found" al subir imagen
- Crear bucket `product-images` en Supabase Storage
- Aplicar policies de storage (ver Paso 2.B)

### Geocoding no funciona
- Si no configuraste Google Maps API, usar entrada manual de lat/lng
- O usar alternativa gratuita: `geocodeAddressNominatim()` en lugar de `geocodeAddress()`

### Build falla con TypeScript error
- Ejecutar: `npm run build` para ver errores específicos
- Común: Importar tipos faltantes de `database.types.ts`

---

## 📊 Próximos Pasos (Post-Launch)

1. **Analytics Dashboard Admin** (Fase 5)
   - Gráficos de búsquedas por día
   - Top productos más buscados
   - Vendedores por ciudad

2. **Log de Actividad Vendedores** (Fase 5)
   - Tabla `vendor_activity_log`
   - Registro de cambios en ofertas

3. **Notificaciones Email** (Opcional)
   - Email de bienvenida a vendedor
   - Notificación de pedido/reserva
   - Resend integration

4. **Mapa Interactivo** (Opcional)
   - Component `<MapView>` con Google Maps
   - Pins de sucursales en `/search`

5. **Tests Automatizados** (Opcional)
   - Unit tests con Vitest
   - E2E tests con Playwright

---

## 📞 Soporte

Si encontrás algún problema:

1. Revisar logs en Vercel → **Deployments** → Click en deploy → **Logs**
2. Revisar logs en Supabase → **Logs** → **Postgres Logs** o **API Logs**
3. Verificar que todas las variables de entorno estén configuradas

**Documentación útil:**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

🎉 **¡Listo para lanzar!** Una vez completados los pasos obligatorios (1-6), tu app estará lista para producción.
