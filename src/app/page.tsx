"use client";

import React, { useState, useEffect } from "react";

export default function AuralisHomePage() {
  const [activeTab, setActiveTab] = useState<"studio" | "agents" | "api">("studio");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("AI Voice Generator");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Dynamic audio spectral visualizer heights
  const [spectrumHeights, setSpectrumHeights] = useState<number[]>([
    25, 40, 65, 55, 85, 95, 70, 45, 60, 30, 50, 20, 35, 15,
  ]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSpectrumHeights((prev) =>
        prev.map((h) => {
          const delta = (Math.random() - 0.5) * 30;
          return Math.min(100, Math.max(15, Math.round(h + delta)));
        })
      );
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const marqueeLogos = [
    { icon: "bolt", name: "Velocity" },
    { icon: "deployed_code", name: "Nexus" },
    { icon: "auto_awesome", name: "Lumina" },
    { icon: "layers", name: "Stack" },
    { icon: "token", name: "Quanta" },
    { icon: "hub", name: "Orbital" },
    { icon: "data_exploration", name: "Scalar" },
  ];

  return (
    <div className="antialiased min-h-screen flex flex-col font-sans text-body-md overflow-x-hidden bg-[#F7F7F5] text-[#111111]">
      {/* ==================== TOP NAVIGATION ==================== */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/60 bg-[#F7F7F5]/80 backdrop-blur-md transition-all">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 flex justify-between items-center h-[72px]">
          <div className="flex items-center gap-10 lg:gap-12">
            <a
              href="#"
              className="text-[22px] font-bold tracking-tighter text-zinc-900 transition-opacity hover:opacity-80"
            >
              Auralis
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium tracking-tight text-zinc-500">
              <a
                href="#studio"
                className="hover:text-zinc-900 transition-colors duration-200"
              >
                Auralis Studio
              </a>
              <a
                href="#agents"
                className="hover:text-zinc-900 transition-colors duration-200"
              >
                Auralis Agents
              </a>
              <a
                href="#api"
                className="hover:text-zinc-900 transition-colors duration-200"
              >
                Auralis API
              </a>
              <a
                href="#resources"
                className="hover:text-zinc-900 transition-colors duration-200"
              >
                Resources
              </a>
              <a
                href="#enterprise"
                className="hover:text-zinc-900 transition-colors duration-200"
              >
                Enterprise
              </a>
              <a
                href="#pricing"
                className="hover:text-zinc-900 transition-colors duration-200"
              >
                Pricing
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#signup"
              className="hidden sm:inline-flex bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-zinc-800 active:scale-95 shadow-sm"
            >
              Sign up
            </a>
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-700 hover:text-black focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 bg-[#F7F7F5] px-6 py-4 flex flex-col gap-3">
            <a
              href="#studio"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 py-1"
            >
              Auralis Studio
            </a>
            <a
              href="#agents"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 py-1"
            >
              Auralis Agents
            </a>
            <a
              href="#api"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 py-1"
            >
              Auralis API
            </a>
            <a
              href="#resources"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 py-1"
            >
              Resources
            </a>
            <a
              href="#enterprise"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 py-1"
            >
              Enterprise
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 py-1"
            >
              Pricing
            </a>
            <a
              href="#signup"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-black text-white text-center py-2.5 rounded-full text-sm font-medium mt-2"
            >
              Sign up
            </a>
          </div>
        )}
      </nav>

      {/* ==================== MAIN CANVAS ==================== */}
      <main className="flex-grow pt-[140px] pb-12">
        {/* ==================== HERO SECTION ==================== */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8 mb-[120px] lg:mb-[140px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-8">
              <h1 className="text-5xl sm:text-7xl lg:text-[84px] font-semibold text-black tracking-[-0.04em] leading-[0.98]">
                Making digital experiences sound human
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <a
                  href="#signup"
                  className="bg-black text-white px-7 py-3.5 rounded-full font-medium transition-all hover:bg-zinc-800 active:scale-95 shadow-sm"
                >
                  Sign up
                </a>
                <a
                  href="#sales"
                  className="bg-transparent border border-zinc-400 text-black px-7 py-3.5 rounded-full font-medium transition-all hover:bg-zinc-200 active:scale-95"
                >
                  Contact sales
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9 flex justify-start lg:justify-end">
              <p className="text-base sm:text-lg text-secondary-auralis max-w-sm text-left pt-2 lg:pt-4 leading-relaxed">
                Enterprise AI voice infrastructure engineered for ultra-low latency,
                hyper-realistic voice generation, and autonomous agents that listen, reason, and act.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== HERO PRODUCT PANEL (CONSOLE) ==================== */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8 mb-[140px] lg:mb-[180px]">
          <div className="bg-panel-auralis rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden border border-border-auralis min-h-[580px] sm:min-h-[620px] justify-between shadow-sm">
            {/* Top Tabs Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 z-10">
              <div className="flex bg-[#f7f3f2] p-1 rounded-full border border-border-auralis shadow-sm">
                <button
                  onClick={() => setActiveTab("studio")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "studio"
                      ? "bg-white text-black shadow-sm"
                      : "text-secondary-auralis hover:text-black"
                  }`}
                >
                  Auralis Studio
                </button>
                <button
                  onClick={() => setActiveTab("agents")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "agents"
                      ? "bg-white text-black shadow-sm"
                      : "text-secondary-auralis hover:text-black"
                  }`}
                >
                  Auralis Agents
                </button>
                <button
                  onClick={() => setActiveTab("api")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "api"
                      ? "bg-white text-black shadow-sm"
                      : "text-secondary-auralis hover:text-black"
                  }`}
                >
                  Auralis API
                </button>
              </div>

              <div className="bg-[#f7f3f2] px-4 py-2 rounded-full border border-border-auralis flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-medium text-zinc-800">
                  {activeTab === "studio"
                    ? "AI Voice Generator"
                    : activeTab === "agents"
                    ? "Conversational Engine"
                    : "Low-Latency WebSocket API"}
                </span>
              </div>
            </div>

            {/* Center Glowing Orbs (Simulated with CSS gradients) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90 overflow-hidden">
              <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 blur-3xl absolute -ml-40 animate-pulse transition-opacity duration-1000"></div>
              <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 blur-3xl absolute opacity-70"></div>
              <div className="w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 blur-3xl absolute ml-40 mt-20 opacity-80"></div>
              <div className="w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 blur-3xl absolute ml-80 -mt-20 opacity-75"></div>
            </div>

            {/* Play Button Center Console */}
            <div className="z-10 self-center my-auto flex flex-col items-center gap-4 py-16">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border border-border-auralis transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                <span className="material-symbols-outlined text-4xl text-black pl-0.5 group-hover:text-emerald-600 transition-colors">
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest bg-white/70 px-3 py-1 rounded-full border border-zinc-200">
                {isPlaying ? "Live Synthesis Stream" : "Stream Paused"}
              </div>
            </div>

            {/* Bottom Bar Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-border-auralis">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  "AI Voice Generator",
                  "Text to Speech",
                  "Music",
                  "Sound Effects",
                  "Voice Cloning",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm font-medium whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? "text-black border-b-2 border-black pb-0.5"
                        : "text-secondary-auralis hover:text-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <a
                href="#signup"
                className="w-full sm:w-auto text-center bg-black text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-zinc-800 transition-colors"
              >
                Sign up
              </a>
            </div>
          </div>
        </section>

        {/* ==================== TRUST STRIP ==================== */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8 text-center mb-10">
          <h3 className="font-label-caps text-label-caps text-secondary-auralis uppercase tracking-widest">
            Trusted by teams building modern audio experiences
          </h3>
        </section>

        {/* ==================== LOGO MARQUEE TICKER ==================== */}
        <section className="w-full overflow-hidden mb-[120px] lg:mb-[140px] py-4 border-y border-zinc-200/50">
          <div className="flex whitespace-nowrap overflow-hidden group">
            {/* First Set */}
            <div className="flex items-center gap-24 animate-marquee group-hover:pause-marquee min-w-full">
              {marqueeLogos.map((logo, idx) => (
                <div
                  key={`marquee-1-${idx}`}
                  className="flex items-center gap-2.5 text-zinc-400 hover:text-zinc-700 transition-colors font-bold text-xl uppercase tracking-tighter italic select-none"
                >
                  <span className="material-symbols-outlined text-3xl">
                    {logo.icon}
                  </span>
                  {logo.name}
                </div>
              ))}
            </div>

            {/* Second Duplicate Set for Continuous Loop */}
            <div
              aria-hidden="true"
              className="flex items-center gap-24 animate-marquee group-hover:pause-marquee min-w-full"
            >
              {marqueeLogos.map((logo, idx) => (
                <div
                  key={`marquee-2-${idx}`}
                  className="flex items-center gap-2.5 text-zinc-400 hover:text-zinc-700 transition-colors font-bold text-xl uppercase tracking-tighter italic select-none"
                >
                  <span className="material-symbols-outlined text-3xl">
                    {logo.icon}
                  </span>
                  {logo.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== PLATFORM OVERVIEW (BENTO GRID) ==================== */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8 mb-[140px] lg:mb-[180px]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold text-black tracking-[-0.03em] mb-6 leading-tight">
              Two systems, one shared intelligence layer
            </h2>
            <p className="text-base sm:text-lg text-secondary-auralis leading-relaxed">
              Combine studio-grade creative tools with autonomous voice agent orchestration on a unified neural backbone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Large Card 1 */}
            <div className="bg-card-auralis rounded-2xl p-6 border border-border-auralis h-[300px] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 to-purple-600/25 opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="flex justify-between items-start z-10">
                <span className="material-symbols-outlined text-zinc-700 text-2xl">
                  edit_document
                </span>
                <span className="text-xs font-mono uppercase bg-white/70 px-2.5 py-1 rounded-md border border-zinc-200">
                  Studio v2
                </span>
              </div>
              <div className="z-10">
                <h4 className="text-xl font-semibold mb-2 text-black">
                  Soft Editor UI
                </h4>
                <p className="text-sm text-secondary-auralis leading-relaxed">
                  Intuitive timeline manipulation, granular pitch control, and multi-track spatial rendering in real time.
                </p>
              </div>
            </div>

            {/* Large Card 2 */}
            <div className="bg-card-auralis rounded-2xl p-6 border border-border-auralis h-[300px] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/15 to-teal-600/25 opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="flex justify-between items-start z-10">
                <span className="material-symbols-outlined text-zinc-700 text-2xl">
                  closed_caption
                </span>
                <span className="text-xs font-mono uppercase bg-white/70 px-2.5 py-1 rounded-md border border-zinc-200">
                  Whisper v4
                </span>
              </div>
              <div className="z-10">
                <h4 className="text-xl font-semibold mb-2 text-black">
                  Transcript Panel
                </h4>
                <p className="text-sm text-secondary-auralis leading-relaxed">
                  Instant bi-directional phonetic translation, speaker diarization, and context-aware punctuation synchronization.
                </p>
              </div>
            </div>
          </div>

          {/* Full-width 16:9 Showcase Widget with Live Spectral UI */}
          <div className="w-full aspect-[16/10] sm:aspect-[16/9] bg-panel-auralis rounded-3xl border border-border-auralis flex items-center justify-center overflow-hidden relative group shadow-sm">
            {/* Background Studio Graphic */}
            <img
              alt="Dashboard Preview"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-700"
              src="https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=1400&auto=format&fit=crop"
            />

            <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
              {/* Glowing Accent Ambient Lights */}
              <div className="absolute w-72 h-72 bg-blue-500/25 rounded-full blur-[90px] -translate-x-24 -translate-y-12 pointer-events-none"></div>
              <div className="absolute w-72 h-72 bg-purple-500/25 rounded-full blur-[90px] translate-x-24 translate-y-12 pointer-events-none"></div>

              {/* Glassmorphic Floating Widget Card */}
              <div className="relative w-full max-w-[460px] bg-white/35 backdrop-blur-3xl border border-white/50 rounded-[2rem] p-6 sm:p-8 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.5)] flex flex-col gap-6 sm:gap-7">
                {/* Header: Identifier & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-black/60 mb-0.5">
                      Neural Engine v4.2 PRO
                    </span>
                    <span className="text-sm font-semibold text-black tracking-tight">
                      Real-time Synthesis Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                      Studio Mode
                    </span>
                  </div>
                </div>

                {/* Spectral Equalizer Audio Visualizer */}
                <div className="flex items-end justify-between h-20 sm:h-24 gap-1 sm:gap-1.5 px-2">
                  {spectrumHeights.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-full transition-all duration-200 ${
                        i >= 4 && i <= 6
                          ? "bg-gradient-to-t from-purple-500/60 to-purple-600"
                          : "bg-gradient-to-t from-blue-500/50 to-blue-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 py-2 border-y border-black/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-secondary-auralis font-semibold">
                      Latency
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-black">24</span>
                      <span className="text-xs text-secondary-auralis font-medium">
                        ms
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-secondary-auralis font-semibold">
                      Confidence
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-black">99.8</span>
                      <span className="text-xs text-secondary-auralis font-medium">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-secondary-auralis font-semibold">
                      Stability
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-black">0.02</span>
                      <span className="text-xs text-secondary-auralis font-medium">
                        jitter
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Player Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => setSpectrumHeights((p) => p.map((h) => Math.max(15, h - 10)))}
                      className="material-symbols-outlined text-2xl text-black/60 hover:text-black transition-colors"
                      aria-label="Previous track"
                    >
                      skip_previous
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      <span className="material-symbols-outlined fill text-2xl text-white">
                        {isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <button
                      onClick={() => setSpectrumHeights((p) => p.map((h) => Math.min(100, h + 10)))}
                      className="material-symbols-outlined text-2xl text-black/60 hover:text-black transition-colors"
                      aria-label="Next track"
                    >
                      skip_next
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[12px] font-mono font-bold text-black bg-white/60 px-3 py-1 rounded-lg border border-white/70 shadow-sm">
                      00:42.12
                    </span>
                    <span className="text-[9px] font-bold text-secondary-auralis/70 uppercase tracking-tighter">
                      Total Length 04:20
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== AURALIS STUDIO MODULE ==================== */}
        <section id="studio" className="max-w-[1280px] mx-auto px-6 sm:px-8 mb-[140px] lg:mb-[180px]">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-label-caps text-label-caps bg-surface-variant text-black px-3.5 py-1.5 rounded-full border border-border-auralis">
              Auralis Studio
            </span>
            <div className="h-px bg-zinc-300 flex-grow opacity-60"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-5xl font-semibold text-black leading-tight tracking-[-0.03em]">
                Create, refine, &amp; scale audio in one place
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-base sm:text-lg text-secondary-auralis leading-relaxed">
                From voice prompts to rich cinematic soundscapes, fine-tune frequency responses, phonemes, and emotion curves with sub-millisecond precision.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Studio Card 1 */}
            <div className="bg-card-auralis rounded-2xl border border-border-auralis h-[320px] flex flex-col justify-end relative overflow-hidden group hover:shadow-md transition-shadow">
              <img
                alt="Audio Timeline UI"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1000&auto=format&fit=crop"
              />
              <div className="z-10 bg-black/40 backdrop-blur-xl border-t border-white/20 p-6 rounded-b-2xl text-white">
                <h4 className="text-xl font-semibold mb-1 text-white">
                  Soft Editor UI
                </h4>
                <p className="text-sm text-white/80">
                  Full DAW capabilities right inside your browser, backed by headless streaming APIs.
                </p>
              </div>
            </div>

            {/* Studio Card 2 */}
            <div className="bg-card-auralis rounded-2xl p-6 border border-border-auralis h-[320px] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-variant/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start z-10">
                <span className="material-symbols-outlined text-secondary-auralis text-2xl">
                  closed_caption
                </span>
                <span className="text-xs font-mono uppercase bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                  Realtime Sync
                </span>
              </div>
              <div className="z-10">
                <h4 className="text-xl font-semibold mb-2 text-black">
                  Transcript Panel
                </h4>
                <p className="text-sm text-secondary-auralis leading-relaxed">
                  Edit audio by simply editing text. Deletions, cadence modifications, and voice tone shift instantaneously.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Small Action Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "music_note", label: "Music" },
              { icon: "graphic_eq", label: "SFX" },
              { icon: "record_voice_over", label: "Voices" },
              { icon: "movie", label: "Image & Video" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-panel-auralis rounded-xl p-5 border border-border-auralis flex flex-col gap-3 items-start hover:bg-surface-variant/70 transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-black text-2xl group-hover:text-emerald-600 transition-colors">
                  {item.icon}
                </span>
                <span className="font-medium text-sm text-zinc-900">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== AURALIS AGENTS MODULE ==================== */}
        <section id="agents" className="max-w-[1280px] mx-auto px-6 sm:px-8 mb-[140px] lg:mb-[160px]">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-label-caps text-label-caps bg-surface-variant text-black px-3.5 py-1.5 rounded-full border border-border-auralis">
              Auralis Agents
            </span>
            <div className="h-px bg-zinc-300 flex-grow opacity-60"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-5xl font-semibold text-black leading-tight tracking-[-0.03em]">
                Build agents that listen, respond, &amp; act
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-base sm:text-lg text-secondary-auralis leading-relaxed">
                Deploy autonomous conversational agents equipped with sub-second interruptibility, multi-turn reasoning, and seamless system integrations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Agent Card 1: Omnichannel Agents */}
            <div className="bg-card-auralis rounded-3xl p-6 sm:p-8 border border-border-auralis min-h-[460px] flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
              {/* Radiant Orbs */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                <div className="w-[220px] h-[220px] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 blur-2xl absolute -ml-20 -mt-20"></div>
                <div className="w-[220px] h-[220px] rounded-full bg-gradient-to-r from-purple-400 to-pink-300 blur-2xl absolute ml-20 mt-20"></div>
              </div>

              <div className="z-10 bg-white/80 backdrop-blur-sm self-start px-4 py-1.5 rounded-full border border-border-auralis text-sm font-medium mb-auto shadow-sm">
                Omnichannel agents
              </div>

              {/* Chat Simulation Component */}
              <div className="z-10 mt-auto bg-white/40 backdrop-blur-2xl p-5 sm:p-6 rounded-[2rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-sm">
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-white/70 backdrop-blur-md border border-white/60 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-zinc-900 shadow-sm">
                    Hello! How can I assist you today?
                  </div>
                </div>

                <div className="flex gap-3 items-center flex-row-reverse">
                  <div className="w-10 h-10 bg-white/70 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-black text-sm">
                      person
                    </span>
                  </div>
                  <div className="bg-black text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-md">
                    I need help checking my deployment status.
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Card 2: Analytics & Deep Insights */}
            <div className="bg-card-auralis rounded-3xl p-6 sm:p-8 border border-border-auralis min-h-[460px] flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
              {/* Abstract Chart Representation */}
              <div className="absolute inset-0 flex items-end justify-center pb-12 opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
                <div className="flex items-end gap-3 h-44 w-full px-8">
                  <div className="w-full bg-zinc-200 rounded-t-md h-[30%] transition-all duration-500 group-hover:h-[35%]"></div>
                  <div className="w-full bg-zinc-200 rounded-t-md h-[50%] transition-all duration-500 group-hover:h-[55%]"></div>
                  <div className="w-full bg-black/20 rounded-t-md h-[80%] relative transition-all duration-500 group-hover:h-[85%]">
                    <div className="absolute -top-3.5 -right-3.5 w-7 h-7 bg-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-t-md h-[60%] transition-all duration-500 group-hover:h-[65%]"></div>
                  <div className="w-full bg-zinc-200 rounded-t-md h-[40%] transition-all duration-500 group-hover:h-[45%]"></div>
                </div>
              </div>

              <div className="z-10 bg-white/80 backdrop-blur-sm self-start px-4 py-1.5 rounded-full border border-border-auralis text-sm font-medium mb-auto shadow-sm">
                Analytics
              </div>

              <div className="z-10 mt-auto bg-white/50 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                <h4 className="text-xl font-semibold mb-2 text-black">
                  Deep Insights
                </h4>
                <p className="text-sm text-secondary-auralis leading-relaxed">
                  Real-time sentiment scoring, interruption analytics, and automated transcript evaluation across every live call.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SIGN OFF SECTION (FINAL CTA) ==================== */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8 mb-[120px] lg:mb-[140px] text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-semibold text-black mb-8 max-w-3xl leading-tight tracking-[-0.03em]">
            The future of voice starts here
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href="#signup"
              className="bg-black text-white px-8 py-3.5 rounded-full font-medium transition-all hover:bg-zinc-800 active:scale-95 shadow-sm"
            >
              Get started
            </a>
            <a
              href="#sales"
              className="bg-transparent border border-zinc-400 text-black px-8 py-3.5 rounded-full font-medium transition-all hover:bg-zinc-200 active:scale-95"
            >
              Talk to sales
            </a>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="w-full border-t border-zinc-200 py-12 bg-transparent">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
            <span className="text-xl font-bold tracking-tighter text-zinc-900">
              Auralis
            </span>
            <span className="text-sm text-secondary-auralis">
              © 2024 Auralis AI. Engineered for precision.
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6">
            <a
              href="#"
              className="text-sm text-secondary-auralis hover:text-black transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-sm text-secondary-auralis hover:text-black transition-colors"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-sm text-secondary-auralis hover:text-black transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-secondary-auralis hover:text-black transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
