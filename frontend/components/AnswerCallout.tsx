"use client";

import { Sparkles, ShieldCheck } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

export default function AnswerCallout({ question, result }: { question: string; result: AnalysisResult }) {
  return (
    <div className="relative rounded-lg border border-signal/30 bg-gradient-to-br from-signal/[0.07] to-transparent p-5 overflow-hidden transition-all duration-200 hover:border-signal/50 hover:shadow-glow">
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-signal/10 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-signal/15 border border-signal/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-signal" />
          </div>
          <span className="font-mono-ui text-[10px] tracking-[0.15em] text-signal uppercase">
            {result.intent.replace(/_/g, " ")}
          </span>
          {result.evidence.confidence != null && (
            <span className="flex items-center gap-1 text-[10px] font-mono-ui text-ink-muted">
              <ShieldCheck className="w-3 h-3" />
              {Math.round(result.evidence.confidence * 100)}% confidence
            </span>
          )}
        </div>
        <p className="text-xs text-ink-muted mb-1.5 italic">“{question}”</p>
        <p className="text-sm md:text-base text-ink leading-relaxed">{result.answer}</p>
      </div>
    </div>
  );
}
