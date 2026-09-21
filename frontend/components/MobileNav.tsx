"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Satellite } from "lucide-react";
import { NAV } from "./Sidebar";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-panel-border text-ink-muted hover:text-signal hover:border-signal/40 hover:bg-signal/5 active:scale-90 transition-all shrink-0"
      >
        <Menu className="w-4.5 h-4.5" />
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-panel border-r border-panel-border flex flex-col animate-[slidein_0.15s_ease-out]">
            <div className="flex items-center justify-between px-5 h-16 border-b border-panel-border">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-8 h-8 rounded border border-signal/40 bg-signal/10">
                  <Satellite className="w-4 h-4 text-signal" />
                </div>
                <div className="font-display leading-tight">
                  <div className="text-sm font-semibold tracking-wide text-ink">SatQuery</div>
                  <div className="text-[10px] font-mono-ui text-signal tracking-[0.2em]">AI · GEOINT</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="w-8 h-8 flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-panel-raised active:scale-90 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-mono-ui transition-all active:scale-[0.98] ${
                      active
                        ? "bg-signal/10 text-signal border border-signal/30"
                        : "text-ink-muted border border-transparent hover:bg-panel-raised hover:text-ink"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
