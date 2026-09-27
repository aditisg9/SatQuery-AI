"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Satellite,
  Menu,
  X,
  ScanSearch,
  BoxSelect,
  GitCompareArrows,
  Globe2,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Database,
  Cpu,
  BrainCircuit,
  MapPinned
} from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EE] text-[#172033] font-sans overflow-x-hidden selection:bg-[#315FA8]/20 selection:text-[#315FA8]">
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-[#D9D5CC]/60 ${
          isScrolled ? "shadow-sm bg-white/95 backdrop-blur-md border-[#D9D5CC]/80" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded border border-[#315FA8]/40 bg-[#315FA8]/10 group-hover:bg-[#315FA8]/20 transition-colors">
              <Satellite className="w-4 h-4 text-[#315FA8]" />
            </div>
            <div className="font-display leading-tight">
              <div className="text-sm font-semibold tracking-wide text-[#182438]">SatQuery</div>
              <div className="text-[10px] font-mono text-[#315FA8] tracking-[0.2em] uppercase">AI · GEOINT</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide text-[#59636E]">
            <a href="#product" className="hover:text-[#182438] transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-[#182438] transition-colors">How it works</a>
            <a href="#capabilities" className="hover:text-[#182438] transition-colors">Capabilities</a>
            <a href="#technology" className="hover:text-[#182438] transition-colors">Technology</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-[13px] font-medium text-[#59636E] hover:text-[#182438] transition-colors">
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-[#182438] text-white rounded-md text-[13px] font-medium hover:bg-[#243451] active:scale-[0.98] transition-all shadow-sm"
            >
              Try SatQuery
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-[#D9D5CC] text-[#59636E]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-[fadein_0.2s_ease-out]">
          <div className="px-6 h-16 flex items-center justify-between border-b border-[#D9D5CC]/80">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 rounded border border-[#315FA8]/40 bg-[#315FA8]/10">
                <Satellite className="w-4 h-4 text-[#315FA8]" />
              </div>
              <div className="font-display leading-tight">
                <div className="text-sm font-semibold tracking-wide text-[#182438]">SatQuery</div>
                <div className="text-[10px] font-mono text-[#315FA8] tracking-[0.2em] uppercase">AI · GEOINT</div>
              </div>
            </div>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-md text-[#59636E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col p-6 space-y-6 text-sm font-medium text-[#182438]">
            <a href="#product" onClick={() => setMobileMenuOpen(false)}>Product</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
            <a href="#technology" onClick={() => setMobileMenuOpen(false)}>Technology</a>
            <div className="pt-6 border-t border-[#D9D5CC]">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-full py-3 bg-[#182438] text-white rounded-md transition-colors"
              >
                Try SatQuery
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pt-16">
        {/* HERO SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-28 md:pb-32 flex flex-col md:flex-row items-center gap-12 md:gap-8">
          <div className="flex-1 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D9D5CC] bg-white text-[#7A838C] font-mono text-[10px] tracking-[0.2em] uppercase shadow-sm">
              <Globe2 className="w-3 h-3 text-[#315FA8]" /> Earth Observation · Geointelligence
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-[#182438] max-w-xl">
              Understand Earth from <span className="italic font-light">satellite data.</span>
            </h1>
            <p className="text-[#59636E] text-base md:text-lg max-w-md leading-relaxed">
              Ask questions about satellite imagery in plain language and get grounded answers powered by computer vision and geospatial analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-[#315FA8] text-white rounded-md text-[13px] font-medium hover:bg-[#3F70BC] active:scale-[0.98] transition-all shadow-sm w-full sm:w-auto text-center"
              >
                Try SatQuery
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 bg-white border border-[#D9D5CC] text-[#172033] rounded-md text-[13px] font-medium hover:bg-[#F5F3EE] active:scale-[0.98] transition-all w-full sm:w-auto text-center"
              >
                Explore how it works
              </a>
            </div>
          </div>
          <div className="flex-1 relative w-full aspect-square md:aspect-[4/3] max-w-lg mx-auto">
            {/* Visual Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Earth (bottom right) */}
              <div className="absolute -bottom-[20%] -right-[20%] w-[80%] aspect-square mix-blend-multiply opacity-90 animate-[spin_300s_linear_infinite]">
                <img
                  src="/hero_earth.jpg"
                  alt="Earth from space"
                  className="w-full h-full object-cover rounded-full"
                  style={{ maskImage: "radial-gradient(circle, black 68%, transparent 71%)", WebkitMaskImage: "radial-gradient(circle, black 68%, transparent 71%)" }}
                />
              </div>
              
              {/* Satellite (center floating) */}
              <div className="absolute top-[15%] left-[10%] w-[60%] mix-blend-multiply motion-safe:animate-[float_6s_ease-in-out_infinite]">
                <img src="/hero_sat.jpg" alt="Satellite in orbit" className="w-full h-auto object-contain" />
              </div>

              {/* Technical SVG overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500" fill="none">
                <circle cx="380" cy="380" r="280" stroke="#315FA8" strokeWidth="1" strokeDasharray="4 8" opacity="0.15" className="animate-[spin_100s_linear_infinite_reverse]" />
                <circle cx="380" cy="380" r="180" stroke="#315FA8" strokeWidth="1" strokeDasharray="2 6" opacity="0.2" className="animate-[spin_60s_linear_infinite]" />
                
                {/* Labels */}
                <g className="text-[#315FA8] opacity-80" style={{ transform: 'translate(100px, 120px)' }}>
                  <circle cx="0" cy="0" r="2" fill="currentColor" />
                  <polyline points="0,0 -20,-20 -60,-20" fill="none" stroke="currentColor" strokeWidth="1" />
                  <text x="-60" y="-24" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">SATELLITE ANALYSIS</text>
                </g>
                <g className="text-[#315FA8] opacity-80" style={{ transform: 'translate(320px, 320px)' }}>
                  <circle cx="0" cy="0" r="2" fill="currentColor" />
                  <polyline points="0,0 20,-20 80,-20" fill="none" stroke="currentColor" strokeWidth="1" />
                  <text x="85" y="-24" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">EARTH OBSERVATION</text>
                </g>
                <g className="text-[#182438] opacity-60" style={{ transform: 'translate(140px, 360px)' }}>
                  <circle cx="0" cy="0" r="2" fill="currentColor" />
                  <polyline points="0,0 -30,20 -80,20" fill="none" stroke="currentColor" strokeWidth="1" />
                  <text x="-80" y="32" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">GEOINTELLIGENCE</text>
                </g>
              </svg>
            </div>
          </div>
        </section>

        {/* CAPABILITY STRIP */}
        <section className="border-y border-[#D9D5CC]/80 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-center sm:justify-between items-center gap-6 sm:gap-4 text-[11px] font-mono tracking-widest text-[#59636E] uppercase">
            <span className="flex items-center gap-2"><Satellite className="w-3.5 h-3.5" /> SATELLITE IMAGERY</span>
            <span className="flex items-center gap-2 hidden sm:flex"><BoxSelect className="w-3.5 h-3.5" /> COMPUTER VISION</span>
            <span className="flex items-center gap-2"><MapPinned className="w-3.5 h-3.5" /> GEOSPATIAL ANALYSIS</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> GROUNDED ANSWERS</span>
          </div>
        </section>

        {/* PROBLEM / SOLUTION */}
        <section id="product" className="py-24 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#182438] leading-tight mb-6">
            Satellite imagery is powerful.<br />
            Understanding it shouldn't be difficult.
          </h2>
          <p className="text-[#59636E] text-lg leading-relaxed max-w-2xl mx-auto">
            Satellite data contains immense value, but extracting insights traditionally requires specialized remote-sensing, GIS, and computer-vision expertise. 
            <br /><br />
            <strong className="text-[#182438] font-semibold">With SatQuery, you can simply ask questions.</strong> Use natural language to investigate regions instead of manually navigating complex and disjointed analysis workflows.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-white border-y border-[#D9D5CC]/80">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-[10px] font-mono tracking-[0.2em] text-[#7A838C] uppercase mb-12 text-center">How It Works</h3>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start gap-12 md:gap-4">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-6 left-12 right-12 h-px bg-[#D9D5CC]/60" />
              
              {[
                { step: "01", title: "Upload imagery", desc: "Provide a GeoTIFF or search a location." },
                { step: "02", title: "Ask a question", desc: "Type what you want to know in plain English." },
                { step: "03", title: "Run the right analysis", desc: "SatQuery automatically routes to the best CV model." },
                { step: "04", title: "Get a grounded explanation", desc: "View the results backed by visual evidence." }
              ].map((item, idx) => (
                <div key={idx} className="relative z-10 flex flex-col md:items-center text-left md:text-center max-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-[#F5F3EE] border border-[#D9D5CC] flex items-center justify-center font-mono text-sm text-[#182438] mb-5 shadow-sm">
                    {item.step}
                  </div>
                  <h4 className="text-base font-semibold text-[#182438] mb-2">{item.title}</h4>
                  <p className="text-[13px] text-[#59636E] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Workflow Diagram */}
            <div className="mt-20 max-w-3xl mx-auto bg-[#F5F3EE] rounded-xl border border-[#D9D5CC] p-8 flex flex-col items-center overflow-x-auto">
              <div className="font-mono text-[11px] sm:text-xs tracking-wide text-[#59636E] flex flex-row items-center gap-3 sm:gap-4 min-w-max">
                <span className="px-3 py-1.5 bg-white border border-[#D9D5CC] rounded shadow-sm text-[#182438]">Satellite Image</span>
                <ChevronRight className="w-4 h-4 text-[#7A838C]" />
                <span className="px-3 py-1.5 bg-white border border-[#D9D5CC] rounded shadow-sm text-[#182438]">Query</span>
                <ChevronRight className="w-4 h-4 text-[#7A838C]" />
                <span className="px-3 py-1.5 bg-[#315FA8] border border-[#315FA8] rounded shadow-sm text-white font-semibold">Analysis Pipeline</span>
                <ChevronRight className="w-4 h-4 text-[#7A838C]" />
                <span className="px-3 py-1.5 bg-white border border-[#D9D5CC] rounded shadow-sm text-[#182438]">Result</span>
                <ChevronRight className="w-4 h-4 text-[#7A838C]" />
                <span className="px-3 py-1.5 bg-white border border-[#D9D5CC] rounded shadow-sm text-[#182438]">Explanation</span>
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section id="capabilities" className="py-24 max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-semibold text-[#182438] mb-12">Built for satellite intelligence.</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BoxSelect, title: "Image Segmentation", desc: "Identify regions such as vegetation, water, soil and built-up areas automatically." },
              { icon: ScanSearch, title: "Object Detection", desc: "Detect relevant objects and distinct features within the satellite imagery." },
              { icon: GitCompareArrows, title: "Change Detection", desc: "Compare before and after imagery to identify meaningful infrastructural or environmental changes." },
              { icon: MapPinned, title: "Geospatial Analysis", desc: "Work with geographic coordinate reference systems, real-world area, and embedded GeoTIFF metadata." },
              { icon: MessageSquare, title: "Natural Language Queries", desc: "Ask complex spatial questions without needing to manually configure every step of an analysis workflow." },
              { icon: ShieldCheck, title: "Grounded Explanations", desc: "Receive transparent answers where the language model uses explicit analysis outputs as the basis for its explanation." }
            ].map((cap, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-[#D9D5CC] shadow-sm hover:border-[#315FA8]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#F5F3EE] border border-[#D9D5CC] flex items-center justify-center mb-5">
                  <cap.icon className="w-5 h-5 text-[#315FA8]" />
                </div>
                <h4 className="text-base font-semibold text-[#182438] mb-2">{cap.title}</h4>
                <p className="text-[13px] text-[#59636E] leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE DEMO (Visual representation) */}
        <section className="py-24 bg-[#182438] text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 w-full max-w-lg relative">
              <div className="aspect-square bg-[#0c1421] rounded-xl border border-[#243451] shadow-2xl p-2 relative overflow-hidden">
                <img src="/hero_sat.jpg" alt="Example interface" className="w-full h-full object-cover rounded-lg opacity-80 mix-blend-screen" />
                {/* Fake segmentation mask over it */}
                <div className="absolute inset-2 rounded-lg bg-[#5E8C61]/30 mix-blend-overlay border-t-2 border-r-2 border-[#5E8C61]/80 shadow-[inset_0_0_20px_rgba(94,140,97,0.5)]" style={{ clipPath: "polygon(20% 0%, 100% 0, 100% 80%, 60% 100%, 0 70%, 0 20%)" }}></div>
                <div className="absolute bottom-4 left-4 right-4 bg-[#182438]/90 backdrop-blur border border-[#243451] rounded-lg p-3">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="w-2 h-2 rounded-full bg-[#5E8C61]"></span>
                     <span className="text-xs font-mono tracking-wide">VEGETATION (42.5%)</span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-8">
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-[#7A838C] uppercase">Interactive Pipeline</h3>
              
              <div className="space-y-4">
                <div className="bg-[#243451]/50 border border-[#243451] rounded-lg p-4">
                  <div className="text-[11px] font-mono text-[#7A838C] mb-2 uppercase">Natural Language Query</div>
                  <div className="text-lg">"Where is the vegetation concentrated in this scene?"</div>
                </div>
                
                <div className="flex justify-center py-2">
                  <div className="w-px h-8 bg-[#315FA8]"></div>
                </div>
                
                <div className="bg-[#0c1421] border border-[#243451] rounded-lg p-5 relative">
                  <div className="absolute top-0 right-0 px-2 py-1 bg-[#315FA8]/20 text-[#315FA8] border-b border-l border-[#243451] rounded-bl-lg text-[10px] font-mono uppercase">
                    Result Example
                  </div>
                  <div className="flex items-start gap-3 mb-2 pt-2">
                    <ShieldCheck className="w-5 h-5 text-[#5E8C61] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Grounded Analysis</h4>
                      <p className="text-sm text-[#7A838C] leading-relaxed">
                        The computer vision pipeline detected vegetation covering <strong>42.5%</strong> of the total area. It is heavily concentrated in the northern and eastern regions, forming dense contiguous clusters along the topology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY / ARCHITECTURE */}
        <section id="technology" className="py-24 max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-semibold text-[#182438] mb-16">From pixels to explanations.</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 font-mono text-[11px] tracking-wide text-[#182438]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#D9D5CC] flex items-center justify-center mb-3 shadow-sm">
                <Database className="w-5 h-5 text-[#59636E]" />
              </div>
              <span>Imagery</span>
            </div>
            <div className="hidden md:flex items-center justify-center px-4">
              <ChevronRight className="w-5 h-5 text-[#D9D5CC]" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#D9D5CC] flex items-center justify-center mb-3 shadow-sm">
                <Cpu className="w-5 h-5 text-[#315FA8]" />
              </div>
              <span>Preprocessing</span>
            </div>
            <div className="hidden md:flex items-center justify-center px-4">
              <ChevronRight className="w-5 h-5 text-[#D9D5CC]" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#D9D5CC] flex items-center justify-center mb-3 shadow-sm">
                <BrainCircuit className="w-5 h-5 text-[#315FA8]" />
              </div>
              <span>Vision Models</span>
            </div>
            <div className="hidden md:flex items-center justify-center px-4">
              <ChevronRight className="w-5 h-5 text-[#D9D5CC]" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-[#315FA8] border border-[#315FA8] flex items-center justify-center mb-3 shadow-sm">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#315FA8] font-semibold">Explanation</span>
            </div>
          </div>
        </section>

        {/* WHY SATQUERY */}
        <section className="py-24 bg-white border-y border-[#D9D5CC]/80">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
            <div>
              <h4 className="text-lg font-semibold text-[#182438] mb-3">Grounded</h4>
              <p className="text-[13px] text-[#59636E] leading-relaxed">
                Answers are strictly tied to deterministic analysis results, ensuring the LLM does not hallucinate statistics or spatial relationships.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#182438] mb-3">Explainable</h4>
              <p className="text-[13px] text-[#59636E] leading-relaxed">
                Users can review the actual segmentation masks, bounding boxes, and metadata used to derive the generated explanation.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#182438] mb-3">Geospatial</h4>
              <p className="text-[13px] text-[#59636E] leading-relaxed">
                The system inherently understands geographic coordinate systems, bounding boxes, and real-world areas when working with GeoTIFFs.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#182438] mb-6">Ask your satellite imagery a question.</h2>
          <p className="text-[#59636E] text-base md:text-lg mb-10 max-w-lg mx-auto">
            Upload an image, ask a question, and explore what the data can reveal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-[#182438] text-white rounded-md text-sm font-medium hover:bg-[#243451] active:scale-[0.98] transition-all shadow-sm w-full sm:w-auto"
            >
              Try SatQuery
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white border border-[#D9D5CC] text-[#182438] rounded-md text-sm font-medium hover:bg-[#F5F3EE] active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              View dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#D9D5CC]/80 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-6 h-6 rounded border border-[#D9D5CC] bg-[#F5F3EE]">
              <Satellite className="w-3 h-3 text-[#182438]" />
            </div>
            <div className="font-display leading-tight">
              <div className="text-xs font-semibold tracking-wide text-[#182438]">SatQuery AI</div>
              <div className="text-[9px] font-mono text-[#59636E] tracking-[0.2em] uppercase">AI · GEOINT</div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-[#59636E]">
            <a href="#product" className="hover:text-[#182438]">Product</a>
            <a href="#how-it-works" className="hover:text-[#182438]">How it works</a>
            <a href="#capabilities" className="hover:text-[#182438]">Capabilities</a>
            <a href="#technology" className="hover:text-[#182438]">Technology</a>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-[#59636E]">
            <Link href="/dashboard" className="hover:text-[#182438]">Dashboard</Link>
            <Link href="/dashboard" className="hover:text-[#182438]">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
