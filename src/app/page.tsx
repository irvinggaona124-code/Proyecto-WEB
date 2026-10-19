"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  ArrowUpRight,
  Copy,
  Check,
  X,
  RefreshCw,
  Terminal,
  AlertTriangle,
  FileSpreadsheet,
  SlidersHorizontal,
} from "lucide-react";

// ============================================================================
// TIPOS DE DATOS Y RESPALDO LOCAL
// ============================================================================

interface Tender {
  id: string;
  codigo: string;
  pais: "PA" | "CO" | "CR";
  entidad: string;
  titulo: string;
  categoria: string;
  montoUSD: number;
  monedaOriginal: string;
  montoOriginal: number;
  cierre: string;
  horasRestantes: number;
  adenda: boolean;
  urlOficial: string;
  clausulasTrampa: string[];
  precioPlantilla: number;
}

const FALLBACK_TENDERS: Tender[] = [
  {
    id: "PA-001",
    codigo: "2026-0-10-0-08-LP-049120",
    pais: "PA",
    entidad: "Ministerio de Salud (MINSA)",
    titulo:
      "Suministro e instalación de 45 unidades manejadoras de aire quirúrgico con filtración HEPA para hospitales regionales",
    categoria: "Mantenimiento y Climatización",
    montoUSD: 185000,
    monedaOriginal: "USD",
    montoOriginal: 185000,
    cierre: "2026-10-24",
    horasRestantes: 52,
    adenda: false,
    urlOficial: "https://www.panamacompra.gob.pa",
    clausulasTrampa: [
      "Cláusula 14.2: Exige carta de respaldo de fabricante con apostilla consular de menos de 15 días calendario.",
      "Plazo perentorio de subsanación de fianza de propuesta fijado en solo 24 horas hábiles tras apertura.",
    ],
    precioPlantilla: 19,
  },
  {
    id: "CO-002",
    codigo: "SECOP-II-LP-2026-8841",
    pais: "CO",
    entidad: "Instituto Nacional de Vías (INVIAS)",
    titulo:
      "Mantenimiento periódico, parcheo técnico y señalización reflectiva de corredor vial secundario Tramo 4",
    categoria: "Obras Civiles e Infraestructura",
    montoUSD: 345000,
    monedaOriginal: "COP",
    montoOriginal: 1420000000,
    cierre: "2026-10-26",
    horasRestantes: 96,
    adenda: true,
    urlOficial: "https://www.colombiacompra.gov.co/secop-ii",
    clausulasTrampa: [
      "Clasificador UNSPSC 721410 obligatorio en el Registro Único de Proponentes (RUP) sin habilitación de códigos conexos.",
      "Índice de liquidez exigido >= 1.6 y endeudamiento <= 65 % calculados al corte fiscal anterior.",
    ],
    precioPlantilla: 29,
  },
  {
    id: "CR-003",
    codigo: "SICOP-2026LA-000142-CCSS",
    pais: "CR",
    entidad: "Caja Costarricense de Seguro Social (CCSS)",
    titulo:
      "Servicio administrado de seguridad perimetral, firewall de última generación y soporte SOC 24/7 por 24 meses",
    categoria: "Tecnología y Telecomunicaciones",
    montoUSD: 192000,
    monedaOriginal: "CRC",
    montoOriginal: 98500000,
    cierre: "2026-10-22",
    horasRestantes: 28,
    adenda: false,
    urlOficial: "https://www.sicop.go.cr",
    clausulasTrampa: [
      "Garantía de cumplimiento del 10 % debe consignarse exclusivamente en dólares en un banco estatal costarricense.",
      "SLA de respuesta para incidentes de severidad 1 estipulado en < 15 minutos en sitio.",
    ],
    precioPlantilla: 19,
  },
  {
    id: "PA-004",
    codigo: "ACP-RFP-2026-90412",
    pais: "PA",
    entidad: "Autoridad del Canal de Panamá (ACP)",
    titulo:
      "Rehabilitación electromecánica de compuertas y sistemas hidráulicos de esclusas del Pacífico",
    categoria: "Mantenimiento y Facility Management",
    montoUSD: 890000,
    monedaOriginal: "USD",
    montoOriginal: 890000,
    cierre: "2026-11-17",
    horasRestantes: 180,
    adenda: true,
    urlOficial: "https://micanaldepanama.com",
    clausulasTrampa: [
      "Experiencia corporativa certificada mínima de 10 años en esclusas de navegación interoceánica.",
      "Ingeniero residente debe poseer idoneidad expedida por la Junta Técnica de Ingeniería y Arquitectura de Panamá (JTIA).",
    ],
    precioPlantilla: 39,
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
// PÁGINA PRINCIPAL (GEIST DESIGN SYSTEM)
// ============================================================================

export default function LiciSaPlatform() {
  const [tenders, setTenders] = useState<Tender[]>(FALLBACK_TENDERS);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<
    "ALL" | "PA" | "CO" | "CR"
  >("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "BUDGET" | "DEADLINE">(
    "DEFAULT"
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  // Estados de Modales
  const [auditTender, setAuditTender] = useState<Tender | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [dynamicFindings, setDynamicFindings] = useState<string[] | null>(null);

  const [checkoutTender, setCheckoutTender] = useState<Tender | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<"TEMPLATE" | "PRO">(
    "TEMPLATE"
  );
  const [selectedWallet, setSelectedWallet] = useState<
    "YAPPY" | "NEQUI" | "SINPE" | "CARD"
  >("YAPPY");

  // Estado de copiado
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Mapear respuesta de FastAPI (/api/licitaciones) al formato de la vista
  const fetchTendersFromApi = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/licitaciones`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.licitaciones) && data.licitaciones.length > 0) {
        const mapped: Tender[] = data.licitaciones.map(
          (item: Record<string, unknown>, idx: number) => ({
            id: String(
              (item.id_licitacion as string) || `LIC-${idx + 1}`
            ),
            codigo: String(
              (item.codigo_oficial as string) ||
                (item.id_licitacion as string) ||
                `LIC-${idx + 1}`
            ),
            pais: (
              ["PA", "CO", "CR"].includes(item.pais as string)
                ? item.pais
                : "PA"
            ) as "PA" | "CO" | "CR",
            entidad: String(
              (item.entidad_compradora as string) || "Entidad Oficial"
            ),
            titulo: String(
              (item.titulo_objeto as string) ||
                "Proceso de contratación pública"
            ),
            categoria: String(
              (item.categoria_macro as string) || "General"
            ),
            montoUSD: Number(item.monto_usd_normalizado || 0),
            monedaOriginal: String(
              (item.moneda_original as string) || "USD"
            ),
            montoOriginal: Number(
              item.monto_original ||
                item.monto_usd_normalizado ||
                0
            ),
            cierre: String(
              (item.fecha_cierre as string) || "2026-10-30"
            ).slice(0, 10),
            horasRestantes: Number(item.horas_restantes || 48),
            adenda: Boolean(item.tiene_adenda),
            urlOficial: String(
              (item.url_pliego as string) ||
                "https://www.panamacompra.gob.pa"
            ),
            clausulasTrampa: Array.isArray(item.alertas_pliego)
              ? (item.alertas_pliego as string[])
              : [
                  "Revisión de requisitos habilitantes financieros e índices de liquidez requerida.",
                  "Verificar plazo estricto de subsanación de fianza de cumplimiento.",
                ],
            precioPlantilla: Number(
              item.precio_plantilla_usd || 19
            ),
          })
        );
        setTenders(mapped);
        setApiConnected(true);
      }
    } catch {
      // Mantiene FALLBACK_TENDERS silenciosamente si el servidor Python no está activo
      setApiConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchTendersFromApi();
  }, [fetchTendersFromApi]);

  // Sincronización con /api/sync del Enjambre
  const handleSyncSwarm = async () => {
    setIsSyncing(true);
    try {
      await fetch(`${API_BASE}/api/sync`, { method: "POST" });
      await fetchTendersFromApi();
    } catch {
      // Fallback visual
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Auditoría conectada a POST /api/auditar
  const openAuditModal = async (tender: Tender) => {
    setAuditTender(tender);
    setDynamicFindings(null);
    setAuditLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auditar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_licitacion: tender.id,
          entidad: tender.entidad,
          objeto: tender.titulo,
          texto_pliego: tender.clausulasTrampa.join(" "),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (
          Array.isArray(data.clausulas_riesgo) &&
          data.clausulas_riesgo.length > 0
        ) {
          setDynamicFindings(data.clausulas_riesgo);
        }
      }
    } catch {
      // Usa tender.clausulasTrampa locales
    } finally {
      setAuditLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Atajos de teclado ('/' para buscar, 'Esc' para cerrar modales)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
      if (e.key === "Escape") {
        setAuditTender(null);
        setCheckoutTender(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    return tenders
      .filter((item) => {
        const matchCountry =
          countryFilter === "ALL" || item.pais === countryFilter;
        const matchSearch =
          search.trim() === "" ||
          item.titulo.toLowerCase().includes(search.toLowerCase()) ||
          item.entidad.toLowerCase().includes(search.toLowerCase()) ||
          item.codigo.toLowerCase().includes(search.toLowerCase()) ||
          item.categoria.toLowerCase().includes(search.toLowerCase());
        return matchCountry && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "BUDGET") return b.montoUSD - a.montoUSD;
        if (sortBy === "DEADLINE") return a.horasRestantes - b.horasRestantes;
        return 0;
      });
  }, [tenders, search, countryFilter, sortBy]);

  const totalUSD = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + curr.montoUSD, 0);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans">
      {/* =====================================================================
          1. BARRA DE NAVEGACIÓN SUPERIOR (56px, BORDE 1PX, SIN GRADIENTES)
      ===================================================================== */}
      <header className="sticky top-0 z-30 h-14 border-b border-white/[0.08] bg-[#000000]/85 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between border-x border-white/[0.08]">
          {/* Marca estilo Vercel */}
          <div className="flex items-center space-x-3">
            <a
              href="/"
              className="flex items-center space-x-2.5 text-[#EDEDED] hover:opacity-80 transition-opacity"
            >
              {/* Triángulo Geométrico Puro */}
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
            <div className="flex items-center space-x-2 font-mono text-[11px] text-[#888888]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>PA · CO · CR</span>
              <span className="hidden sm:inline text-[#555555]">
                {apiConnected ? "SWARM_API_ONLINE" : "STATIC_REPLICA"}
              </span>
            </div>
          </div>

          {/* Controles Superiores */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleSyncSwarm}
              disabled={isSyncing}
              className="hidden sm:inline-flex items-center space-x-1.5 h-8 px-3 rounded-[6px] bg-[#0A0A0A] border border-white/[0.12] hover:border-white/[0.25] text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] transition-colors"
            >
              <RefreshCw
                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>{isSyncing ? "SYNCING..." : "SYNC_NODES"}</span>
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20consultar%20sobre%20el%20monitoreo%20de%20licitaciones%20de%20Lici%20S.A.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center space-x-1.5 h-8 px-3 rounded-[6px] bg-[#0A0A0A] border border-white/[0.12] hover:border-white/[0.25] text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] transition-colors"
            >
              <span>WA: {WHATSAPP_DISPLAY}</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <button
              onClick={() => {
                setCheckoutProduct("PRO");
                setCheckoutTender(tenders[0] || FALLBACK_TENDERS[0]);
              }}
              className="h-8 px-3.5 rounded-[6px] bg-[#EDEDED] hover:bg-white text-[#000000] font-medium text-xs tracking-[-0.01em] transition-colors"
            >
              Plan Pro · $29/mes
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. CONTENEDOR ARQUITECTÓNICO CENTRAL (1200PX, BORDES DE 1PX)
      ===================================================================== */}
      <div className="max-w-[1200px] mx-auto border-x border-white/[0.08] relative">
        {/* HERO SECTION CON CUADRÍCULA ESTRUCTURAL */}
        <section className="relative border-b border-white/[0.08]">
          {/* Crosshairs en las 4 esquinas del Hero */}
          <Crosshair className="absolute -top-[8px] -left-[8px]" />
          <Crosshair className="absolute -top-[8px] -right-[8px]" />
          <Crosshair className="absolute -bottom-[8px] -left-[8px]" />
          <Crosshair className="absolute -bottom-[8px] -right-[8px]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {/* Columna Izquierda: Propuesta de Valor */}
            <div className="lg:col-span-8 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-[4px] border border-white/[0.12] bg-[#0A0A0A] font-mono text-[11px] text-[#A1A1A1]">
                  <Terminal className="w-3 h-3 text-[#EDEDED]" />
                  <span>PANAMACOMPRA · SECOP II · SICOP</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-[-0.04em] text-[#EDEDED] leading-[1.08]">
                  Inteligencia de licitaciones públicas.{" "}
                  <span className="text-[#888888]">
                    Cero descalificaciones por letra chica.
                  </span>
                </h1>

                <p className="text-[#888888] text-sm sm:text-[15px] max-w-2xl leading-relaxed">
                  Ingesta automatizada de pliegos estatales en Panamá, Colombia
                  y Costa Rica. Detección determinista de cláusulas excluyentes,
                  índices financieros y matrices de cumplimiento en Excel listas
                  para presentar oferta.
                </p>
              </div>

              {/* Telemetría de Nodos en Vivo */}
              <div className="pt-2 flex flex-wrap items-center gap-6 font-mono text-xs text-[#888888]">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>PA_DGCP: 99.98%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>CO_SECOP_II: 99.95%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>CR_SICOP: 99.91%</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Métrica de Volumen y Estado */}
            <div className="lg:col-span-4 flex flex-col justify-between divide-y divide-white/[0.08] bg-[#050505]">
              <div className="p-6 sm:p-8 space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#888888] block">
                  Volumen Oficial Monitoreado
                </span>
                <div className="text-3xl sm:text-4xl font-semibold font-mono tracking-tight tabular-nums text-[#EDEDED]">
                  $
                  {totalUSD.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                  })}
                  <span className="text-xs text-[#888888] ml-1.5 font-normal">
                    USD
                  </span>
                </div>
                <p className="text-xs text-[#666666]">
                  Suma normalizada a dólares estadounidenses según tasa oficial
                  del día.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[#888888]">
                  <span>PROCESOS_ACTIVOS</span>
                  <span className="text-[#EDEDED] tabular-nums">
                    {filtered.length} VERIFICADOS
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#888888]">
                  <span>MOTOR_AUDITORIA</span>
                  <span className="text-[#EDEDED]">GATEKEEPER_V1</span>
                </div>
                <div className="flex items-center justify-between text-[#888888]">
                  <span>TIEMPO_ENTREGA_EXCEL</span>
                  <span className="text-[#10B981]">&lt; 5 MIN</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. BARRA DE COMANDOS Y FILTROS (ESTILO VERCEL DEPLOYMENTS)
        =================================================================== */}
        <section className="border-b border-white/[0.08] bg-[#050505]">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {/* Input de Búsqueda */}
            <div className="lg:col-span-6 relative flex items-center px-4 h-12">
              <Search className="w-4 h-4 text-[#666666] mr-3 shrink-0" />
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por entidad (MINSA, INVIAS, CCSS, ACP), código o palabra clave..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#EDEDED] placeholder-[#666666] focus:outline-none"
              />
              {search ? (
                <button
                  onClick={() => setSearch("")}
                  className="p-1 text-[#666666] hover:text-[#EDEDED]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono text-[#888888] bg-[#111111] border border-white/[0.12] rounded-[4px]">
                  /
                </kbd>
              )}
            </div>

            {/* Selector de Jurisdicción (Sin Emojis) */}
            <div className="lg:col-span-4 flex items-center px-3 h-12 space-x-1 overflow-x-auto">
              {(
                [
                  { id: "ALL", label: "ALL" },
                  { id: "PA", label: "PA · DGCP/ACP" },
                  { id: "CO", label: "CO · SECOP II" },
                  { id: "CR", label: "CR · SICOP" },
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

            {/* Ordenamiento */}
            <div className="lg:col-span-2 flex items-center justify-between px-3 h-12 space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#666666] shrink-0 hidden xl:block ml-1" />
              <button
                onClick={() =>
                  setSortBy(sortBy === "BUDGET" ? "DEFAULT" : "BUDGET")
                }
                className={`flex-1 h-7 px-2 rounded-[4px] font-mono text-[11px] transition-colors ${
                  sortBy === "BUDGET"
                    ? "bg-white/[0.12] text-[#EDEDED] border border-white/[0.2]"
                    : "text-[#888888] hover:text-[#EDEDED]"
                }`}
              >
                $ MONTO
              </button>
              <button
                onClick={() =>
                  setSortBy(sortBy === "DEADLINE" ? "DEFAULT" : "DEADLINE")
                }
                className={`flex-1 h-7 px-2 rounded-[4px] font-mono text-[11px] transition-colors ${
                  sortBy === "DEADLINE"
                    ? "bg-white/[0.12] text-[#EDEDED] border border-white/[0.2]"
                    : "text-[#888888] hover:text-[#EDEDED]"
                }`}
              >
                CIERRE
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            4. MATRIZ DE LICITACIONES (CELDAS COMPARTIDAS DE 1PX)
        =================================================================== */}
        <main className="divide-y divide-white/[0.08]">
          {filtered.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <p className="font-mono text-xs text-[#888888]">
                NO_MATCHING_TENDERS_FOUND
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCountryFilter("ALL");
                }}
                className="h-8 px-3 rounded-[6px] border border-white/[0.14] text-xs font-mono text-[#EDEDED] hover:bg-white/[0.05]"
              >
                RESTABLECER_FILTROS
              </button>
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                className="p-6 sm:p-8 bg-[#000000] hover:bg-[#080808] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Bloque Izquierdo: Metadatos Técnicos y Objeto */}
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    {/* Estado Semántico */}
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] border ${
                        item.adenda
                          ? "border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]"
                          : "border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.adenda ? "bg-[#F59E0B]" : "bg-[#10B981]"
                        }`}
                      />
                      <span>
                        {item.adenda ? "ADENDA_ACTIVA" : "ABIERTA"}
                      </span>
                    </span>

                    {/* Código ISO País */}
                    <span className="px-2 py-0.5 rounded-[4px] border border-white/[0.12] bg-[#0A0A0A] text-[#EDEDED]">
                      {item.pais}
                    </span>

                    {/* Código Oficial Copiable */}
                    <button
                      onClick={() => copyToClipboard(item.codigo)}
                      title="Copiar código del proceso"
                      className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] border border-white/[0.08] bg-[#0A0A0A] hover:border-white/[0.24] text-[#888888] hover:text-[#EDEDED] transition-colors"
                    >
                      <span>{item.codigo}</span>
                      {copiedCode === item.codigo ? (
                        <Check className="w-3 h-3 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    {/* Ventana de Cierre */}
                    <span className="text-[#888888] tabular-nums">
                      CIERRE: {item.cierre} ({item.horasRestantes}h)
                    </span>
                  </div>

                  {/* Título de la Licitación */}
                  <h2 className="text-base sm:text-[17px] font-medium tracking-[-0.01em] text-[#EDEDED] leading-snug">
                    {item.titulo}
                  </h2>

                  {/* Entidad y Rubro */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#888888]">
                    <span className="text-[#A1A1A1] font-medium">
                      {item.entidad}
                    </span>
                    <span className="text-white/20">/</span>
                    <span>{item.categoria}</span>
                    <span className="text-white/20">/</span>
                    <span className="font-mono text-[11px] text-[#F59E0B]">
                      {item.clausulasTrampa.length} cláusulas críticas
                      detectadas
                    </span>
                  </div>
                </div>

                {/* Bloque Derecho: Presupuesto Tabular y Controles */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
                  <div className="text-left lg:text-right">
                    <div className="text-xl font-semibold font-mono tracking-tight tabular-nums text-[#EDEDED]">
                      ${item.montoUSD.toLocaleString("en-US")}
                      <span className="text-xs text-[#888888] font-normal ml-1">
                        USD
                      </span>
                    </div>
                    {item.monedaOriginal !== "USD" && (
                      <div className="font-mono text-[11px] text-[#666666] tabular-nums">
                        {item.montoOriginal.toLocaleString("en-US")}{" "}
                        {item.monedaOriginal}
                      </div>
                    )}
                  </div>

                  {/* Botones de Acción Geist */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openAuditModal(item)}
                      className="h-9 px-3.5 rounded-[6px] bg-[#0A0A0A] border border-white/[0.14] hover:border-white/[0.28] hover:bg-[#141414] text-xs font-medium text-[#EDEDED] flex items-center space-x-1.5 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Auditar Pliego</span>
                    </button>

                    <button
                      onClick={() => {
                        setCheckoutProduct("TEMPLATE");
                        setCheckoutTender(item);
                      }}
                      className="h-9 px-3.5 rounded-[6px] bg-[#EDEDED] hover:bg-white text-[#000000] text-xs font-medium flex items-center space-x-1.5 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Matriz Excel · ${item.precioPlantilla}</span>
                    </button>

                    <a
                      href={item.urlOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir portal estatal oficial"
                      className="h-9 w-9 rounded-[6px] bg-[#0A0A0A] border border-white/[0.14] hover:border-white/[0.28] text-[#888888] hover:text-[#EDEDED] flex items-center justify-center transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>

        {/* ===================================================================
            5. BENTO GRID TÉCNICO DE 3 CELDAS (ARQUITECTURA DEL ENJAMBRE)
        =================================================================== */}
        <section className="border-t border-white/[0.08] relative">
          <Crosshair className="absolute -top-[8px] -left-[8px]" />
          <Crosshair className="absolute -top-[8px] -right-[8px]" />

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            <div className="p-6 sm:p-8 space-y-3 bg-[#030303]">
              <span className="font-mono text-[11px] text-[#888888] block">
                01 / INGESTA_MULTIPAIS
              </span>
              <h3 className="text-sm font-semibold text-[#EDEDED]">
                Normalización Financiera y UNSPSC
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Extracción directa desde PanamáCompra (DGCP y ACP), SECOP II
                (Colombia) y SICOP (Costa Rica) con conversión cambiaria
                automatizada a USD.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3 bg-[#030303]">
              <span className="font-mono text-[11px] text-[#888888] block">
                02 / AUDITORIA_COPILOT_GEMS
              </span>
              <h3 className="text-sm font-semibold text-[#EDEDED]">
                Detección de Cláusulas Trampa
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Identificación anticipada de requisitos excluyentes: apostillas
                consulares, tiempos de subsanación de fianzas e índices RUP de
                liquidez y endeudamiento.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3 bg-[#030303]">
              <span className="font-mono text-[11px] text-[#888888] block">
                03 / MATRICES_EJECUTABLES
              </span>
              <h3 className="text-sm font-semibold text-[#EDEDED]">
                Plantillas de Cumplimiento en Excel
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Desglose técnico de requisitos obligatorios, formularios de
                cotización y calculadora de riesgos financieros lista para
                descarga inmediata.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          6. MODAL DE AUDITORÍA DE PLIEGO (CONECTADO A /api/auditar)
      ===================================================================== */}
      {auditTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/[0.14] max-w-xl w-full rounded-[8px] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-mono text-[11px] text-[#F59E0B]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DICTAMEN_DE_ADMISIBILIDAD</span>
                </div>
                <h3 className="text-sm font-semibold text-[#EDEDED] leading-snug">
                  {auditTender.titulo}
                </h3>
                <p className="font-mono text-[11px] text-[#888888]">
                  {auditTender.entidad} · {auditTender.codigo}
                </p>
              </div>
              <button
                onClick={() => setAuditTender(null)}
                className="p-1 text-[#888888] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="font-mono text-[11px] text-[#888888] uppercase">
                Hallazgos críticos en el pliego de cargos:
              </div>

              {auditLoading ? (
                <div className="p-4 border border-white/[0.08] bg-[#050505] font-mono text-xs text-[#888888]">
                  Ejecutando CopilotoAuditorPro sobre {auditTender.codigo}...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(dynamicFindings || auditTender.clausulasTrampa).map(
                    (clausula, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-[6px] border border-[#F59E0B]/25 bg-[#F59E0B]/[0.05] font-mono text-xs text-[#EDEDED] leading-relaxed flex items-start space-x-3"
                      >
                        <span className="text-[#F59E0B] select-none">
                          0{idx + 1}
                        </span>
                        <span className="font-sans text-xs text-[#D4D4D4]">
                          {clausula}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/[0.08] bg-[#050505] flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20tengo%20dudas%20t%C3%A9cnicas%20con%20el%20pliego%20${encodeURIComponent(auditTender.codigo)}%20de%20${encodeURIComponent(auditTender.entidad)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-9 px-4 rounded-[6px] bg-[#0A0A0A] border border-white/[0.14] hover:border-white/[0.28] text-xs font-medium text-[#EDEDED] flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Consultar Analista ({WHATSAPP_DISPLAY})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  const target = auditTender;
                  setAuditTender(null);
                  setCheckoutProduct("TEMPLATE");
                  setCheckoutTender(target);
                }}
                className="w-full sm:w-auto h-9 px-4 rounded-[6px] bg-[#EDEDED] hover:bg-white text-[#000000] text-xs font-medium transition-colors"
              >
                Adquirir Matriz Excel · ${auditTender.precioPlantilla} USD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. MODAL DE CHECKOUT (YAPPY / NEQUI / SINPE / TARJETA)
      ===================================================================== */}
      {checkoutTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/[0.14] max-w-lg w-full rounded-[8px] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] text-[#10B981] block">
                  ENTREGA_INMEDIATA
                </span>
                <h3 className="text-sm font-semibold text-[#EDEDED] mt-0.5">
                  {checkoutProduct === "TEMPLATE"
                    ? `Matriz de Cumplimiento · ${checkoutTender.codigo}`
                    : "Suscripción Plan Pro · Monitoreo Ilimitado"}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutTender(null)}
                className="p-1 text-[#888888] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-4 rounded-[6px] border border-white/[0.08] bg-[#050505] flex items-center justify-between">
                <span className="text-[#888888] font-mono">TOTAL_ORDEN</span>
                <span className="text-xl font-semibold font-mono tabular-nums text-[#EDEDED]">
                  $
                  {checkoutProduct === "TEMPLATE"
                    ? checkoutTender.precioPlantilla
                    : 29}
                  .00 USD
                </span>
              </div>

              {/* Selector de Pasarela Monocromático */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-[#888888] uppercase block">
                  Método de pago regional:
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

              {/* Instrucciones Técnicas */}
              <div className="p-4 rounded-[6px] border border-white/[0.08] bg-[#050505] space-y-2">
                {selectedWallet === "YAPPY" && (
                  <>
                    <div className="text-[#888888] font-mono text-[11px]">
                      TRANSFERENCIA YAPPY (BANCO GENERAL PANAMÁ):
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-sm font-semibold text-[#EDEDED]">
                        {WHATSAPP_DISPLAY}
                      </span>
                      <button
                        onClick={() => copyToClipboard("65787219")}
                        className="h-7 px-2.5 rounded-[4px] border border-white/[0.14] bg-[#111111] hover:bg-[#1A1A1A] font-mono text-[11px] text-[#EDEDED] flex items-center space-x-1.5"
                      >
                        {copiedCode === "65787219" ? (
                          <Check className="w-3 h-3 text-[#10B981]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copiar</span>
                      </button>
                    </div>
                  </>
                )}

                {selectedWallet === "NEQUI" && (
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Al confirmar se genera el QR de Nequi / Bancolombia por
                    WhatsApp con liquidación automática en COP.
                  </p>
                )}

                {selectedWallet === "SINPE" && (
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Al confirmar recibirás el número SINPE Móvil verificado para
                    transferencia inmediata en Costa Rica.
                  </p>
                )}

                {selectedWallet === "CARD" && (
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Se enviará enlace directo de pago con tarjeta internacional
                    (Visa / Mastercard) y entrega inmediata del Excel.
                  </p>
                )}
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20deseo%20adquirir%20${
                  checkoutProduct === "TEMPLATE"
                    ? `la%20Matriz%20de%20Cumplimiento%20para%20la%20licitaci%C3%B3n%20${encodeURIComponent(
                        checkoutTender.codigo
                      )}%20(${checkoutTender.pais})%20por%20$${checkoutTender.precioPlantilla}%20USD`
                    : "el%20Plan%20Pro%20mensual%20($29%20USD)"
                }%20mediante%20${selectedWallet}.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Registra la orden en FastAPI (/api/checkout) si está activo
                  fetch(`${API_BASE}/api/checkout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id_licitacion: checkoutTender.id,
                      codigo_oficial: checkoutTender.codigo,
                      tipo_producto:
                        checkoutProduct === "TEMPLATE"
                          ? "TEMPLATE"
                          : "PRO_PLAN",
                      metodo_pago: selectedWallet,
                      monto_usd:
                        checkoutProduct === "TEMPLATE"
                          ? checkoutTender.precioPlantilla
                          : 29,
                      whatsapp: WHATSAPP_NUMBER,
                      email: "cliente@licisa.com",
                    }),
                  }).catch(() => {});
                  setCheckoutTender(null);
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
          8. FOOTER MINIMALISTA DE PRECISIÓN
      ===================================================================== */}
      <footer className="border-t border-white/[0.08] bg-[#000000] text-xs text-[#666666]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 border-x border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-[#EDEDED] font-medium">Lici S.A.</span>
            <span>/</span>
            <span className="font-mono text-[11px]">
              PANAMA · COLOMBIA · COSTA RICA
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888888] hover:text-[#EDEDED] transition-colors"
            >
              SOPORTE: {WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
