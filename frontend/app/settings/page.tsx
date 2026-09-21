"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Cpu, Radio } from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { SystemStatus } from "@/lib/types";

export default function SettingsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    api.status().then(setStatus).catch(() => {});
  }, []);

  return (
    <Shell title="Settings" subtitle="System configuration">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">
        <div className="rounded-xl border border-panel-border bg-panel/50 p-6 shadow-panel transition-all duration-200 hover:border-signal/40 hover:shadow-glow">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-4 h-4 text-signal" />
            <h3 className="font-display text-sm font-semibold tracking-wide text-ink">Analysis Engine</h3>
          </div>

          {status ? (
            <div className="space-y-3 text-sm">
              <Row label="Backend" value={status.app_name + " v" + status.version} />
              <Row
                label="Mode"
                value={
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono-ui text-xs ${
                      status.vlm_backend === "gemini" ? "text-signal" : "text-change"
                    }`}
                  >
                    {status.vlm_backend === "gemini" ? (
                      <Cpu className="w-3.5 h-3.5" />
                    ) : (
                      <Radio className="w-3.5 h-3.5" />
                    )}
                    {status.demo_mode ? "LOCAL" : "LIVE"}
                  </span>
                }
              />
              <Row label="Vision-Language backend" value={status.vlm_backend === "gemini" ? "Gemini API" : "Local Rule-Based Engine"} />
              <Row label="Gemini key configured" value={status.gemini_configured ? "Yes" : "No"} />
            </div>
          ) : (
            <p className="text-xs text-ink-muted">Could not reach the backend.</p>
          )}
        </div>

        <div className="rounded-xl border border-panel-border bg-panel/50 p-6 text-sm text-ink-muted space-y-3 shadow-panel transition-all duration-200 hover:border-signal/40 hover:shadow-glow">
          <h4 className="font-mono-ui text-xs tracking-wider text-ink uppercase">Enable Gemini</h4>
          <p>To use real Gemini reasoning instead of the local rule-based engine:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Get an API key at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal hover:text-signal/80 hover:underline underline-offset-2 active:scale-95 inline-block transition-all"
              >
                aistudio.google.com/apikey
              </a>
            </li>
            <li>
              In <code className="text-ink">backend/.env</code>, set{" "}
              <code className="text-ink">GEMINI_API_KEY</code> and{" "}
              <code className="text-ink">DEMO_MODE=false</code>
            </li>
            <li>Restart the backend service.</li>
          </ol>
          <p className="text-xs">
            Computer-vision statistics (segmentation, detection, change maps) always run locally —
            Gemini is only used to phrase the natural-language answer, grounded in those numbers.
          </p>
        </div>
      </div>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-panel-border/60 pb-2">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
