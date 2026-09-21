"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Radio, Cpu } from "lucide-react";
import { api } from "@/lib/api";
import type { SystemStatus } from "@/lib/types";
import MobileNav from "./MobileNav";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const router = useRouter();

  useEffect(() => {
    api
      .status()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-panel-border bg-panel/40 backdrop-blur-sm gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <MobileNav />
        <div className="min-w-0">
          <h1 className="font-display text-sm md:text-base font-semibold text-ink truncate leading-tight">
            {title}
          </h1>
          {subtitle && <p className="text-[11px] md:text-xs text-ink-muted mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {status && (
          <button
            onClick={() => router.push("/settings")}
            title="View engine status in Settings"
            className={`flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-full border font-mono-ui text-[11px] tracking-wide transition-all active:scale-95 hover:shadow-glow ${
              status.vlm_backend === "gemini"
                ? "border-signal/40 text-signal bg-signal/10 hover:border-signal hover:bg-signal/20"
                : "border-change/40 text-change bg-change/10 hover:border-change hover:bg-change/20 hover:shadow-glow-change"
            }`}
          >
            {status.vlm_backend === "gemini" ? (
              <Cpu className="w-3.5 h-3.5" />
            ) : (
              <Radio className="w-3.5 h-3.5 animate-blink" />
            )}
            <span className="hidden sm:inline">{status.vlm_backend === "gemini" ? "GEMINI LIVE" : "LOCAL ENGINE"}</span>
          </button>
        )}
      </div>
    </header>
  );
}
