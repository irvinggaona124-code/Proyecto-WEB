# GEMINI.md — REGLAS PERMANENTES: LICITACIONES ANTIGRAVITY SWARM

Este archivo asegura que en cada sesión, prompt o comando de Antigravity dentro de este proyecto, la plataforma opere bajo la arquitectura del enjambre de 8 cuentas y el modelo unificado de compras públicas (Panamá, Colombia y Costa Rica).

---

## 1. ROLES DEL ENJAMBRE DE 8 CUENTAS (ANTIGRAVITY)

- **Cuenta 1 (Flash High):** Worker Panamá (PanamáCompra DGCP + Canal de Panamá ACP, adendas y homologaciones).
- **Cuenta 2 (Flash High):** Worker Colombia (SECOP II API Socrata, códigos UNSPSC y resumen ejecutivo).
- **Cuenta 3 (Flash High):** Worker Costa Rica (SICOP Datos Abiertos y carteles del día, objeciones y garantías).
- **Cuenta 4 (Pro High / Argon):** Copiloto Gems & Auditor On-Demand (+100 páginas, cláusulas trampa, RUP, Matriz de Cumplimiento).
- **Cuenta 5 (Pro High):** Supervisor & Gatekeeper DB (Valida montos > 0, divisas a USD, fecha_cierre > fecha_publicacion).
- **Cuenta 6 (Flash / Pro High):** Motor Opal (Dossier matutino 7:00 a.m. vía Resend, alertas WhatsApp en 3 líneas, informes de mercado).
- **Cuenta 7 (Pro High):** Fábrica Pomelli & Programmatic SEO (Carruseles LinkedIn de casos reales, URLs indexables y metadatos).
- **Cuenta 8 (Pro High):** Desarrollo Full-Stack & Nodo Failover (Next.js/Astro, scrapers, APIs y backup de cuota ante /usage > 85%).

---

## 2. ESQUEMA DE BASE DE DATOS (`licitaciones_normalizadas`)

- **Campos principales:** `id_global`, `id_origen`, `pais` ('PA','CO','CR'), `entidad_compradora`, `titulo_objeto`, `monto_estimado`, `moneda` ('USD','COP','CRC'), `monto_usd_normalizado`, `categoria_macro`, `codigo_estandar`, `tipo_procedimiento`, `fecha_publicacion`, `fecha_cierre`, `fecha_homologacion`, `estado`, `url_oficial`, `resumen_ia`, `plantilla_sugerida`, `search_vector`.
- **10 Macro-Categorías:**
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

---

## 3. REGLAS ETL Y TOKEN SHIELD (85 % AHORRO)

- Pre-filtrar y limpiar siempre con Python en local. Nunca enviar HTML crudo ni PDFs completos a las Cuentas 1, 2 y 3.
- Convertir todas las monedas a `monto_usd_normalizado` antes del upsert en Supabase.
- Alertas de WhatsApp estrictamente en 3 líneas (País/Entidad/Objeto/Cierre, Link oficial, Link plantilla).
- Monetización cruzada directa: Matriz de Cumplimiento (`$19`-`$25`), Calculadora APU (`$29`-`$39`), Evaluador Financiero RUP (`$25`-`$35`), Matriz de Homologación (`$19`), CRM Licitaciones (`$29`), Kit Maestro (`$69`-`$79`), Plan Pro (`$29`/mes) y Plan Equipos (`$69`/mes).
