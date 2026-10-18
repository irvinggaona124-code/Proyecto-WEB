"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, ShieldAlert, FileSpreadsheet, ExternalLink, 
  Copy, Clock, ShieldCheck, ArrowRight, X, MessageCircle,
  Building2, CheckCircle2, ChevronRight, HelpCircle, FileText
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
    entidad: "Ministerio de Salud (MINSA)",
    titulo: "Suministro e instalación de 45 unidades manejadoras de aire quirúrgico con filtración HEPA para hospitales regionales",
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
      "Plazo perentorio de subsanación de fianza de propuesta fijado en solo 24 horas hábiles tras apertura."
    ],
    precioPlantilla: 19,
  },
  {
    id: "CO-002",
    codigo: "SECOP-II-LP-2026-8841",
    pais: "CO",
    entidad: "Instituto Nacional de Vías (INVIAS)",
    titulo: "Mantenimiento periódico, parcheo técnico y señalización reflectiva de corredor vial secundario Tramo 4",
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
      "Índice de liquidez exigido >= 1.6 y endeudamiento <= 65 % calculados al corte fiscal anterior."
    ],
    precioPlantilla: 29,
  },
  {
    id: "CR-003",
    codigo: "SICOP-2026LA-000142-CCSS",
    pais: "CR",
    entidad: "Caja Costarricense de Seguro Social (CCSS)",
    titulo: "Servicio administrado de seguridad perimetral, firewall de última generación y soporte SOC 24/7 por 24 meses",
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
      "SLA de respuesta para incidentes de severidad 1 estipulado en < 15 minutos en sitio."
    ],
    precioPlantilla: 19,
  },
  {
    id: "PA-004",
    codigo: "ACP-RFP-2026-90412",
    pais: "PA",
    entidad: "Autoridad del Canal de Panamá (ACP)",
    titulo: "Rehabilitación electromecánica de compuertas y sistemas hidráulicos de esclusas del Pacífico",
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
      "Ingeniero residente debe poseer idoneidad expedida por la Junta Técnica de Ingeniería y Arquitectura de Panamá (JTIA)."
    ],
    precioPlantilla: 39,
  }
];

const WHATSAPP_NUMBER = "50765787219";
const WHATSAPP_DISPLAY = "+507 6578-7219";

export default function LiciSaPlatform() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<"ALL" | "PA" | "CO" | "CR">("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "BUDGET" | "DEADLINE">("DEFAULT");
  
  // Modales
  const [auditTender, setAuditTender] = useState<Tender | null>(null);
  const [checkoutTender, setCheckoutTender] = useState<Tender | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<"TEMPLATE" | "PRO">("TEMPLATE");
  const [selectedWallet, setSelectedWallet] = useState<"YAPPY" | "NEQUI" | "SINPE" | "CARD">("YAPPY");
  
  // Toasts
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`✓ ${label} copiado`);
  };

  // Atajo de teclado '/' para enfocar buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
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
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP NAVBAR CORPORATIVO */}
      <header className="border-b border-slate-800/80 bg-[#07090E]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo y Badge de Cobertura */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-2.5 font-bold tracking-tight text-white hover:opacity-90 transition">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white leading-tight">Lici S.A.</span>
                <span className="text-[10px] text-slate-400 font-medium">Compras Públicas</span>
              </div>
            </a>
            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Panamá · Colombia · Costa Rica
            </span>
          </div>

          {/* Contacto y Botón Pro */}
          <div className="flex items-center space-x-3 text-xs">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20consultar%20sobre%20el%20monitoreo%20de%20licitaciones%20de%20Lici%20S.A.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 bg-slate-900/60 hover:bg-emerald-950/20 text-slate-300 hover:text-emerald-400 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: <strong className="font-semibold text-white">{WHATSAPP_DISPLAY}</strong></span>
            </a>

            <button
              onClick={() => {
                setCheckoutProduct("PRO");
                setCheckoutTender(TENDERS_DATA[0]);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/20 transition active:scale-[0.98]"
            >
              Planes Pro ($29/mes)
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO PRINCIPAL */}
      <section className="pt-12 pb-8 border-b border-slate-800/80 px-4 sm:px-6 bg-gradient-to-b from-slate-900/40 to-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-950/30 text-blue-400 text-xs font-medium">
                <span>PanamáCompra (DGCP & ACP)</span>
                <span>•</span>
                <span>SECOP II</span>
                <span>•</span>
                <span>SICOP</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Gana licitaciones públicas sin que te descalifiquen por letra chica
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Monitoreo continuo de pliegos oficiales. Detección preventiva de requisitos excluyentes, plazos de subsanación y matrices de cumplimiento en Excel listas para cotizar.
              </p>
            </div>

            {/* Métrica Global */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0 text-left lg:text-right space-y-1 shadow-xl">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Presupuesto Oficial Monitoreado
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-sans font-normal">USD</span>
              </div>
              <div className="text-xs text-emerald-400 font-medium flex items-center lg:justify-end gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4 Convocatorias activas verificadas</span>
              </div>
            </div>
          </div>

          {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por objeto, entidad (MINSA, INVIAS, CCSS, ACP) o palabra clave (Presiona '/' para buscar)..."
                className="w-full h-12 pl-11 pr-24 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-blue-500 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
              />
              <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
                <kbd className="hidden sm:inline-block px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-mono text-slate-400">
                  /
                </kbd>
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white pointer-events-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Píldoras de País y Ordenamiento */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setCountryFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg border transition font-medium ${
                    countryFilter === "ALL"
                      ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  🌐 Todas las regiones
                </button>
                <button
                  onClick={() => setCountryFilter("PA")}
                  className={`px-3 py-1.5 rounded-lg border transition font-medium ${
                    countryFilter === "PA"
                      ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  🇵🇦 Panamá (DGCP & ACP)
                </button>
                <button
                  onClick={() => setCountryFilter("CO")}
                  className={`px-3 py-1.5 rounded-lg border transition font-medium ${
                    countryFilter === "CO"
                      ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  🇨🇴 Colombia (SECOP II)
                </button>
                <button
                  onClick={() => setCountryFilter("CR")}
                  className={`px-3 py-1.5 rounded-lg border transition font-medium ${
                    countryFilter === "CR"
                      ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  🇨🇷 Costa Rica (SICOP)
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setSortBy(sortBy === "BUDGET" ? "DEFAULT" : "BUDGET")}
                  className={`px-3 py-1.5 rounded-lg border transition text-xs font-medium ${
                    sortBy === "BUDGET"
                      ? "border-blue-500 bg-blue-950/40 text-blue-400"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {sortBy === "BUDGET" ? "✓ Mayor Presupuesto" : "Ordenar por Monto"}
                </button>
                <button
                  onClick={() => setSortBy(sortBy === "DEADLINE" ? "DEFAULT" : "DEADLINE")}
                  className={`px-3 py-1.5 rounded-lg border transition text-xs font-medium ${
                    sortBy === "DEADLINE"
                      ? "border-amber-500 bg-amber-950/40 text-amber-400"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {sortBy === "DEADLINE" ? "✓ Cierre Próximo" : "Cierre Inminente"}
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. LISTA DE LICITACIONES VERIFICADAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Convocatorias Abiertas</span>
            <span className="px-2 py-0.5 rounded-full border border-slate-800 bg-slate-900 text-slate-200 font-mono font-medium">
              {filtered.length} disponibles
            </span>
          </div>

          <span className="text-slate-500 text-xs hidden sm:block">
            Datos actualizados directamente de portales oficiales de compras
          </span>
        </div>

        {/* Filas de Licitaciones */}
        <div className="space-y-3.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-slate-800/90 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-sm"
            >
              
              {/* Información Principal */}
              <div className="space-y-2.5 flex-grow">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  
                  {/* Badge de Estado */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px] border ${
                    item.adenda 
                      ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                      : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.adenda ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></span>
                    <span>{item.adenda ? "Adenda Publicada" : "Abierta"}</span>
                  </span>

                  {/* País */}
                  <span className="px-2.5 py-0.5 rounded-md border border-slate-800 bg-slate-800/80 font-semibold text-[11px] text-slate-200">
                    {item.pais === "PA" ? "🇵🇦 Panamá" : item.pais === "CO" ? "🇨🇴 Colombia" : "🇨🇷 Costa Rica"}
                  </span>

                  {/* Código con Copiar */}
                  <button
                    onClick={() => copyToClipboard(item.codigo, "Código oficial")}
                    title="Click para copiar código de licitación"
                    className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition font-mono text-[11px]"
                  >
                    <span>{item.codigo}</span>
                    <Copy className="w-3 h-3 ml-1" />
                  </button>

                  {/* Contador de Horas */}
                  <span className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cierre: {item.cierre} ({item.horasRestantes}h restantes)</span>
                  </span>
                </div>

                {/* Título */}
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition leading-snug">
                  {item.titulo}
                </h3>

                {/* Entidad y Categoría */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-300">{item.entidad}</span>
                  <span>•</span>
                  <span className="text-slate-400">{item.categoria}</span>
                </div>
              </div>

              {/* Columna Derecha: Monto y Acciones */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                
                {/* Monto */}
                <div className="text-left lg:text-right">
                  <div className="text-xl font-bold font-mono text-white">
                    ${item.montoUSD.toLocaleString("en-US")} <span className="text-xs font-sans font-normal text-slate-400">USD</span>
                  </div>
                  {item.monedaOriginal !== "USD" && (
                    <div className="text-[11px] font-mono text-slate-500">
                      {item.montoOriginal.toLocaleString()} {item.monedaOriginal}
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAuditTender(item)}
                    className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ver Requisitos</span>
                  </button>

                  <button
                    onClick={() => {
                      setCheckoutProduct("TEMPLATE");
                      setCheckoutTender(item);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition active:scale-[0.98]"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Matriz Excel (${item.precioPlantilla})</span>
                  </button>

                  <a
                    href={item.urlOficial}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir pliego en portal oficial"
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </div>

            </div>
          ))}
        </div>
      </main>

      {/* 5. MODAL DE AUDITORÍA Y CLÁUSULAS TRAMPA */}
      {auditTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0B0F17] border border-slate-800 max-w-xl w-full rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-4 h-4" /> Alertas de Admisibilidad y Cláusulas Críticas
                </span>
                <h3 className="text-base font-bold text-white leading-snug">
                  {auditTender.titulo}
                </h3>
                <span className="text-xs text-slate-400 mt-1 block">
                  {auditTender.entidad} · Código: <strong className="text-slate-300 font-mono">{auditTender.codigo}</strong>
                </span>
              </div>
              <button
                onClick={() => setAuditTender(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Listado de cláusulas */}
            <div className="space-y-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                Puntos de riesgo detectados en el pliego:
              </span>
              {auditTender.clausulasTrampa.map((c, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/20 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>

            {/* Acciones del Modal */}
            <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20tengo%20dudas%20con%20el%20pliego%20${encodeURIComponent(auditTender.codigo)}%20de%20${encodeURIComponent(auditTender.entidad)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-700 hover:border-emerald-500/50 bg-slate-900 text-slate-300 hover:text-emerald-400 text-xs font-medium flex items-center justify-center space-x-2 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Consultar por WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  const t = auditTender;
                  setAuditTender(null);
                  setCheckoutProduct("TEMPLATE");
                  setCheckoutTender(t);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
              >
                Descargar Matriz Excel (${auditTender.precioPlantilla})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE CHECKOUT DIRECTO (YAPPY / NEQUI / SINPE / WHATSAPP) */}
      {checkoutTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0B0F17] border border-slate-800 max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Entrega Inmediata · Soporte Incluido
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {checkoutProduct === "TEMPLATE" 
                    ? `Matriz de Cumplimiento (${checkoutTender.codigo})` 
                    : "Suscripción Plan Pro ($29/mes)"}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutTender(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Total a Pagar */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Monto total a transferir:</span>
                <span className="text-2xl font-bold font-mono text-white">
                  ${checkoutProduct === "TEMPLATE" ? checkoutTender.precioPlantilla : 29}.00 USD
                </span>
              </div>

              {/* Selector de Método de Pago */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Selecciona tu forma de pago local:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedWallet("YAPPY")}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                      selectedWallet === "YAPPY"
                        ? "border-blue-500 bg-blue-950/40 text-blue-300 shadow-sm"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    🇵🇦 Yappy
                  </button>
                  <button
                    onClick={() => setSelectedWallet("NEQUI")}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                      selectedWallet === "NEQUI"
                        ? "border-pink-500 bg-pink-950/40 text-pink-300 shadow-sm"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    🇨🇴 Nequi
                  </button>
                  <button
                    onClick={() => setSelectedWallet("SINPE")}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                      selectedWallet === "SINPE"
                        ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    🇨🇷 SINPE
                  </button>
                  <button
                    onClick={() => setSelectedWallet("CARD")}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                      selectedWallet === "CARD"
                        ? "border-purple-500 bg-purple-950/40 text-purple-300 shadow-sm"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    💳 Tarjeta
                  </button>
                </div>
              </div>

              {/* Instrucciones de Pago */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-2.5">
                {selectedWallet === "YAPPY" && (
                  <div>
                    <div className="text-slate-400 text-[11px]">Transferencia Yappy Comercial / Personal:</div>
                    <div className="flex items-center justify-between text-white font-bold mt-1.5 font-mono text-sm">
                      <span>{WHATSAPP_DISPLAY}</span>
                      <button
                        onClick={() => copyToClipboard("65787219", "Número Yappy")}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-sans text-white flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar Número
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">Beneficiario: Lici S.A. / Soporte Comercial</span>
                  </div>
                )}

                {selectedWallet === "NEQUI" && (
                  <div>
                    <div className="text-slate-400 text-[11px]">Transferencia Nequi / Bancolombia:</div>
                    <div className="flex items-center justify-between text-white font-bold mt-1.5 font-mono text-sm">
                      <span>Contacto directo por WhatsApp</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">Se genera código QR o link de pago Nequi al instante por chat.</span>
                  </div>
                )}

                {selectedWallet === "SINPE" && (
                  <div>
                    <div className="text-slate-400 text-[11px]">SINPE Móvil (Costa Rica):</div>
                    <div className="flex items-center justify-between text-white font-bold mt-1.5 font-mono text-sm">
                      <span>Solicitud directa por WhatsApp</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">Te compartimos el número SINPE verificado en el chat de confirmación.</span>
                  </div>
                )}

                {selectedWallet === "CARD" && (
                  <div>
                    <div className="text-slate-400 text-[11px]">Pago internacional con tarjeta de crédito/débito:</div>
                    <span className="text-[11px] text-slate-300 block mt-1">Generamos un link seguro de cobro (Stripe / Lemon Squeezy) enviado directo a tu WhatsApp.</span>
                  </div>
                )}
              </div>

              {/* Botón de Confirmación por WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20deseo%20adquirir%20la%20Matriz%20de%20Cumplimiento%20para%20la%20licitaci%C3%B3n%20${encodeURIComponent(checkoutTender.codigo)}%20(${checkoutTender.pais})%20por%20$${checkoutProduct === "TEMPLATE" ? checkoutTender.precioPlantilla : 29}%20USD%20mediante%20${selectedWallet}.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setCheckoutTender(null)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmar pedido por WhatsApp ({WHATSAPP_DISPLAY})</span>
              </a>

              <p className="text-[11px] text-center text-slate-500">
                Atención directa por analistas de pliegos · Envío del archivo Excel en menos de 5 minutos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. BOTÓN FLOTANTE PERMANENTE DE WHATSAPP BUSINESS */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20tengo%20una%20consulta%20sobre%20una%20licitaci%C3%B3n%20p%C3%BAblica.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <MessageCircle className="w-4 h-4" />
          <span>Atención al Cliente ({WHATSAPP_DISPLAY})</span>
        </a>
      </div>

      {/* 8. TOAST NOTIFICACIÓN */}
      {toast && (
        <div className="fixed bottom-20 right-6 z-50 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-mono shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-150">
          <span>{toast}</span>
        </div>
      )}

      {/* 9. FOOTER CORPORATIVO */}
      <footer className="border-t border-slate-800/80 bg-[#07090E] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Lici S.A.</span>
            <span>•</span>
            <span>Inteligencia de Contratación Pública en Panamá, Colombia y Costa Rica</span>
          </div>
          <div>
            WhatsApp Business: <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-slate-400 hover:text-emerald-400 font-mono transition">{WHATSAPP_DISPLAY}</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
