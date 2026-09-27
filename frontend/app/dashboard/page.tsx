"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ScanSearch,
  GitCompareArrows,
  ArrowRight,
  Layers,
  Satellite,
  ShieldCheck,
  MapPinned,
} from "lucide-react";
import Shell from "@/components/Shell";
import UploadPanel from "@/components/UploadPanel";
import LocationSearchPanel from "@/components/LocationSearchPanel";
import PipelineStrip from "@/components/PipelineStrip";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ImageOut, SessionOut } from "@/lib/types";

const EXAMPLE_QUERIES = [
  "What is present in this image?",
  "How much agricultural land is visible?",
  "Identify the water bodies.",
  "Find buildings in this image.",
  "Where is vegetation concentrated?",
];

const CAPABILITIES = [
  { icon: Layers, label: "4 CV Pipelines", detail: "Segmentation, detection, warning, geospatial" },
  { icon: MapPinned, label: "GeoTIFF Ready", detail: "Real-world area when georeferenced" },
  { icon: ShieldCheck, label: "Grounded Answers", detail: "LLM explains, never invents stats" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionOut[]>([]);
  const [uploadFlash, setUploadFlash] = useState(false);
  const [sourceTab, setSourceTab] = useState<"upload" | "search">("upload");
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.listSessions().then(setSessions).catch(() => { });
  }, []);

  const handleUploaded = async (img: ImageOut) => {
    const session = await api.createSession({ mode: "single", image_id: img.id });
    router.push(`/analyze?session=${session.id}`);
  };

  const jumpToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setUploadFlash(true);
    setTimeout(() => setUploadFlash(false), 1200);
  };

  return (
    <Shell title="Dashboard" subtitle="Vision-language assistant for satellite imagery">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8 md:space-y-10">
        {/* Hero / thesis */}
        {/* Hero / thesis */}
        <section className="relative overflow-hidden rounded-xl border border-panel-border bg-panel shadow-panel flex flex-col md:flex-row items-stretch">
          <div className="absolute inset-0 bg-grid-surface opacity-40 pointer-events-none" />

          {/* Left Text Content */}
          <div className="relative p-6 md:p-12 md:pr-6 md:w-[55%] z-10 flex flex-col justify-center">
            <button
              onClick={jumpToUpload}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono-ui text-[11px] tracking-wider mb-5 transition-all hover:border-primary hover:bg-primary/20 hover:shadow-sm active:scale-95 active:border-primary cursor-pointer w-fit"
            >
              <Satellite className="w-3 h-3" /> IMAGE + QUESTION → EXPLAINABLE ANALYSIS
            </button>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink max-w-xl leading-[1.1]">
              Upload satellite imagery.
              <br />
              Ask it questions in plain <span className="italic">language.</span>
            </h2>
            <p className="text-ink-muted mt-4 max-w-lg text-sm md:text-base leading-relaxed">
              SatQuery AI routes your question to segmentation, detection, warning-detection and
              geospatial pipelines — the language model explains results, it never invents them.
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={jumpToUpload}
                className="text-[11px] font-mono-ui px-2.5 py-1.5 rounded-md border border-panel-border text-ink-muted bg-void/30 hover:border-primary/50 hover:text-primary hover:bg-primary/10 hover:shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Upload an image to try this question"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
      </div>

      {/* Right Visual Container */}
      <div className="relative w-full md:w-[50%] h-64 md:h-auto min-h-[400px] flex items-center justify-center overflow-hidden shrink-0">
        {/* Gradient mask to blend the panel into the visual */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-panel to-transparent z-40 pointer-events-none" />

        {/* The Earth (Rotating on axis) */}
        <div className="absolute -bottom-[45%] -right-[25%] w-[110%] aspect-square mix-blend-multiply motion-safe:animate-[spin_200s_linear_infinite] z-0">
          <img
            src="/hero_earth.jpg"
            alt="Earth"
            className="w-full h-full object-cover rounded-full"
            style={{
              maskImage: "radial-gradient(circle, black 68%, transparent 71%)",
              WebkitMaskImage: "radial-gradient(circle, black 68%, transparent 71%)"
            }}
          />
        </div>

        {/* Orbital SVG Decorations */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 500 500" fill="none">
          {/* Dashed orbit lines */}
          <circle cx="350" cy="350" r="220" stroke="#315FA8" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" className="animate-[spin_60s_linear_infinite]" />
          <circle cx="350" cy="350" r="160" stroke="#315FA8" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" className="animate-[spin_40s_linear_infinite_reverse]" />

          {/* Labels & Pointers */}
          {/* Satellite Pointer - Anchored top right, pointing to satellite body */}
          <g className="text-[#315FA8] opacity-80" style={{ transform: 'translate(220px, 80px)' }}>
            <circle cx="0" cy="0" r="2.5" fill="currentColor" />
            <polyline points="0,0 20,-20 60,-20" fill="none" stroke="currentColor" strokeWidth="1" />
            <text x="65" y="-24" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">SATELLITE</text>
            <text x="65" y="-12" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">ANALYSIS</text>
          </g>

          {/* Earth Pointer - Anchored top of earth, pointing at earth surface */}
          <g className="text-[#315FA8] opacity-80" style={{ transform: 'translate(330px, 260px)' }}>
            <circle cx="0" cy="0" r="2.5" fill="currentColor" />
            <polyline points="0,0 30,-30 80,-30" fill="none" stroke="currentColor" strokeWidth="1" />
            <text x="85" y="-34" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">EARTH</text>
            <text x="85" y="-22" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">OBSERVATION</text>
          </g>

          {/* Geointelligence Pointer - Anchored left, pointing into the orbital space */}
          <g className="text-[#315FA8] opacity-80" style={{ transform: 'translate(100px, 280px)' }}>
            <circle cx="0" cy="0" r="2.5" fill="currentColor" />
            <polyline points="0,0 -20,30 -60,30" fill="none" stroke="currentColor" strokeWidth="1" />
            <text x="-60" y="42" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">GEOINTELLIGENCE</text>
          </g>
        </svg>

        {/* The Satellite Image (Floating) */}
        <div className="absolute top-[0%] left-[0%] w-[55%] mix-blend-multiply motion-safe:animate-float z-20">
          <img
            src="/hero_sat.jpg"
            alt="Satellite"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>

        {/* Capability tiles */ }
  <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {CAPABILITIES.map((c) => (
      <div
        key={c.label}
        className="rounded-lg border border-panel-border bg-panel p-4 flex items-center gap-3 transition-all duration-200 hover:border-primary/50 hover:bg-panel-raised hover:shadow-sm hover:-translate-y-0.5 cursor-default group"
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
          <c.icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-mono-ui text-ink">{c.label}</div>
          <div className="text-[11px] text-ink-muted truncate">{c.detail}</div>
        </div>
      </div>
    ))}
  </section>

  {/* Pipeline strip */ }
  <section>
    <h3 className="font-mono-ui text-xs tracking-[0.15em] text-ink-muted uppercase mb-3">
      How It Works
    </h3>
    <PipelineStrip />
  </section>

  {/* Entry points */ }
  <section ref={uploadSectionRef} className="grid md:grid-cols-2 gap-6">
    <div
      className={`rounded-xl border p-5 md:p-6 shadow-panel transition-all duration-500 ${uploadFlash
          ? "border-primary shadow-sm bg-primary/[0.06]"
          : "border-panel-border bg-panel"
        }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <ScanSearch className="w-4 h-4 text-primary" />
        <h3 className="font-mono-ui text-sm tracking-wide text-ink">Single-Image Analysis</h3>
      </div>
      <p className="text-xs text-ink-muted mb-3">
        Upload one scene and ask about land cover, water, vegetation, or built-up area.
      </p>

      <div className="flex gap-2 mb-3">
        {(["upload", "search"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSourceTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono-ui uppercase tracking-wide border active:scale-95 transition-all ${sourceTab === t
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-panel-border text-ink-muted hover:text-ink hover:bg-panel-raised"
              }`}
          >
            {t === "upload" ? "Upload File" : "Search Location"}
          </button>
        ))}
      </div>

      {sourceTab === "upload" ? (
        <UploadPanel label="Upload a satellite image" onUploaded={handleUploaded} compact />
      ) : (
        <LocationSearchPanel onFetched={handleUploaded} />
      )}
    </div>

    <div className="rounded-xl border border-panel-border bg-panel p-5 md:p-6 flex flex-col shadow-panel">
      <div className="flex items-center gap-2 mb-1">
        <GitCompareArrows className="w-4 h-4 text-warning" />
        <h3 className="font-mono-ui text-sm tracking-wide text-ink">Change Detection</h3>
      </div>
      <p className="text-xs text-ink-muted mb-4">
        Upload a before/after pair — e.g. 2020 vs 2026 — and ask what changed.
      </p>
      <button
        onClick={() => router.push("/compare")}
        className="mt-auto flex items-center justify-center gap-2 border border-panel-border rounded-lg py-4 text-sm font-mono-ui text-ink-muted hover:border-warning/40 hover:text-warning hover:shadow-sm-warning active:scale-[0.98] transition-all group"
      >
        Go to Compare workspace <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </section>

  {/* Recent sessions */ }
  {
    sessions.length > 0 && (
      <section>
        <h3 className="font-mono-ui text-xs tracking-[0.15em] text-ink-muted uppercase mb-3">
          Recent Sessions
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessions.slice(0, 6).map((s) => (
            <button
              key={s.id}
              onClick={() =>
                router.push(s.mode === "single" ? `/analyze?session=${s.id}` : `/compare?session=${s.id}`)
              }
              className="text-left rounded-lg border border-panel-border bg-panel p-4 hover:border-primary/40 hover:bg-panel-raised active:scale-[0.98] transition-all"
            >
              <div className="text-sm text-ink truncate">{s.title}</div>
              <div className="text-[10px] font-mono-ui text-ink-muted mt-1 uppercase tracking-wide">
                {s.mode === "single" ? "Single image" : "change detection"} ·{" "}
                {new Date(s.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </section>
    )
  }
      </div >
    </Shell >
  );
}
