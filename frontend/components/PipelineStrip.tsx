"use client";

import { Upload, Brain, Cpu, MessageSquareText, ArrowRight } from "lucide-react";

const STAGES = [
  { icon: Upload, label: "Upload Imagery", detail: "JPG · PNG · GeoTIFF" },
  { icon: Brain, label: "Understand Query", detail: "Intent classification" },
  { icon: Cpu, label: "Run CV Pipeline", detail: "Segmentation · detection · change" },
  { icon: MessageSquareText, label: "Explain Result", detail: "Grounded, evidence-backed" },
];

export default function PipelineStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-0 md:flex md:items-stretch">
      {STAGES.map((s, i) => (
        <div key={s.label} className="flex items-center md:flex-1">
          <div className="flex-1 rounded-lg md:rounded-none md:first:rounded-l-lg md:last:rounded-r-lg border border-panel-border bg-panel/60 px-3 md:px-4 py-3 md:py-4 flex flex-col items-center text-center gap-1.5 transition-all duration-200 hover:border-signal/50 hover:bg-panel-raised hover:shadow-glow hover:-translate-y-0.5 cursor-default group">
            <div className="w-8 h-8 rounded-full bg-signal/10 border border-signal/30 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:border-signal/60">
              <s.icon className="w-4 h-4 text-signal" />
            </div>
            <div className="text-xs font-mono-ui text-ink tracking-wide">{s.label}</div>
            <div className="text-[10px] text-ink-muted">{s.detail}</div>
          </div>
          {i < STAGES.length - 1 && (
            <ArrowRight className="hidden md:block w-4 h-4 text-panel-border mx-1 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
