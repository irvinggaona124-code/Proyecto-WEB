-- ==============================================================================
-- TABLA MAESTRA: licitaciones_normalizadas (Supabase / PostgreSQL)
-- Plataforma de Inteligencia de Licitaciones (Panamá, Colombia y Costa Rica)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS licitaciones_normalizadas (
  id_global TEXT PRIMARY KEY, -- ej: PA-2026-0-12-001-08-LV-023456, CO-CO1.REQ.12345, CR-2026LN-000001
  id_origen VARCHAR(100) NOT NULL,
  pais VARCHAR(2) NOT NULL CHECK (pais IN ('PA', 'CO', 'CR')),
  entidad_compradora VARCHAR(255) NOT NULL,
  titulo_objeto TEXT NOT NULL,
  monto_estimado NUMERIC(15,2),
  moneda VARCHAR(3) CHECK (moneda IN ('USD', 'COP', 'CRC')),
  monto_usd_normalizado NUMERIC(15,2),
  categoria_macro VARCHAR(50) NOT NULL,
  codigo_estandar VARCHAR(50), -- UNSPSC o CPC
  tipo_procedimiento VARCHAR(50),
  fecha_publicacion TIMESTAMPTZ,
  fecha_cierre TIMESTAMPTZ,
  fecha_homologacion TIMESTAMPTZ,
  estado VARCHAR(30) DEFAULT 'publicada', -- publicada, adenda_activa, evaluacion, adjudicada, desierta
  url_oficial TEXT NOT NULL,
  resumen_ia TEXT,
  plantilla_sugerida VARCHAR(100),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(titulo_objeto, '') || ' ' ||
    coalesce(entidad_compradora, '') || ' ' || coalesce(categoria_macro, ''))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_licitaciones_search ON licitaciones_normalizadas USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_licitaciones_pais_cat ON licitaciones_normalizadas (pais, categoria_macro, estado);
CREATE INDEX IF NOT EXISTS idx_licitaciones_cierre ON licitaciones_normalizadas (fecha_cierre);
CREATE INDEX IF NOT EXISTS idx_licitaciones_pais_fecha ON licitaciones_normalizadas (pais, fecha_publicacion DESC);
