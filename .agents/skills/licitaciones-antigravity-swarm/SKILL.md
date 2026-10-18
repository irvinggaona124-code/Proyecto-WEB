---
name: licitaciones-antigravity-swarm
description: Orquesta la arquitectura, extraccion ETL, normalizacion de datos, auditoria de pliegos y monetizacion de plantillas para la plataforma de inteligencia de licitaciones publicas (Panama, Colombia y Costa Rica) con el enjambre de 8 cuentas en Google Antigravity. Usala cuando el usuario pida programar scrapers o conectores de PanamaCompra, SECOP II o SICOP, estructurar la base de datos en Supabase/PostgreSQL, configurar las cuentas de Antigravity, auditar pliegos con IA, disenar plantillas de licitacion (APU, matriz de cumplimiento, RUP) o generar rutas de Programmatic SEO y flujos de alertas con Opal y Pomelli.
---

# Licitaciones Antigravity Swarm

Orquesta el desarrollo técnico, la ingesta y normalización de compras públicas (Panamá, Colombia y Costa Rica), la auditoría de pliegos con IA y la venta cruzada de plantillas operativas operando sobre un enjambre de 8 cuentas en Google Antigravity.

## When to Use
- Desarrollar, mantener o depurar pipelines ETL y scrapers para PanamáCompra/ACP (Panamá), SECOP II vía API Socrata (Colombia) o SICOP (Costa Rica).
- Estructurar consultas, esquemas SQL o validaciones para la tabla maestra `licitaciones_normalizadas` en PostgreSQL / Supabase.
- Configurar, aislar o balancear cargas de trabajo entre las 8 cuentas de Google con Gemini en Antigravity.
- Auditar pliegos de cargos en PDF para extraer requisitos excluyentes, garantías, fechas críticas y riesgos de descalificación.
- Vincular licitaciones con el catálogo de plantillas descargables (Matriz de Cumplimiento, Calculadora APU, Evaluador Financiero, Matriz de Homologación y CRM) o generar rutas de Programmatic SEO y alertas para WhatsApp/correo.

## Steps

### 1. Enrutar la tarea en el enjambre de 8 cuentas de Antigravity
Asigna cada proceso al nodo correspondiente del enjambre (aislando cada cuenta en su propio contenedor Docker o directorio `HOME=/opt/antigravity/profiles/acct_X` para evitar colisiones de sesión OAuth):

- **Cuenta 1 (Gemini Flash High - Worker Panamá):** Extrae y clasifica pliegos de PanamáCompra (DGCP) y del Canal de Panamá (ACP), priorizando la detección de adendas y fechas de reuniones de homologación.
- **Cuenta 2 (Gemini Flash High - Worker Colombia):** Procesa lotes JSON de la API abierta de SECOP II (Socrata) y mapea códigos UNSPSC a las 10 macro-categorías.
- **Cuenta 3 (Gemini Flash High - Worker Costa Rica):** Estructura carteles nuevos y el módulo de Datos Abiertos de SICOP, calculando plazos legales de objeción o apelación al cartel.
- **Cuenta 4 (Gemini 3.1 Pro High / Argon - Analista On-Demand y Copiloto Gems):** Audita pliegos extensos (+100 páginas) para suscriptores de pago, detecta cláusulas abusivas o direccionadas y pre-llena matrices de cumplimiento.
- **Cuenta 5 (Gemini 3.1 Pro High - Supervisor y Gatekeeper DB):** Valida la integridad matemática y temporal de los lotes JSON de las Cuentas 1, 2 y 3 antes de hacer upsert en Supabase.
- **Cuenta 6 (Gemini Flash / Pro High - Motor Opal):** Ejecuta los 3 flujos en segundo plano: (1) Dossier Matutino a las 7:00 a.m. vía Resend, (2) diferencial de adendas para alertas instantáneas por WhatsApp, y (3) informes mensuales de mercado.
- **Cuenta 7 (Gemini 3.1 Pro High - Motor Pomelli y Programmatic SEO):** Genera carruseles de LinkedIn con casos reales para captar leads y redacta metadatos para las URLs dinámicas de SEO.
- **Cuenta 8 (Gemini 3.1 Pro High - Desarrollo Full-Stack y Failover):** Entorno principal en el IDE para programar el frontend (Next.js/Astro) y nodo de respaldo automático si `/usage` supera el 85% en cualquier otra cuenta.

### 2. Normalizar datos y clasificar en las 10 Macro-Categorías
Transforma cualquier registro entrante de Panamá, Colombia o Costa Rica al esquema estándar de la tabla `licitaciones_normalizadas`:

#### Esquema DDL en Supabase / PostgreSQL:
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

#### Reglas de validación (Cuenta 5 - Gatekeeper):
- Verificar que `fecha_cierre > fecha_publicacion`.
- Verificar que `monto_estimado > 0` con conversión válida a `monto_usd_normalizado`.
- Si alguna validación falla, devolver el registro a la cola de reprocesamiento.

#### Taxonomía única de 10 Macro-Categorías:
1. Salud y Equipamiento Médico
2. Tecnología y Telecomunicaciones
3. Obras Civiles e Infraestructura
4. Mantenimiento y Facility Management
5. Transporte, Flotas y Logística
6. Alimentos, Catering y Suministros Agro
7. Servicios Profesionales y Consultoría
8. Seguridad y Vigilancia
9. Limpieza, Desechos y Gestión Ambiental
10. Papelería, Mobiliario y Suministros de Oficina

### 3. Aplicar reglas de extracción ETL por país
Separa siempre la extracción determinista en Python del procesamiento cognitivo con IA para ahorrar hasta un 85% de cuota:

- **Colombia (SECOP II):** Consultar directamente la API REST de Socrata en `datos.gov.co` filtrando por ventana temporal (`$where=fecha_de_publicacion > '...'`). Parsear fechas, montos y códigos UNSPSC en Python puro; enviar a la Cuenta 2 únicamente el objeto del contrato para resumen ejecutivo y recomendación de plantilla.
- **Panamá (PanamáCompra / ACP):** Usar scraper asíncrono (Playwright o httpx + BeautifulSoup) cada 30 minutos con reintentos controlados. Limpiar el DOM en Python y enviar a la Cuenta 1 solo el texto limpio del pliego o de la tabla de adendas.
- **Costa Rica (SICOP):** Cruzar los reportes del módulo público de Datos Abiertos de SICOP con el scraper de carteles activos del día y procesar con la Cuenta 3 los requisitos de admisibilidad y plazos de objeción.

### 4. Vincular el Catálogo de Plantillas (Venta Cruzada) y Precios
Cada vez que se muestre una licitación en la web o se audite un pliego, insertar la recomendación de venta cruzada según la necesidad detectada:

- **Licitaciones de obras civiles o mantenimiento:** Recomendar la **Calculadora de Análisis de Precios Unitarios (APU) y Márgenes** (con cálculo A.I.U. y simulador de flujo de caja ante pagos estatales a 60-120 días) (`$29` - `$39` USD).
- **Compras de equipos médicos, TI o suministros:** Recomendar la **Matriz de Homologación y Fichas Técnicas (Pasa / No Pasa)** (`$19` USD).
- **Licitaciones con requisitos de RUP o solvencia estricta:** Recomendar el **Evaluador de Capacidad Financiera e Índices de Idoneidad** (Liquidez, Endeudamiento, Cobertura) (`$25` - `$35` USD).
- **Servicios profesionales y consultorías:** Recomendar la **Plantilla de Estructuración de Honorarios y Matriz de Experiencia del Personal** (`$19` - `$25` USD).
- **Transversal para cualquier pliego o contratista:** Ofrecer la **Matriz de Cumplimiento Técnico y Checklist de Admisibilidad** (`$19` - `$25` USD), el **Tablero CRM de Seguimiento de Licitaciones y Cobro Estatal** (`$29` USD), el **Kit Maestro con las 5 plantillas** (`$69` - `$79` USD) o el desbloqueo total mediante el **Plan Pro** (`$29` USD/mes o `$290` USD/año) o **Plan Equipos** (`$69` USD/mes).

### 5. Generar Alertas (Opal) y Rutas de Programmatic SEO (Pomelli)

#### Formato de Alerta Instantánea para WhatsApp (máximo 3 líneas):
- **Línea 1:** País, Entidad y Objeto resumido + Monto en USD y Fecha de cierre.
- **Línea 2:** Enlace directo al pliego o adenda oficial (`url_oficial`).
- **Línea 3:** Enlace directo a la plantilla recomendada para ese pliego (compra directa o descarga Pro).

#### Estructura de URLs para Programmatic SEO (Next.js / Astro con SSG/ISR):
- Por rubro: `/[pais]/licitaciones/[slug-categoria]` (ej. `/panama/licitaciones/tecnologia`).
- Por entidad: `/[pais]/entidad/[slug-entidad]` (ej. `/colombia/entidad/ministerio-de-salud`).

#### Caja de Conversión Cruzada (Call to Action en cada licitación):
"¿Vas a licitar en este pliego? Descarga la [Plantilla Recomendada] por `$19` - `$39` USD o desbloquéala gratis con el Plan Pro (`$29`/mes)."

## Gotchas y Reglas de Blindaje
- **No envíes HTML crudo ni PDFs completos innecesarios a los Workers Flash (Cuentas 1, 2 y 3):** Extrae primero el texto plano y los metadatos con Python determinista para ahorrar hasta un 85% de tokens y proteger la cuota diaria.
- **No mezcles sesiones de Google en el mismo entorno local:** Si dos procesos usan el mismo directorio `~/.config/antigravity`, sobrescribirán el token OAuth. Mantén siempre un contenedor Docker o variable `HOME=/opt/antigravity/profiles/acct_X` dedicada por cada cuenta.
- **No publiques licitaciones sin validar divisas:** Convierte siempre los montos en COP y CRC a `monto_usd_normalizado` antes de guardar en Supabase.
- **Evita fricción comercial en los llamados a la acción:** Nunca propongas flujos de "agendar demo con un asesor"; dirige siempre a la compra instantánea de la plantilla (`$19` - `$39` USD) o a la suscripción directa del Plan Pro (`$29`/mes) con pasarelas locales (Yappy, Nequi, SINPE) o internacionales (Stripe, Lemon Squeezy).
