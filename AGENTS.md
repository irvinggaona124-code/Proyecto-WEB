# AGENTS.md — REGLAS PERMANENTES DEL PROYECTO: LICITACIONES ANTIGRAVITY SWARM

Este archivo contiene la especificación arquitectónica, operacional y de datos que rige SIEMPRE este proyecto de Inteligencia de Compras Públicas (Panamá, Colombia y Costa Rica) operado mediante un Enjambre de 8 Cuentas de Google en Antigravity.

---

## 1. ORQUESTACIÓN DEL ENJAMBRE DE 8 CUENTAS (ANTIGRAVITY)

Aislamiento de sesiones: Cada proceso de las 8 cuentas debe ejecutarse en contenedores Docker independientes o con variables de entorno dedicadas `HOME=/opt/antigravity/profiles/acct_X` para evitar sobrescribir las credenciales OAuth en `~/.config/antigravity`.

- **Cuenta 1 (Gemini Flash High — Worker Panamá):**
  - **Función:** Ingesta y clasificación de pliegos de PanamáCompra (DGCP) y Autoridad del Canal de Panamá (ACP).
  - **Foco crítico:** Detección de adendas de última hora, suspensiones y fechas de reuniones de homologación.
- **Cuenta 2 (Gemini Flash High — Worker Colombia):**
  - **Función:** Consumo de lotes de la API abierta de SECOP II (Socrata en `datos.gov.co`).
  - **Foco crítico:** Mapeo de códigos UNSPSC a las 10 macro-categorías, resumen ejecutivo de 2 líneas y recomendación de plantilla.
- **Cuenta 3 (Gemini Flash High — Worker Costa Rica):**
  - **Función:** Estructuración de carteles nuevos y módulo de Datos Abiertos de SICOP.
  - **Foco crítico:** Extracción de requisitos de admisibilidad, cálculo de plazos legales de objeción al cartel y garantías de participación.
- **Cuenta 4 (Gemini 3.1 Pro High / Argon — Copiloto Gems & Analista On-Demand):**
  - **Función:** Exclusiva para suscriptores Plan Pro / Equipos.
  - **Foco crítico:** Lectura profunda de pliegos en PDF (+100 páginas), detección de cláusulas trampa, abusivas o direccionadas, evaluación RUP/idoneidad y pre-llenado de la Matriz de Cumplimiento.
- **Cuenta 5 (Gemini 3.1 Pro High — Supervisor & Gatekeeper DB):**
  - **Función:** Control de calidad previo al upsert en PostgreSQL / Supabase.
  - **Foco crítico:** Validación matemática (`monto_estimado > 0`, conversión a `monto_usd_normalizado`) y temporal (`fecha_cierre > fecha_publicacion`). Si falla, reenvía a cola de reprocesamiento.
- **Cuenta 6 (Gemini Flash / 3.1 Pro High — Motor Opal):**
  - **Función:** Automatizaciones en segundo plano: (1) Dossier Matutino a las 7:00 a.m. vía Resend; (2) Diferencial de adendas en tiempo real para alertas de WhatsApp en 3 líneas; (3) Reportes mensuales de mercado.
- **Cuenta 7 (Gemini 3.1 Pro High — Fábrica Pomelli & Programmatic SEO):**
  - **Función:** Generación de contenido orgánico diario (carruseles de LinkedIn con licitaciones reales y lead magnets) y redacción de metadatos/resúmenes para miles de URLs indexables en Google.
- **Cuenta 8 (Gemini 3.1 Pro High — Desarrollo Full-Stack & Failover):**
  - **Función:** Programación en el IDE de Antigravity (Next.js/Astro, scrapers, APIs, pasarelas) y respaldo automático (hot standby) si cualquier cuenta (1 a 7) supera el 85 % de uso en `/usage`.

---

## 2. ESQUEMA DE BASE DE DATOS Y TAXONOMÍA UNIFICADA

### Tabla Maestra: `licitaciones_normalizadas` (Supabase / PostgreSQL)

```sql
CREATE TABLE licitaciones_normalizadas (
  id_global TEXT PRIMARY KEY,
  id_origen VARCHAR(100) NOT NULL,
  pais VARCHAR(2) NOT NULL CHECK (pais IN ('PA', 'CO', 'CR')),
  entidad_compradora VARCHAR(255) NOT NULL,
  titulo_objeto TEXT NOT NULL,
  monto_estimado NUMERIC(15,2),
  moneda VARCHAR(3) CHECK (moneda IN ('USD', 'COP', 'CRC')),
  monto_usd_normalizado NUMERIC(15,2),
  categoria_macro VARCHAR(50) NOT NULL,
  codigo_estandar VARCHAR(50),
  tipo_procedimiento VARCHAR(50),
  fecha_publicacion TIMESTAMPTZ,
  fecha_cierre TIMESTAMPTZ,
  fecha_homologacion TIMESTAMPTZ,
  estado VARCHAR(30) DEFAULT 'publicada',
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

CREATE INDEX idx_licitaciones_search ON licitaciones_normalizadas USING GIN (search_vector);
CREATE INDEX idx_licitaciones_pais_cat ON licitaciones_normalizadas (pais, categoria_macro, estado);
CREATE INDEX idx_licitaciones_cierre ON licitaciones_normalizadas (fecha_cierre);
```

### Las 10 Macro-Categorías Estandarizadas:
1. **Salud y Equipamiento Médico:** Medicamentos, dispositivos biomédicos, insumos hospitalarios, reactivos de laboratorio.
2. **Tecnología y Telecomunicaciones:** Hardware, licencias de software, ciberseguridad, soporte TI, redes.
3. **Obras Civiles e Infraestructura:** Construcción, rehabilitación vial, puentes, dragados, supervisión y diseño estructural.
4. **Mantenimiento y Facility Management:** Climatización (HVAC), fontanería, ascensores, mantenimiento electromecánico.
5. **Transporte, Flotas y Logística:** Vehículos, combustibles, repuestos, fletes y distribución.
6. **Alimentos, Catering y Suministros Agro:** Comedores escolares, raciones institucionales, granos básicos e insumos agrícolas.
7. **Servicios Profesionales y Consultoría:** Asesoría legal, auditorías financieras, estudios ambientales y peritajes.
8. **Seguridad y Vigilancia:** Guardias privados, videovigilancia (CCTV), control de acceso y equipamiento táctico.
9. **Limpieza, Desechos y Gestión Ambiental:** Aseo institucional, manejo de residuos hospitalarios/peligrosos y reciclaje.
10. **Papelería, Mobiliario y Suministros de Oficina:** Útiles, impresiones, uniformes, mobiliario escolar y corporativo.

---

## 3. REGLAS DE EXTRACCIÓN ETL (AHORRO DEL 85 % EN TOKENS)

- **Regla de oro:** Jamás pasar HTML crudo ni documentos completos a los modelos de lenguaje. Extraer previamente metadatos y texto limpio con scripts deterministas de Python.
- **Colombia (SECOP II):** Consultar el endpoint JSON de Socrata filtrando por `$where=fecha_de_publicacion > '...'`. Enviar a la IA solo el objeto contractual.
- **Panamá (PanamáCompra / ACP):** Scraper con Playwright / httpx ejecutado cada 30 minutos. Limpiar el DOM antes de invocar la Cuenta 1.
- **Costa Rica (SICOP):** Cruzar reportes de Datos Abiertos con carteles activos y procesar requisitos de admisibilidad con la Cuenta 3.

---

## 4. CATÁLOGO DE ACTIVOS DIGITALES (VENTA CRUZADA) Y PRECIOS

Vincular siempre cada licitación con la plantilla técnica adecuada:
1. **Plantilla A — Matriz de Cumplimiento Técnico y Checklist de Admisibilidad (Excel/Notion):** `$19` - `$25` USD.
2. **Plantilla B — Calculadora de Análisis de Precios Unitarios (APU) y Márgenes (Excel con A.I.U. y flujo 60-120 días):** `$29` - `$39` USD.
3. **Plantilla C — Evaluador de Capacidad Financiera e Índices de Idoneidad (Excel para RUP / RIE):** `$25` - `$35` USD.
4. **Plantilla D — Matriz de Homologación y Fichas Técnicas (Salud, TI, Suministros):** `$19` USD.
5. **Plantilla E — Tablero CRM de Seguimiento de Licitaciones y Cobro Estatal (Notion/Sheets):** `$29` USD.
6. **Kit Maestro de Licitaciones (Las 5 plantillas):** `$69` - `$79` USD.
7. **Suscripción SaaS Plan Pro:** `$29` USD/mes o `$290` USD/año.
8. **Suscripción SaaS Plan Equipos:** `$69` USD/mes.

*Cero fricción comercial:* Enlaces directos a pago local (Yappy, Nequi, SINPE) o internacional (Stripe, Lemon Squeezy). No agendar demos.

---

## 5. FORMATO DE ALERTAS Y PROGRAMMATIC SEO

### Formato de Alerta Instantánea de WhatsApp (Máximo 3 líneas)
```text
🚨 [PA/CO/CR] [Entidad]: [Objeto resumido] | Presupuesto: [Monto en USD] | Cierre: [Fecha DD/MM]
📄 Pliego oficial: [url_oficial]
⚡ Prepara tu oferta: Descarga la [Plantilla Recomendada] en [enlace_plantilla]
```

### Rutas Dinámicas de Programmatic SEO (Next.js / Astro)
- Por rubro: `/[pais]/licitaciones/[slug-categoria]`
- Por entidad: `/[pais]/entidad/[slug-entidad]`
