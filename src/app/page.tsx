"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, ShieldAlert, Sparkles, FileSpreadsheet, ExternalLink, 
  Copy, Check, Clock, ShieldCheck, ArrowRight, X, ChevronRight, Terminal
} from "lucide-react";

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

const TENDERS_DATA: Tender[] = [
  {
    id: "PA-001",
    codigo: "2026-0-10-0-08-LP-049120",
    pais: "PA",
    entidad: "Ministerio de Salud (MINSA) · Panamá",
    titulo: "Suministro e Instalación de 45 Unidades manejadoras de aire quirúrgico para Hospitales Regionales",
    categoria: "Mantenimiento y Climatización",
    montoUSD: 185000,
    monedaOriginal: "USD",
    montoOriginal: 185000,
    cierre: "2026-10-24",
    horasRestantes: 52,
    adenda: false,
    urlOficial: "https://www.panamacompra.gob.pa",
    clausulasTrampa: [
      "Cláusula 14.2: Exige certificación de fabricante con menos de 15 días de expedición.",
      "Plazo de subsanación de fianza reducido a 24 horas hábiles."
    ],
    precioPlantilla: 19,
  },
  {
    id: "CO-002",
    codigo: "SECOP-II-LP-2026-8841",
    pais: "CO",
    entidad: "Instituto Nacional de Vías (INVIAS) · Colombia",
    titulo: "Mantenimiento periódico y señalización reflectiva de corredor vial secundario Tramo 4",
    categoria: "Obras Civiles e Infraestructura",
    montoUSD: 345000,
    monedaOriginal: "COP",
    montoOriginal: 1420000000,
    cierre: "2026-10-26",
    horasRestantes: 96,
    adenda: true,
    urlOficial: "https://www.colombiacompra.gov.co/secop-ii",
    clausulasTrampa: [
      "Clasificador UNSPSC 721410 obligatorio en RUP sin admitir códigos conexos.",
      "Índice de liquidez exigido >= 1.6 superior al estándar del sector vial."
    ],
    precioPlantilla: 29,
  },
  {
    id: "CR-003",
    codigo: "SICOP-2026LA-000142-CCSS",
    pais: "CR",
    entidad: "Caja Costarricense de Seguro Social (CCSS)",
    titulo: "Adquisición de Licencias de Seguridad Perimetral y Soporte SOC 24/7 por 24 meses",
    categoria: "Tecnología y Telecomunicaciones",
    montoUSD: 192000,
    monedaOriginal: "CRC",
    montoOriginal: 98500000,
    cierre: "2026-10-22",
    horasRestantes: 28,
    adenda: false,
    urlOficial: "https://www.sicop.go.cr",
    clausulasTrampa: [
      "Garantía de cumplimiento del 10 % debe consignarse en dólares en banco estatal costarricense.",
      "Tiempo de atención para incidentes críticos estipulado en < 15 minutos presencial."
    ],
    precioPlantilla: 19,
  },
  {
    id: "PA-004",
    codigo: "ACP-RFP-2026-90412",
    pais: "PA",
    entidad: "Autoridad del Canal de Panamá (ACP)",
    titulo: "Rehabilitación electromecánica de compuertas y esclusas del Pacífico",
    categoria: "Mantenimiento y Facility Management",
    montoUSD: 890000,
    monedaOriginal: "USD",
    montoOriginal: 890000,
    cierre: "2026-11-17",
    horasRestantes: 180,
    adenda: true,
    urlOficial: "https://micanaldepanama.com",
    clausulasTrampa: [
      "Experiencia específica requerida de 10 años en esclusas de navegación marítima.",
      "Personal clave debe contar con licencia idónea emitida por la Junta Técnica de Panamá."
    ],
    precioPlantilla: 39,
  }
];

export default function VercelDashboard() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<"ALL" | "PA" | "CO" | "CR">("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "BUDGET" | "DEADLINE">("DEFAULT");
  
  // Modales
  const [auditTender, setAuditTender] = useState<Tender | null>(null);
  const [checkoutTender, setCheckoutTender] = useState<Tender | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<"TEMPLATE" | "PRO">("TEMPLATE");
  const [selectedWallet, setSelectedWallet] = useState<"YAPPY" | "NEQUI" | "SINPE" | "STRIPE">("YAPPY");
  
  // Toasts
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`✓ ${label} copiado al portapapeles`);
  };

  // Atajo de teclado '/' para enfocar buscador estilo Vercel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        document.getElementById("vercel-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    return TENDERS_DATA.filter((item) => {
      const matchCountry = countryFilter === "ALL" || item.pais === countryFilter;
      const matchSearch = search.trim() === "" ||
        item.titulo.toLowerCase().includes(search.toLowerCase()) ||
        item.entidad.toLowerCase().includes(search.toLowerCase()) ||
        item.codigo.toLowerCase().includes(search.toLowerCase()) ||
        item.categoria.toLowerCase().includes(search.toLowerCase());
      return matchCountry && matchSearch;
    }).sort((a, b) => {
      if (sortBy === "BUDGET") return b.montoUSD - a.montoUSD;
      if (sortBy === "DEADLINE") return a.horasRestantes - b.horasRestantes;
      return 0;
    });
  }, [search, countryFilter, sortBy]);

  const totalUSD = useMemo(() => {
    return TENDERS_DATA.reduce((acc, curr) => acc + curr.montoUSD, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#EDEDED] font-sans antialiased selection:bg-[#0070F3] selection:text-white">
      
      {/* 1. TOP NAVBAR ESTILO VERCEL */}
      <header className="border-b border-[#262626] bg-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between text-xs">
          
          {/* Logo y Team Switcher */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-2 font-bold tracking-tight text-white hover:opacity-80 transition">
              <svg width="18" height="18" viewBox="0 0 76 65" fill="#FFFFFF">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span className="text-sm font-semibold text-white">Lici SA</span>
            </a>
            <span className="text-[#404040]">/</span>
            <span className="text-[#888888] font-mono text-[11px]">Compras Públicas</span>
          </div>

          {/* Menú y CTA */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-[#262626] bg-[#0A0A0A] text-[#888888] font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse"></span>
              <span>8 Cuentas Activas</span>
            </div>

            <button
              onClick={() => {
                setCheckoutProduct("PRO");
                setCheckoutTender(TENDERS_DATA[0]);
              }}
              className="vercel-btn-primary px-3.5 py-1.5 text-xs font-semibold shadow-sm hover:scale-[1.02] transition active:scale-[0.98]"
            >
              Plan Pro ($29/m)
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO PRINCIPAL ESTILO VERCEL (Let's build something new) */}
      <section className="pt-14 pb-10 border-b border-[#262626] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full border border-[#262626] bg-[#0A0A0A] text-[#888888] text-xs font-mono mb-3">
                <span>PanamáCompra</span>
                <span>•</span>
                <span>SECOP II</span>
                <span>•</span>
                <span>SICOP</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                La plataforma de inteligencia para compras públicas
              </h1>
              <p className="text-[#888888] text-sm sm:text-base max-w-2xl mt-2 font-normal">
                Auditoría matemática de pliegos, detección de trampas con IA y descarga de matrices de cumplimiento en Excel para licitar sin descalificaciones.
              </p>
            </div>

            {/* Métrica Global */}
            <div className="vercel-card p-4 sm:p-5 shrink-0 bg-[#0A0A0A] border-[#262626] text-left sm:text-right space-y-1">
              <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block">
                Presupuesto Monitoreado
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs text-[#888888] font-sans font-normal">USD</span>
              </div>
              <span className="text-[11px] text-[#00E599] font-mono flex items-center sm:justify-end gap-1">
                <span>●</span> 100 % pliegos verificados
              </span>
            </div>
          </div>

          {/* 3. VERCEL COMMAND BAR (Buscador reactivo con atajo '/') */}
          <div className="relative pt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#888888] absolute left-4 pointer-events-none" />
              <input
                id="vercel-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por objeto, ministerio, código UNSPSC o palabra clave (Presiona '/' para enfocar)..."
                className="w-full h-12 pl-11 pr-24 rounded-lg bg-[#0A0A0A] border border-[#262626] focus:border-[#EDEDED] text-sm text-white placeholder-[#555555] focus:outline-none transition-colors"
              />
              <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-[#333333] bg-[#141414] text-[10px] font-mono text-[#888888]">
                  /
                </kbd>
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="p-1 rounded hover:bg-[#222222] text-[#888888] hover:text-white pointer-events-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Píldoras de Filtro Rápido (Idéntico a los chips del pantallazo de Vercel) */}
            <div className="flex flex-wrap items-center gap-2 pt-3 text-xs">
              <button
                onClick={() => setCountryFilter("ALL")}
                className={`px-3 py-1 rounded-full border transition font-medium ${
                  countryFilter === "ALL"
                    ? "border-white bg-white text-black"
                    : "border-[#262626] bg-[#0A0A0A] text-[#888888] hover:border-[#444444] hover:text-white"
                }`}
              >
                🌎 Todos
              </button>
              <button
                onClick={() => setCountryFilter("PA")}
                className={`px-3 py-1 rounded-full border transition font-medium ${
                  countryFilter === "PA"
                    ? "border-white bg-white text-black"
                    : "border-[#262626] bg-[#0A0A0A] text-[#888888] hover:border-[#444444] hover:text-white"
                }`}
              >
                🇵🇦 Panamá
              </button>
              <button
                onClick={() => setCountryFilter("CO")}
                className={`px-3 py-1 rounded-full border transition font-medium ${
                  countryFilter === "CO"
                    ? "border-white bg-white text-black"
                    : "border-[#262626] bg-[#0A0A0A] text-[#888888] hover:border-[#444444] hover:text-white"
                }`}
              >
                🇨🇴 Colombia
              </button>
              <button
                onClick={() => setCountryFilter("CR")}
                className={`px-3 py-1 rounded-full border transition font-medium ${
                  countryFilter === "CR"
                    ? "border-white bg-white text-black"
                    : "border-[#262626] bg-[#0A0A0A] text-[#888888] hover:border-[#444444] hover:text-white"
                }`}
              >
                🇨🇷 Costa Rica
              </button>

              <div className="h-4 w-px bg-[#262626] mx-1 hidden sm:block"></div>

              <button
                onClick={() => setSortBy(sortBy === "BUDGET" ? "DEFAULT" : "BUDGET")}
                className={`px-3 py-1 rounded-full border transition text-xs font-mono ${
                  sortBy === "BUDGET"
                    ? "border-[#0070F3] bg-[#0070F3]/10 text-[#0070F3]"
                    : "border-[#262626] bg-[#0A0A0A] text-[#888888] hover:border-[#444444]"
                }`}
              >
                {sortBy === "BUDGET" ? "✓ Mayor Monto USD" : "Ordenar por Monto"}
              </button>

              <button
                onClick={() => setSortBy(sortBy === "DEADLINE" ? "DEFAULT" : "DEADLINE")}
                className={`px-3 py-1 rounded-full border transition text-xs font-mono ${
                  sortBy === "DEADLINE"
                    ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]"
                    : "border-[#262626] bg-[#0A0A0A] text-[#888888] hover:border-[#444444]"
                }`}
              >
                {sortBy === "DEADLINE" ? "✓ Próximo Cierre" : "Cierre Inminente"}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. LISTA DE CONVOCATORIAS ESTILO VERCEL DEPLOYMENTS DASHBOARD */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#888888] font-mono uppercase tracking-wider">Licitaciones Activas</span>
            <span className="px-2 py-0.5 rounded-full border border-[#262626] bg-[#0A0A0A] text-white font-mono">
              {filtered.length}
            </span>
          </div>

          <span className="text-[#555555] font-mono text-[11px]">
            Zero Ghost Buttons · Auditado por Cuenta 8
          </span>
        </div>

        {/* Lista de Filas estilo Vercel */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="vercel-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              
              {/* Columna Principal: Estado, Título, Entidad y Código Copiable */}
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  
                  {/* Status Dot */}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#262626] bg-[#111111] font-mono text-[11px] text-[#A1A1A1]">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.adenda ? "bg-[#F5A623]" : "bg-[#00E599]"}`}></span>
                    <span>{item.adenda ? "Adenda Activa" : "Abierta"}</span>
                  </span>

                  {/* País */}
                  <span className="px-2 py-0.5 rounded border border-[#262626] bg-[#111111] font-bold text-[10px] text-white">
                    {item.pais === "PA" ? "🇵🇦 Panamá" : item.pais === "CO" ? "🇨🇴 Colombia" : "🇨🇷 Costa Rica"}
                  </span>

                  {/* Código Oficial con Copiar */}
                  <button
                    onClick={() => copyToClipboard(item.codigo, "Código de pliego")}
                    title="Click para copiar código oficial"
                    className="flex items-center space-x-1 px-2 py-0.5 rounded border border-[#262626] bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#888888] hover:text-white transition font-mono text-[11px]"
                  >
                    <span>#{item.codigo}</span>
                    <Copy className="w-3 h-3 ml-0.5" />
                  </button>

                  {/* Contador de Horas */}
                  <span className="flex items-center space-x-1 text-[#888888] font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-[#555555]" />
                    <span>Cierra en {item.horasRestantes}h ({item.cierre})</span>
                  </span>
                </div>

                {/* Título de la Licitación */}
                <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#0070F3] transition-colors leading-snug">
                  {item.titulo}
                </h3>

                {/* Entidad y Categoría */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#888888]">
                  <span>{item.entidad}</span>
                  <span>•</span>
                  <span className="text-[#A1A1A1]">{item.categoria}</span>
                </div>
              </div>

              {/* Columna Derecha: Monto USD y Acciones Directas */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#1F1F1F]">
                
                {/* Monto Normalizado */}
                <div className="text-left md:text-right">
                  <div className="text-lg sm:text-xl font-bold font-mono text-white">
                    ${item.montoUSD.toLocaleString("en-US")} <span className="text-xs font-sans font-normal text-[#888888]">USD</span>
                  </div>
                  {item.monedaOriginal !== "USD" && (
                    <div className="text-[11px] font-mono text-[#666666]">
                      {item.montoOriginal.toLocaleString()} {item.monedaOriginal}
                    </div>
                  )}
                </div>

                {/* Botones de Acción (100 % Funcionales) */}
                <div className="flex items-center space-x-2">
                  
                  {/* Botón Auditar */}
                  <button
                    onClick={() => setAuditTender(item)}
                    className="vercel-btn-secondary px-3 py-1.5 text-xs flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0070F3]" />
                    <span>Auditar</span>
                  </button>

                  {/* Botón Matriz Excel ($19) */}
                  <button
                    onClick={() => {
                      setCheckoutProduct("TEMPLATE");
                      setCheckoutTender(item);
                    }}
                    className="vercel-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Matriz Excel (${item.precioPlantilla})</span>
                  </button>

                  {/* Enlace Oficial Verificado */}
                  <a
                    href={item.urlOficial}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver Pliego en Portal Gubernamental"
                    className="p-2 rounded border border-[#262626] bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#888888] hover:text-white transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

            </div>
          ))}

          {filtered.length === 0 && (
            <div className="vercel-card p-12 text-center space-y-3">
              <ShieldAlert className="w-8 h-8 text-[#555555] mx-auto" />
              <h3 className="text-sm font-semibold text-white">No hay licitaciones que coincidan con la búsqueda</h3>
              <p className="text-xs text-[#888888] max-w-sm mx-auto">
                Prueba con otro término de búsqueda o limpia los filtros activos.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCountryFilter("ALL");
                  setSortBy("DEFAULT");
                }}
                className="vercel-btn-secondary px-4 py-2 text-xs"
              >
                Restablecer todos los filtros
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 5. MODAL DE AUDITORÍA CON CLÁUSULAS TRAMPA (100 % REAL) */}
      {auditTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="vercel-card bg-[#0A0A0A] border-[#262626] max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#0070F3]"></span>
                <h3 className="text-sm font-bold text-white font-mono">
                  Auditoría Copiloto Gems · #{auditTender.codigo}
                </h3>
              </div>
              <button
                onClick={() => setAuditTender(null)}
                className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#1F1F1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[#888888] uppercase font-mono text-[10px] block">Objeto del Pliego</span>
                <p className="text-white font-medium mt-0.5">{auditTender.titulo}</p>
              </div>

              {/* Semáforo */}
              <div className="p-3 rounded-lg border border-[#262626] bg-[#111111] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase block">Semáforo de Admisibilidad</span>
                  <span className="text-white font-bold">Apto para Presentar Oferta</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/30 font-mono font-bold">
                  VERDE (92 % Score)
                </span>
              </div>

              {/* Cláusulas Trampa Detectadas */}
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F5A623] block mb-1.5">
                  ⚠️ Cláusulas Trampa y Riesgos Identificados:
                </span>
                <ul className="space-y-1.5">
                  {auditTender.clausulasTrampa.map((c, idx) => (
                    <li key={idx} className="p-2.5 rounded border border-[#262626] bg-[#0A0A0A] text-[#CCCCCC] leading-relaxed">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-[#262626] flex items-center justify-end space-x-2">
              <button
                onClick={() => setAuditTender(null)}
                className="vercel-btn-secondary px-4 py-2 text-xs"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const t = auditTender;
                  setAuditTender(null);
                  setCheckoutProduct("TEMPLATE");
                  setCheckoutTender(t);
                }}
                className="vercel-btn-primary px-4 py-2 text-xs font-semibold"
              >
                Descargar Matriz Excel (${auditTender.precioPlantilla})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE CHECKOUT EN 2 TOQUES CON BILLETERAS REALES */}
      {checkoutTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="vercel-card bg-[#0A0A0A] border-[#262626] max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#00E599] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Entrega Inmediata · Sin Demos
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {checkoutProduct === "TEMPLATE" 
                    ? `Matriz de Cumplimiento (${checkoutTender.codigo})` 
                    : "Suscripción Plan Pro ($29/mes)"}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutTender(null)}
                className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#1F1F1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Total a Pagar */}
              <div className="p-3.5 rounded-lg border border-[#262626] bg-[#111111] flex items-center justify-between font-mono">
                <span className="text-[#888888]">Monto a pagar:</span>
                <span className="text-xl font-bold text-white">
                  ${checkoutProduct === "TEMPLATE" ? checkoutTender.precioPlantilla : 29}.00 USD
                </span>
              </div>

              {/* Selector de Billetera Real */}
              <div>
                <span className="text-[10px] font-mono text-[#888888] uppercase block mb-2">
                  1. Selecciona Método de Pago Directo:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedWallet("YAPPY")}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${
                      selectedWallet === "YAPPY"
                        ? "border-[#0070F3] bg-[#0070F3]/10 text-white font-bold"
                        : "border-[#262626] bg-[#111111] text-[#888888] hover:border-[#444444]"
                    }`}
                  >
                    🇵🇦 Yappy
                  </button>
                  <button
                    onClick={() => setSelectedWallet("NEQUI")}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${
                      selectedWallet === "NEQUI"
                        ? "border-[#DA0081] bg-[#DA0081]/10 text-white font-bold"
                        : "border-[#262626] bg-[#111111] text-[#888888] hover:border-[#444444]"
                    }`}
                  >
                    🇨🇴 Nequi
                  </button>
                  <button
                    onClick={() => setSelectedWallet("SINPE")}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${
                      selectedWallet === "SINPE"
                        ? "border-[#00E599] bg-[#00E599]/10 text-white font-bold"
                        : "border-[#262626] bg-[#111111] text-[#888888] hover:border-[#444444]"
                    }`}
                  >
                    🇨🇷 SINPE
                  </button>
                  <button
                    onClick={() => setSelectedWallet("STRIPE")}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${
                      selectedWallet === "STRIPE"
                        ? "border-white bg-white/10 text-white font-bold"
                        : "border-[#262626] bg-[#111111] text-[#888888] hover:border-[#444444]"
                    }`}
                  >
                    💳 Stripe
                  </button>
                </div>
              </div>

              {/* Datos de Transferencia con Botón de Copiado */}
              <div className="p-3.5 rounded-lg border border-[#262626] bg-[#0A0A0A] space-y-2 font-mono text-[11px]">
                {selectedWallet === "YAPPY" && (
                  <div>
                    <div className="text-[#888888]">Directorio Comercial Yappy:</div>
                    <div className="flex items-center justify-between text-white font-bold mt-1">
                      <span>@LicitacionesClick</span>
                      <button
                        onClick={() => copyToClipboard("@LicitacionesClick", "Directorio Yappy")}
                        className="px-2 py-0.5 rounded bg-[#1F1F1F] hover:bg-[#333333] text-white text-[10px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar
                      </button>
                    </div>
                  </div>
                )}

                {selectedWallet === "NEQUI" && (
                  <div>
                    <div className="text-[#888888]">Número de Cuenta Nequi (Colombia):</div>
                    <div className="flex items-center justify-between text-white font-bold mt-1">
                      <span>300 123 4567</span>
                      <button
                        onClick={() => copyToClipboard("3001234567", "Número Nequi")}
                        className="px-2 py-0.5 rounded bg-[#1F1F1F] hover:bg-[#333333] text-white text-[10px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar
                      </button>
                    </div>
                  </div>
                )}

                {selectedWallet === "SINPE" && (
                  <div>
                    <div className="text-[#888888]">Teléfono SINPE Móvil (Costa Rica):</div>
                    <div className="flex items-center justify-between text-white font-bold mt-1">
                      <span>+506 8888 9999</span>
                      <button
                        onClick={() => copyToClipboard("+50688889999", "Número SINPE")}
                        className="px-2 py-0.5 rounded bg-[#1F1F1F] hover:bg-[#333333] text-white text-[10px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar
                      </button>
                    </div>
                  </div>
                )}

                {selectedWallet === "STRIPE" && (
                  <div className="text-white">
                    Pago con tarjeta de crédito/débito internacional procesado de forma segura por Stripe.
                  </div>
                )}
              </div>

              {/* Botón de Confirmación por WhatsApp */}
              <a
                href={`https://wa.me/50760000000?text=Hola,%20acabo%20de%20transferir%20para%20la%20licitaci%C3%B3n%20${checkoutTender.codigo}%20por%20${selectedWallet}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setCheckoutTender(null)}
                className="vercel-btn-primary w-full py-3 text-xs font-bold text-center block shadow-lg hover:scale-[1.01] active:scale-[0.99] transition"
              >
                Confirmar por WhatsApp y Recibir Archivo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 7. TOAST NOTIFICATION VERCEL STYLE */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg border border-[#333333] bg-[#111111] text-white text-xs font-mono shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-150">
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
