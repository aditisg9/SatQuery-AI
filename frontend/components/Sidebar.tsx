"use client";

import {
  LayoutDashboard,
  ScanSearch,
  GitCompareArrows,
  History,
  FolderKanban,
  Settings,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze", icon: ScanSearch },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/history", label: "History", icon: History },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export { NAV };

import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col w-56 h-screen shrink-0 border-r border-panel-border bg-sidebar backdrop-blur-sm">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-panel-border">
        <div className="relative flex items-center justify-center w-8 h-8 rounded border border-primary/40 bg-primary/10">
          <Satellite className="w-4 h-4 text-primary" />
          <span className="absolute inset-0 rounded border border-primary/20 animate-blink" />
        </div>
        <div className="font-display leading-tight">
          <div className="text-sm font-semibold tracking-wide text-sidebar-ink">SatQuery</div>
          <div className="text-[10px] font-mono-ui text-primary tracking-[0.2em]">AI · GEOINT</div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          if (href === "/admin" && user?.role !== "ADMIN") return null;
          
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
          
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono-ui transition-all active:scale-[0.98] group ${
                active
                  ? "bg-sidebar-active-bg text-sidebar-ink shadow-sm"
                  : "text-sidebar-ink-muted border border-transparent hover:bg-sidebar-active-bg/50 hover:text-sidebar-ink"
              }`}
            >
              {active && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-primary" />
              )}
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-panel-border space-y-4">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-mono-ui text-sidebar-ink-muted hover:text-sidebar-ink transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <div className="text-[10px] font-mono-ui text-sidebar-ink-muted leading-relaxed tracking-wide">
          SATQUERY AI · {user?.role === "ADMIN" ? "ADMIN" : "USER"}
        </div>
      </div>
    </aside>
  );
}
