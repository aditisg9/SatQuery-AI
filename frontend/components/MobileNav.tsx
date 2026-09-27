"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Satellite, LogOut } from "lucide-react";
import { NAV } from "./Sidebar";
import { useAuth } from "@/lib/auth";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-panel-border text-ink-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all shrink-0"
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
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-panel-border flex flex-col animate-[slidein_0.15s_ease-out]">
            <div className="flex items-center justify-between px-5 h-16 border-b border-panel-border">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-8 h-8 rounded border border-primary/40 bg-primary/10">
                  <Satellite className="w-4 h-4 text-primary" />
                </div>
                <div className="font-display leading-tight">
                  <div className="text-sm font-semibold tracking-wide text-sidebar-ink">SatQuery</div>
                  <div className="text-[10px] font-mono-ui text-primary tracking-[0.2em]">AI · GEOINT</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="w-8 h-8 flex items-center justify-center rounded-md text-sidebar-ink-muted hover:text-sidebar-ink hover:bg-sidebar-active-bg/50 active:scale-90 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                if (href === "/admin" && user?.role !== "ADMIN") return null;
                
                const actualHref = href === "/admin" ? "/dashboard/admin" : href;
                const active = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(actualHref);
                return (
                  <Link
                    key={href}
                    href={actualHref}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-mono-ui transition-all active:scale-[0.98] ${
                      active
                        ? "bg-sidebar-active-bg text-sidebar-ink"
                        : "text-sidebar-ink-muted border border-transparent hover:bg-sidebar-active-bg/50 hover:text-sidebar-ink"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="px-5 py-4 border-t border-panel-border space-y-4">
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="flex items-center gap-2 text-sm font-mono-ui text-sidebar-ink-muted hover:text-sidebar-ink transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
