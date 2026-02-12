# Materiales10

PWA para comparar precios de materiales de construcción en corralones y ferreterías de **Salta y Jujuy**.

## Stack

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS**
- **Supabase** (Postgres + Auth + RPC)
- Deploy en **Vercel**

---

## Instalación local

### 1. Instalar dependencias

```bash
cd materiales10
npm install
```

### 2. Configurar variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar `supabase/schema.sql`
3. Copiar URL y anon key desde **Project Settings > API**

### 4. Ejecutar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
materiales10/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Home con rubros
│   │   ├── search/page.tsx         # Buscador + listado (RPC search_offers)
│   │   ├── offer/[id]/page.tsx     # Detalle oferta + reserva
│   │   ├── order/success/page.tsx  # Confirmación
│   │   └── vendor/
│   │       ├── page.tsx            # Dashboard (crear vendor/branch)
│   │       ├── login/page.tsx      # Auth email/password
│   │       └── offers/page.tsx     # Gestión de ofertas
│   ├── components/
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   ├── OfferCard.tsx
│   │   ├── CategoryChips.tsx
│   │   └── LocationPicker.tsx
│   └── lib/
│       ├── supabase.ts             # Cliente Supabase
│       ├── auth.ts                 # Helpers: signIn, signUp, signOut, getSession
│       ├── vendor.ts               # fetchMyVendor, createVendor, branches, offers
│       ├── search.ts               # searchOffers (RPC), fetchCategories
│       ├── orders.ts               # createOrder
│       ├── geo.ts                  # Geolocalización, haversine
│       ├── constants.ts            # CATEGORIES, STOCK_LABELS
│       └── database.types.ts       # TypeScript types
├── public/
│   ├── manifest.json               # PWA manifest
│   └── sw.js                       # Service Worker
└── supabase/
    └── schema.sql                  # DDL + RLS + seed data
```

---

## Flujo de usuario

### Comprador (público)

1. **Home** → Elige rubro o busca cualquier material
2. **/search** → Busca productos, ordena por precio o distancia
3. **/offer/[id]** → Ve detalle, hace reserva (nombre + teléfono)
4. **/order/success** → Confirmación

### Vendedor (autenticado)

1. **/vendor/login** → Login o registro
2. **/vendor** → Crea vendor (negocio) → Crea branch (sucursal)
3. **/vendor/offers** → Publica ofertas (producto + precio + stock)

---

## Helpers principales

### `src/lib/auth.ts`

```typescript
getSession()     // Obtener usuario actual
signIn(email, password)
signUp(email, password)
signOut()
```

### `src/lib/vendor.ts`

```typescript
fetchMyVendor(userId)           // Obtener vendor del usuario
createVendor(userId, name, ...)
fetchMyBranches(vendorId)
createBranch(vendorId, data)
fetchProducts(search?)          // Catálogo
fetchMyOffers(branchIds)
createOffer(branchId, productId, price, stock)
updateOffer(offerId, updates)
deleteOffer(offerId)
```

### `src/lib/search.ts`

```typescript
searchOffers({
  q,              // texto búsqueda
  buyerLat,       // ubicación comprador
  buyerLng,
  categorySlug,   // filtro rubro
  sortMode,       // 'price' | 'distance'
})
```

---

## RLS (Row Level Security)

| Tabla | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|---------------------|
| categories | Público | Admin |
| products | Público | Admin |
| vendors | Público | Solo owner_id = auth.uid() |
| branches | Público | Solo si vendor.owner_id = auth.uid() |
| offers | Público | Solo si branch.vendor.owner_id = auth.uid() |
| orders | Público | Cualquiera (anon) |
| order_items | Público | Cualquiera (anon) |

---

## Comandos

```bash
npm run dev       # Desarrollo
npm run build     # Build producción
npm run start     # Servir build
npm run lint      # ESLint
```

---

## Deploy en Vercel

1. Push a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Configurar Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## PWA

La app es instalable en móviles. Incluye:
- `manifest.json` con iconos
- Service Worker con cache network-first

Para instalar: abrir en Chrome/Safari → "Añadir a pantalla de inicio"
