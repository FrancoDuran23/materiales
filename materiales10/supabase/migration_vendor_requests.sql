-- ============================================================
-- Tabla vendor_requests: solicitudes de acceso de corralones
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS vendor_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name text NOT NULL,
  email text NOT NULL,
  phone text,
  whatsapp text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_requests_status ON vendor_requests(status);
CREATE INDEX IF NOT EXISTS idx_vendor_requests_email ON vendor_requests(email);

-- RLS
ALTER TABLE vendor_requests ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede crear una solicitud (formulario publico)
CREATE POLICY "vendor_requests_insert" ON vendor_requests
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden ver solicitudes
CREATE POLICY "vendor_requests_select" ON vendor_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Solo admins pueden actualizar (aprobar/rechazar)
CREATE POLICY "vendor_requests_update" ON vendor_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Solo admins pueden eliminar
CREATE POLICY "vendor_requests_delete" ON vendor_requests
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );
