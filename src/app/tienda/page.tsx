"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  ArrowUpRight,
  Copy,
  Check,
  X,
  FileSpreadsheet,
  Terminal,
  Layers,
  ShieldCheck,
} from "lucide-react";

// ============================================================================
// TIPOS Y CATÁLOGO DE RESPALDO SINCRONIZADO CON templates/catalog.py
// ============================================================================

interface DigitalTemplate {
  id: string;
  codigo: string;
  pais: "PA" | "CO" | "CR" | "MULTI";
  nombre: string;
  categoria: string;
  formato: string;
  precio_usd: number;
  descripcion: string;
  entregables: string[];
}

interface SubscriptionPlan {
  id: string;
  codigo: string;
  nombre: string;
  precio_mensual_usd: number;
  descripcion: string;
  destacado?: boolean;
  caracteristicas: string[];
}

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-starter",
    codigo: "STARTER_NODE",
    nombre: "Monitor Básico",
    precio_mensual_usd: 0,
    descripcion:
      "Consulta pública de convocatorias abiertas y visualización de montos normalizados en USD.",
    destacado: false,
    caracteristicas: [
      "Búsqueda manual en PanamáCompra, SECOP II y SICOP",
      "Conversión cambiaria referencial a USD",
      "Acceso a enlaces de pliegos oficiales",
      "Compra individual de matrices Excel bajo demanda",
    ],
  },
  {
    id: "plan-pro",
    codigo: "PRO_LICITADOR",
    nombre: "Plan Pro Licitador",
    precio_mensual_usd: 29,
    descripcion:
      "Auditoría preventiva de cláusulas trampa, alertas tempranas de adendas y descarga preferencial de matrices.",
    destacado: true,
    caracteristicas: [
      "Todo lo incluido en Monitor Básico",
      "Auditoría ilimitada de pliegos con CopilotoAuditorPro",
      "Detección de requisitos excluyentes (RUP, fianzas, apostillas)",
      "Alertas en tiempo real por WhatsApp de nuevas adendas",
      "2 Matrices de Cumplimiento en Excel incluidas al mes",
    ],
  },
  {
    id: "plan-enterprise",
    codigo: "CORP_SWARM",
    nombre: "Corporativo Multi-País",
    precio_mensual_usd: 99,
    descripcion:
      "Infraestructura dedicada para consorcios y departamentos de licitaciones que operan en PA, CO y CR.",
    destacado: false,
    caracteristicas: [
      "Monitoreo automatizado por códigos UNSPSC específicos",
      "Matrices de cumplimiento y desglose de precios ilimitadas",
      "Validación financiera previa de consorcios (Liquidez y Endeudamiento)",
      "Soporte prioritario directo con analistas de pliegos",
      "Acceso directo a la API JSON (/api/licitaciones)",
    ],
  },
];

const FALLBACK_TEMPLATES: DigitalTemplate[] = [
  {
    id: "TPL-PA-01",
    codigo: "MATRIZ-PA-DGCP-2026",
    pais: "PA",
    nombre:
      "Matriz Integral de Cumplimiento y Fianza — PanamáCompra (DGCP)",
    categoria: "Obras Civiles y Suministros Estatales",
    formato: "XLSX + DOCX",
    precio_usd: 19,
    descripcion:
      "Plantilla formulada conforme al Texto Único de la Ley 22 de Contrataciones Públicas de Panamá. Incluye control de subsanación y cálculo de fianza de propuesta (10%).",
    entregables: [
      "01_Checklist_Requisitos_Obligatorios.xlsx",
      "02_Calculadora_Fianza_y_Riesgo.xlsx",
      "03_Modelos_Formularios_Cap_IV.docx",
    ],
  },
  {
    id: "TPL-CO-02",
    codigo: "MATRIZ-CO-SECOPII-RUP",
    pais: "CO",
    nombre:
      "Calculadora Financiera RUP, Liquidez y K-Contratación — SECOP II",
    categoria: "Infraestructura y Licitación Pública",
    formato: "XLSX",
    precio_usd: 29,
    descripcion:
      "Simulador matemático para consorcios y uniones temporales en Colombia. Verifica cumplimiento de Índice de Liquidez, Endeudamiento y Razón de Cobertura de Intereses.",
    entregables: [
      "01_Simulador_Indicadores_RUP_Consorcio.xlsx",
      "02_Matriz_Codigos_UNSPSC_Habilitantes.xlsx",
      "03_Control_Observaciones_Pliego.xlsx",
    ],
  },
  {
    id: "TPL-CR-03",
    codigo: "MATRIZ-CR-SICOP-LGCP",
    pais: "CR",
    nombre:
      "Estructura de Costos y Razonabilidad de Precios — SICOP Costa Rica",
    categoria: "Tecnología, Salud y Servicios",
    formato: "XLSX",
    precio_usd: 19,
    descripcion:
      "Desglose de estructura de precio unitario, cargas sociales CCSS, garantías de cumplimiento y matriz de admisibilidad técnica bajo la Ley General de Contratación Pública.",
    entregables: [
      "01_Desglose_Precio_SICOP_USD_CRC.xlsx",
      "02_Verificador_Garantias_Bancarias.xlsx",
      "03_Matriz_SLA_Admisibilidad.xlsx",
    ],
  },
  {
    id: "TPL-PA-04",
    codigo: "MATRIZ-PA-ACP-RFP",
    pais: "PA",
    nombre:
      "Pack Técnico de Propuesta Económica y QA/QC — Canal de Panamá (ACP)",
    categoria: "Ingeniería Electromecánica y Mantenimiento",
    formato: "XLSX + DOCX",
    precio_usd: 39,
    descripcion:
      "Diseñado bajo el Reglamento de Adquisiciones de la ACP. Incluye validación de idoneidad JTIA, desglose de costos directos/indirectos y matriz de experiencia previa.",
    entregables: [
      "01_ACP_Price_Schedule_Breakdown.xlsx",
      "02_Matriz_Idoneidad_JTIA_Personal.xlsx",
      "03_Checklist_Submittals_RFP.docx",
    ],
  },
];

const WHATSAPP_NUMBER = "50765787219";
const WHATSAPP_DISPLAY = "+507 6578-7219";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ============================================================================
// COMPONENTE CROSSHAIR (+) ARQUITECTÓNICO DE VERCEL
// ============================================================================

function Crosshair({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-[15px] h-[15px] text-white/30 pointer-events-none select-none z-10 ${className}`}
    >
      <path d="M7.5 0V15M0 7.5H15" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

// ============================================================================
// PÁGINA DE TIENDA Y SUSCRIPCIONES (GEIST DESIGN SYSTEM)
// ============================================================================

export default function TiendaPage() {
  const [templates, setTemplates] =
    useState<DigitalTemplate[]>(FALLBACK_TEMPLATES);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(FALLBACK_PLANS);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<
    "ALL" | "PA" | "CO" | "CR" | "MULTI"
  >("ALL");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Estado del Modal de Checkout Unificado
  const [checkoutItem, setCheckoutItem] = useState<{
    id: string;
    codigo: string;
    nombre: string;
    precio_usd: number;
    tipo_producto: "TEMPLATE" | "PRO_PLAN";
  } | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<
    "YAPPY" | "NEQUI" | "SINPE" | "CARD"
  >("YAPPY");

  // Sincronización con GET /api/catalogo de FastAPI
  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/catalogo`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.plantillas) && data.plantillas.length > 0) {
        const mappedTemplates: DigitalTemplate[] = data.plantillas.map(
          (t: Record<string, unknown>, idx: number) => ({
            id: String((t.id as string) || `TPL-0${idx + 1}`),
            codigo: String(
              (t.codigo as string) || (t.id as string) || `MATRIZ-0${idx + 1}`
            ),
            pais: (
              ["PA", "CO", "CR", "MULTI"].includes(t.pais as string)
                ? t.pais
                : "MULTI"
            ) as "PA" | "CO" | "CR" | "MULTI",
            nombre: String(
              (t.nombre as string) ||
                (t.titulo as string) ||
                "Matriz de Cumplimiento"
            ),
            categoria: String(
              (t.categoria as string) || "Contratación Pública"
            ),
            formato: String((t.formato as string) || "XLSX"),
            precio_usd: Number(t.precio_usd || t.precio || 19),
            descripcion: String(
              (t.descripcion as string) ||
                "Matriz técnica verificada para licitaciones estatales."
            ),
            entregables: Array.isArray(t.entregables || t.incluye)
              ? ((t.entregables || t.incluye) as string[])
              : [
                  "01_Matriz_Cumplimiento_Tecnico.xlsx",
                  "02_Calculadora_Riesgos_Financieros.xlsx",
                ],
          })
        );
        setTemplates(mappedTemplates);
      }
      if (Array.isArray(data.planes) && data.planes.length > 0) {
        const mappedPlans: SubscriptionPlan[] = data.planes.map(
          (p: Record<string, unknown>, idx: number) => ({
            id: String((p.id as string) || `plan-${idx}`),
            codigo: String(
              (p.codigo as string) || (p.id as string) || `PLAN_${idx}`
            ).toUpperCase(),
            nombre: String((p.nombre as string) || "Plan Suscripción"),
            precio_mensual_usd: Number(
              p.precio_mensual_usd ?? p.precio_usd ?? p.precio ?? 29
            ),
            descripcion: String(
              (p.descripcion as string) || "Acceso a la plataforma Lici S.A."
            ),
            destacado: Boolean(p.destacado || idx === 1),
            caracteristicas: Array.isArray(p.caracteristicas || p.beneficios)
              ? ((p.caracteristicas || p.beneficios) as string[])
              : ["Monitoreo en tiempo real PA, CO, CR"],
          })
        );
        setPlans(mappedPlans);
      }
    } catch {
      // Mantiene FALLBACK_TEMPLATES y FALLBACK_PLANS si FastAPI no está corriendo
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const matchCountry =
        countryFilter === "ALL" || item.pais === countryFilter;
      const matchSearch =
        search.trim() === "" ||
        item.nombre.toLowerCase().includes(search.toLowerCase()) ||
        item.codigo.toLowerCase().includes(search.toLowerCase()) ||
        item.categoria.toLowerCase().includes(search.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(search.toLowerCase());
      return matchCountry && matchSearch;
    });
  }, [templates, search, countryFilter]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans">
      {/* =====================================================================
          1. BARRA DE NAVEGACIÓN SUPERIOR CON PESTAÑAS DE RUTA
      ===================================================================== */}
      <header className="sticky top-0 z-30 h-14 border-b border-white/[0.08] bg-[#000000]/85 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between border-x border-white/[0.08]">
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="flex items-center space-x-2.5 text-[#EDEDED] hover:opacity-80 transition-opacity"
            >
              <svg
                viewBox="0 0 76 65"
                fill="currentColor"
                className="w-4 h-4 text-[#EDEDED]"
              >
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span className="text-sm font-semibold tracking-[-0.02em]">
                Lici S.A.
              </span>
            </a>
            <span className="text-white/20 font-light select-none">/</span>
            {/* Navegación Estilo Vercel Dashboard */}
            <nav className="flex items-center space-x-1 text-xs">
              <a
                href="/"
                className="px-2.5 py-1 rounded-[4px] text-[#888888] hover:text-[#EDEDED] hover:bg-white/[0.04] transition-colors"
              >
                Monitor de Pliegos
              </a>
              <a
                href="/tienda"
                className="px-2.5 py-1 rounded-[4px] bg-white/[0.08] text-[#EDEDED] font-medium transition-colors"
              >
                Matrices &amp; Planes
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-2.5">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20informaci%C3%B3n%20sobre%20las%20matrices%20Excel%20y%20planes%20de%20Lici%20S.A.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 h-8 px-3 rounded-[6px] bg-[#0A0A0A] border border-white/[0.12] hover:border-white/[0.25] text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] transition-colors"
            >
              <span>WA: {WHATSAPP_DISPLAY}</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="/"
              className="h-8 px-3.5 rounded-[6px] bg-[#EDEDED] hover:bg-white text-[#000000] font-medium text-xs flex items-center transition-colors"
            >
              Ver Licitaciones Activas
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. CONTENEDOR ARQUITECTÓNICO CENTRAL (1200PX, BORDES DE 1PX)
      ===================================================================== */}
      <div className="max-w-[1200px] mx-auto border-x border-white/[0.08] relative">
        {/* CABECERA ARQUITECTÓNICA */}
        <section className="relative border-b border-white/[0.08] p-6 sm:p-10 lg:p-12">
          <Crosshair className="absolute -top-[8px] -left-[8px]" />
          <Crosshair className="absolute -top-[8px] -right-[8px]" />
          <Crosshair className="absolute -bottom-[8px] -left-[8px]" />
          <Crosshair className="absolute -bottom-[8px] -right-[8px]" />
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-[4px] border border-white/[0.12] bg-[#0A0A0A] font-mono text-[11px] text-[#A1A1A1]">
              <Terminal className="w-3 h-3 text-[#EDEDED]" />
              <span>CATALOGO_ACTIVOS_DIGITALES · SAAS_TIERS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-[-0.04em] text-[#EDEDED] leading-[1.08]">
              Matrices de cumplimiento y suscripciones.{" "}
              <span className="text-[#888888]">
                Ingeniería financiera lista para ofertar.
              </span>
            </h1>
            <p className="text-[#888888] text-sm sm:text-[15px] leading-relaxed">
              Adquiere plantillas técnicas individuales en Excel formuladas para
              cada jurisdicción o activa el monitoreo continuo con auditoría
              ilimitada de pliegos.
            </p>
          </div>
        </section>

        {/* ===================================================================
            3. PLANES DE SUSCRIPCIÓN (ESTILO VERCEL PRICING 3 COLUMNAS)
        =================================================================== */}
        <section className="relative border-b border-white/[0.08]">
          <div className="px-6 py-3 border-b border-white/[0.08] bg-[#050505] flex items-center justify-between font-mono text-[11px] text-[#888888]">
            <span>01 / PLANES_SUSCRIPCION_MENSUAL</span>
            <span>LIQUIDACION: USD · YAPPY · NEQUI · SINPE · CARD</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 sm:p-8 flex flex-col justify-between space-y-8 ${
                  plan.destacado ? "bg-[#060606]" : "bg-[#000000]"
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#888888]">
                      {plan.codigo}
                    </span>
                    {plan.destacado && (
                      <span className="px-2 py-0.5 rounded-[4px] border border-[#10B981]/30 bg-[#10B981]/10 font-mono text-[10px] text-[#10B981]">
                        RECOMENDADO
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#EDEDED]">
                      {plan.nombre}
                    </h2>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-3xl sm:text-4xl font-semibold font-mono tracking-tight tabular-nums text-[#EDEDED]">
                        ${plan.precio_mensual_usd}
                      </span>
                      <span className="font-mono text-xs text-[#888888]">
                        USD / mes
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    {plan.descripcion}
                  </p>
                  <div className="border-t border-white/[0.08] pt-5 space-y-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#666666] block">
                      Especificaciones incluidas:
                    </span>
                    <ul className="space-y-2">
                      {plan.caracteristicas.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start space-x-2.5 text-xs text-[#A1A1A1]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#EDEDED] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="pt-4">
                  {plan.precio_mensual_usd === 0 ? (
                    <a
                      href="/"
                      className="w-full h-9 rounded-[6px] bg-[#0A0A0A] border border-white/[0.14] hover:border-white/[0.28] text-xs font-medium text-[#EDEDED] flex items-center justify-center transition-colors"
                    >
                      Explorar Monitor Gratuito
                    </a>
                  ) : (
                    <button
                      onClick={() =>
                        setCheckoutItem({
                          id: plan.id,
                          codigo: plan.codigo,
                          nombre: plan.nombre,
                          precio_usd: plan.precio_mensual_usd,
                          tipo_producto: "PRO_PLAN",
                        })
                      }
                      className={`w-full h-9 rounded-[6px] text-xs font-medium flex items-center justify-center transition-colors ${
                        plan.destacado
                          ? "bg-[#EDEDED] hover:bg-white text-[#000000]"
                          : "bg-[#0A0A0A] border border-white/[0.14] hover:border-white/[0.28] text-[#EDEDED]"
                      }`}
                    >
                      Activar {plan.nombre} · ${plan.precio_mensual_usd}/mes
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            4. BARRA DE FILTRADO DEL CATÁLOGO DE PLANTILLAS EXCEL
        =================================================================== */}
        <section className="border-b border-white/[0.08] bg-[#050505]">
          <div className="px-6 py-3 border-b border-white/[0.08] flex items-center justify-between font-mono text-[11px] text-[#888888]">
            <span>02 / CATALOGO_MATRICES_CUMPLIMIENTO</span>
            <span>{filteredTemplates.length} PLANTILLAS_DISPONIBLES</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            <div className="lg:col-span-7 relative flex items-center px-4 h-12">
              <Search className="w-4 h-4 text-[#666666] mr-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plantilla por normativa (Ley 22, RUP, SICOP, ACP) o código..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#EDEDED] placeholder-[#666666] focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="p-1 text-[#666666] hover:text-[#EDEDED]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="lg:col-span-5 flex items-center px-3 h-12 space-x-1 overflow-x-auto">
              {(
                [
                  { id: "ALL", label: "ALL" },
                  { id: "PA", label: "PA · DGCP/ACP" },
                  { id: "CO", label: "CO · SECOP II" },
                  { id: "CR", label: "CR · SICOP" },
                  { id: "MULTI", label: "MULTI" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCountryFilter(tab.id)}
                  className={`h-7 px-2.5 rounded-[4px] font-mono text-[11px] whitespace-nowrap transition-colors ${
                    countryFilter === tab.id
                      ? "bg-[#EDEDED] text-[#000000] font-medium"
                      : "text-[#888888] hover:text-[#EDEDED] hover:bg-white/[0.04]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            5. CUADRÍCULA DE PLANTILLAS TÉCNICAS (2 COLUMNAS COMPARTIDAS)
        =================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 border-b border-white/[0.08]">
          {filteredTemplates.map((tpl, index) => {
            const isRightCol = index % 2 === 1;
            const isTopRow = index < 2;
            return (
              <article
                key={tpl.id}
                className={`p-6 sm:p-8 bg-[#000000] hover:bg-[#070707] transition-colors flex flex-col justify-between space-y-6 border-white/[0.08] ${
                  isRightCol ? "md:border-l" : ""
                } ${!isTopRow ? "md:border-t" : ""}`}
              >
                <div className="space-y-4">
                  {/* Metadatos Superiores */}
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-[4px] border border-white/[0.14] bg-[#0A0A0A] text-[#EDEDED]">
                        {tpl.pais}
                      </span>
                      <span className="px-2 py-0.5 rounded-[4px] border border-white/[0.08] bg-[#050505] text-[#888888]">
                        {tpl.formato}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(tpl.codigo)}
                      className="inline-flex items-center space-x-1 text-[#888888] hover:text-[#EDEDED]"
                    >
                      <span>{tpl.codigo}</span>
                      {copiedText === tpl.codigo ? (
                        <Check className="w-3 h-3 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Nombre y Descripción */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-[#EDEDED] leading-snug">
                      {tpl.nombre}
                    </h3>
                    <p className="text-xs text-[#888888] leading-relaxed">
                      {tpl.descripcion}
                    </p>
                  </div>

                  {/* Micro-Terminal de Archivos Incluidos */}
                  <div className="p-3.5 rounded-[6px] border border-white/[0.08] bg-[#050505] space-y-2">
                    <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#666666] uppercase">
                      <Layers className="w-3 h-3" />
                      <span>Archivos incluidos en la descarga:</span>
                    </div>
                    <ul className="space-y-1 font-mono text-[11px] text-[#A1A1A1]">
                      {tpl.entregables.map((file, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="text-[#555555]">├─</span>
                          <span>{file}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pie de Celda: Precio Tabular y Compra */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#666666] uppercase block">
                      Licencia Corporativa
                    </span>
                    <div className="text-xl font-semibold font-mono tabular-nums text-[#EDEDED]">
                      ${tpl.precio_usd}
                      <span className="text-xs text-[#888888] font-normal ml-1">
                        USD
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setCheckoutItem({
                        id: tpl.id,
                        codigo: tpl.codigo,
                        nombre: tpl.nombre,
                        precio_usd: tpl.precio_usd,
                        tipo_producto: "TEMPLATE",
                      })
                    }
                    className="h-9 px-4 rounded-[6px] bg-[#EDEDED] hover:bg-white text-[#000000] text-xs font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Descargar Matriz · ${tpl.precio_usd}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {/* =====================================================================
          6. MODAL DE CHECKOUT DIRECTO (CONECTADO A POST /api/checkout)
      ===================================================================== */}
      {checkoutItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/[0.14] max-w-lg w-full rounded-[8px] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#10B981]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ORDEN_INSTANTANEA · ENTREGA_EN_5_MIN</span>
                </div>
                <h3 className="text-sm font-semibold text-[#EDEDED] mt-1">
                  {checkoutItem.nombre}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutItem(null)}
                className="p-1 text-[#888888] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-4 rounded-[6px] border border-white/[0.08] bg-[#050505] flex items-center justify-between">
                <span className="text-[#888888] font-mono">
                  REF: {checkoutItem.codigo}
                </span>
                <span className="text-xl font-semibold font-mono tabular-nums text-[#EDEDED]">
                  ${checkoutItem.precio_usd}.00 USD
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[11px] text-[#888888] uppercase block">
                  Selecciona pasarela local:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { id: "YAPPY", label: "PA · Yappy" },
                      { id: "NEQUI", label: "CO · Nequi" },
                      { id: "SINPE", label: "CR · SINPE" },
                      { id: "CARD", label: "Tarjeta" },
                    ] as const
                  ).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWallet(w.id)}
                      className={`h-9 rounded-[6px] font-mono text-[11px] border transition-colors ${
                        selectedWallet === w.id
                          ? "border-[#EDEDED] bg-[#EDEDED] text-[#000000] font-medium"
                          : "border-white/[0.12] bg-[#050505] text-[#888888] hover:text-[#EDEDED]"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[6px] border border-white/[0.08] bg-[#050505] space-y-2">
                {selectedWallet === "YAPPY" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#888888] font-mono text-[11px] block">
                        DIRECTORIO / CELULAR YAPPY:
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#EDEDED]">
                        {WHATSAPP_DISPLAY}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard("65787219")}
                      className="h-7 px-2.5 rounded-[4px] border border-white/[0.14] bg-[#111111] font-mono text-[11px] text-[#EDEDED] flex items-center space-x-1.5"
                    >
                      {copiedText === "65787219" ? (
                        <Check className="w-3 h-3 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copiar</span>
                    </button>
                  </div>
                )}
                {selectedWallet !== "YAPPY" && (
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Al confirmar la orden por WhatsApp se genera el enlace o QR
                    oficial de {selectedWallet} con entrega inmediata de los
                    archivos.
                  </p>
                )}
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20deseo%20adquirir%20${encodeURIComponent(checkoutItem.nombre)}%20(${encodeURIComponent(checkoutItem.codigo)})%20por%20$${checkoutItem.precio_usd}%20USD%20mediante%20${selectedWallet}.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  fetch(`${API_BASE}/api/checkout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id_licitacion: checkoutItem.id,
                      codigo_oficial: checkoutItem.codigo,
                      tipo_producto: checkoutItem.tipo_producto,
                      metodo_pago: selectedWallet,
                      monto_usd: checkoutItem.precio_usd,
                      whatsapp: WHATSAPP_NUMBER,
                      email: "cliente@licisa.com",
                    }),
                  }).catch(() => {});
                  setCheckoutItem(null);
                }}
                className="w-full h-10 rounded-[6px] bg-[#EDEDED] hover:bg-white text-[#000000] font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Confirmar Orden en WhatsApp ({WHATSAPP_DISPLAY})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. FOOTER MINIMALISTA
      ===================================================================== */}
      <footer className="border-t border-white/[0.08] bg-[#000000] text-xs text-[#666666]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 border-x border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-[#EDEDED] font-medium">Lici S.A.</span>
            <span>/</span>
            <span className="font-mono text-[11px]">
              CATALOGO DE MATRICES &amp; SUSCRIPCIONES
            </span>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-[#888888] hover:text-[#EDEDED]"
          >
            SOPORTE: {WHATSAPP_DISPLAY}
          </a>
        </div>
      </footer>
    </div>
  );
}
