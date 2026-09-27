"use client";

import { Sparkles, ShieldCheck } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

export default function AnswerCallout({ question, result }: { question: string; result: AnalysisResult }) {
  return (
    <div className="relative rounded-lg border border-primary/30 bg-panel-raised/50 p-5 overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-sm">
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-mono-ui text-[10px] tracking-[0.15em] text-primary uppercase">
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
