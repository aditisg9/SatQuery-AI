"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History as HistoryIcon, ScanSearch, GitCompareArrows, Trash2 } from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { SessionOut } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionOut[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.listSessions().then(setSessions).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (!confirm(`Delete session "${title}"? This can't be undone.`)) return;
    await api.deleteSession(id);
    load();
  };

  return (
    <Shell title="History" subtitle="All analysis sessions">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24">
            <HistoryIcon className="w-8 h-8 text-ink-muted mx-auto mb-3" />
            <p className="text-ink-muted text-sm">No sessions yet. Start an analysis from the Dashboard.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() =>
                  router.push(s.mode === "single" ? `/analyze?session=${s.id}` : `/compare?session=${s.id}`)
                }
                className="group w-full flex items-center justify-between text-left rounded-lg border border-panel-border bg-panel/50 px-4 py-3 hover:border-signal/40 hover:bg-panel-raised/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {s.mode === "single" ? (
                    <ScanSearch className="w-4 h-4 text-signal shrink-0" />
                  ) : (
                    <GitCompareArrows className="w-4 h-4 text-change shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm text-ink truncate">{s.title}</div>
                    <div className="text-[10px] font-mono-ui text-ink-muted uppercase tracking-wide">
                      {s.mode === "single" ? "Single image" : "Change detection"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono-ui text-ink-muted hidden sm:inline">
                    {new Date(s.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, s.id, s.title)}
                    className="p-1.5 rounded-md text-ink-muted opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-alert hover:bg-alert/10 hover:scale-110 active:scale-90 transition-all"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
