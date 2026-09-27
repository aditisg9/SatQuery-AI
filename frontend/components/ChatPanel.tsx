"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, ShieldAlert, User2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";

const SUGGESTIONS = [
  "What is present in this image?",
  "How much agricultural land is visible?",
  "Identify the water bodies.",
  "Find buildings in this image.",
  "Where is vegetation concentrated?",
];

export default function ChatPanel({
  history,
  onAsk,
  loading,
  suggestions = SUGGESTIONS,
}: {
  history: HistoryEntry[];
  onAsk: (q: string) => void;
  loading: boolean;
  suggestions?: string[];
}) {
  const [question, setQuestion] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const submit = () => {
    const q = question.trim();
    if (!q || loading) return;
    onAsk(q);
    setQuestion("");
  };

  return (
    <div className="flex flex-col h-full border-l border-panel-border bg-panel">
      <div className="flex items-center gap-2 px-4 h-12 border-b border-panel-border shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-mono-ui text-xs tracking-[0.15em] text-ink-muted uppercase">AI Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {history.length === 0 && !loading && (
          <div>
            <p className="text-sm text-ink-muted mb-3">
              Ask a question about the imagery. The assistant routes it to the right analysis
              pipeline and answers only from computed results.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => onAsk(s)}
                  className="text-[11px] font-mono-ui px-2.5 py-1.5 rounded-md border border-panel-border text-ink-muted hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-95 transition-all text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((h) => (
          <div key={h.id} className="space-y-2">
            <div className="flex items-start gap-2 justify-end">
              <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary/10 border border-primary/30 px-3 py-2 text-sm text-ink">
                {h.question}
              </div>
              <div className="w-6 h-6 rounded-full bg-panel-raised border border-panel-border flex items-center justify-center shrink-0">
                <User2 className="w-3.5 h-3.5 text-ink-muted" />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-panel-raised border border-panel-border px-3 py-2 text-sm text-ink space-y-2">
                {h.intent && (
                  <div className="text-[10px] font-mono-ui tracking-wider text-primary">{h.intent}</div>
                )}
                <p>{h.answer}</p>
                {h.result?.evidence && (
                  <div className="mt-2 pt-2 border-t border-panel-border/70 text-xs text-ink-muted space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-ui text-ink-muted">
                      <ShieldAlert className="w-3 h-3" />
                      EVIDENCE · {h.result.evidence.method}
                      {h.result.evidence.confidence != null && (
                        <span className="text-warning">
                          · conf {Math.round(h.result.evidence.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {h.result.evidence.supporting_points.slice(0, 4).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-ink-muted text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Running analysis pipeline…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-panel-border shrink-0">
        <div className="flex items-center gap-2 bg-panel-raised border border-panel-border rounded-xl px-3 py-2.5 focus-within:border-primary/50 focus-within:shadow-sm transition-all">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask about this imagery…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
          />
          <button
            onClick={submit}
            disabled={loading || !question.trim()}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary disabled:text-ink-muted disabled:bg-transparent disabled:opacity-40 hover:bg-primary/20 hover:scale-105 active:scale-90 disabled:active:scale-100 disabled:hover:scale-100 transition-all"
            aria-label="Send question"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
