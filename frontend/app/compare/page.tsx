"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import UploadPanel from "@/components/UploadPanel";
import ImageViewer from "@/components/ImageViewer";
import ChatPanel from "@/components/ChatPanel";
import AnswerCallout from "@/components/AnswerCallout";
import { ChangeStatsChart } from "@/components/StatsCharts";
import { api, assetUrl } from "@/lib/api";
import { formatAreaDual } from "@/lib/format";
import type { AnalysisResult, HistoryEntry, ImageOut, SessionOut } from "@/lib/types";

const COMPARE_SUGGESTIONS = [
  "What warningd between these two satellite images?",
  "Has urbanization increased?",
  "Are there new roads or buildings?",
  "Show areas where vegetation decreased.",
];

function CompareInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session");
  const projectId = params.get("project");

  const [beforeImg, setBeforeImg] = useState<ImageOut | null>(null);
  const [afterImg, setAfterImg] = useState<ImageOut | null>(null);
  const [session, setSession] = useState<SessionOut | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [latest, setLatest] = useState<AnalysisResult | null>(null);
  const [latestQuestion, setLatestQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"before" | "after" | "warning">("warning");

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const sessions = await api.listSessions();
      const s = sessions.find((x) => x.id === sessionId) || null;
      setSession(s);
      if (s?.before_image_id) setBeforeImg(await api.getImage(s.before_image_id));
      if (s?.after_image_id) setAfterImg(await api.getImage(s.after_image_id));
      const h = await api.sessionHistory(sessionId);
      setHistory(h);
      const last = [...h].reverse().find((x) => x.result);
      if (last?.result) {
        setLatest(last.result);
        setLatestQuestion(last.question);
      }
    })();
  }, [sessionId]);

  const tryCreateSession = async (b: ImageOut | null, a: ImageOut | null) => {
    if (!b || !a) return;
    const s = await api.createSession({
      mode: "compare",
      before_image_id: b.id,
      after_image_id: a.id,
      project_id: projectId || undefined,
    });
    router.push(`/compare?session=${s.id}`);
  };

  const handleAsk = async (question: string) => {
    if (!sessionId) return;
    setLoading(true);
    setHistory((h) => [
      ...h,
      { id: `pending-${Date.now()}`, question, intent: null, answer: null, result: null, created_at: "" },
    ]);
    try {
      const result = await api.analyze(sessionId, question);
      setLatest(result);
      setLatestQuestion(question);
      setTab("warning");
      setHistory((h) => {
        const copy = [...h];
        copy[copy.length - 1] = {
          id: `local-${Date.now()}`,
          question,
          intent: result.intent,
          answer: result.answer,
          result,
          created_at: new Date().toISOString(),
        };
        return copy;
      });
    } catch {
      setHistory((h) => h.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <Shell title="Compare" subtitle="Before / after change detection">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-mono-ui text-xs text-ink-muted uppercase tracking-wide mb-2">Before image</p>
            <UploadPanel
              label="Upload the earlier image"
              onUploaded={(img) => {
                setBeforeImg(img);
                tryCreateSession(img, afterImg);
              }}
            />
          </div>
          <div>
            <p className="font-mono-ui text-xs text-ink-muted uppercase tracking-wide mb-2">After image</p>
            <UploadPanel
              label="Upload the later image"
              onUploaded={(img) => {
                setAfterImg(img);
                tryCreateSession(beforeImg, img);
              }}
            />
          </div>
        </div>
      </Shell>
    );
  }

  const activeSrc =
    tab === "before"
      ? beforeImg && assetUrl(beforeImg.url)
      : tab === "after"
      ? afterImg && assetUrl(afterImg.url)
      : afterImg && assetUrl(afterImg.url);

  const activeOverlay =
    tab === "before"
      ? latest?.before_overlay_url && assetUrl(latest.before_overlay_url)
      : tab === "after"
      ? latest?.after_overlay_url && assetUrl(latest.after_overlay_url)
      : latest?.change_map_url && assetUrl(latest.change_map_url);

  return (
    <Shell title="Compare" subtitle={session?.title || "change detection"}>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] lg:h-full min-h-0">
        <div className="overflow-y-auto p-4 md:p-6 space-y-5 min-w-0">
          <div className="flex gap-2">
            {(["before", "after", "warning"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono-ui uppercase tracking-wide border active:scale-95 transition-all ${
                  tab === t
                    ? "border-primary/40 text-primary bg-primary/10"
                    : "border-panel-border text-ink-muted hover:text-ink hover:bg-panel-raised"
                }`}
              >
                {t === "warning" ? "Change Map" : t}
              </button>
            ))}
          </div>

          {activeSrc && (
            <ImageViewer
              baseSrc={activeSrc}
              overlaySrc={activeOverlay || null}
              geo={(tab === "before" ? beforeImg?.geo : afterImg?.geo) as any}
              label={tab}
            />
          )}

          {latest && <AnswerCallout question={latestQuestion} result={latest} />}

          {latest && latest.change_stats.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <ChangeStatsChart stats={latest.change_stats} />
              <div className="rounded-lg border border-panel-border bg-panel p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
                <div className="font-mono-ui text-xs tracking-wider text-ink-muted uppercase mb-3">
                  Change Summary
                </div>
                <ul className="text-xs text-ink space-y-2">
                  {latest.change_stats
                    .filter((c) => Math.abs(c.delta_percentage) >= 0.5)
                    .map((c) => (
                      <li key={c.label} className="flex items-center justify-between gap-3">
                        <span className="text-ink-muted shrink-0">{c.label}</span>
                        <span className="flex items-center gap-2 text-right">
                          <span className={c.delta_percentage > 0 ? "text-warning" : "text-primary"}>
                            {c.delta_percentage > 0 ? "+" : ""}
                            {c.delta_percentage}%
                          </span>
                          {c.delta_area_hectares != null && (
                            <span className="font-mono-ui text-[10px] text-ink-muted">
                              ({c.delta_area_hectares > 0 ? "+" : ""}
                              {formatAreaDual(Math.abs(c.delta_area_hectares))})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
                {latest.notes.length > 0 && (
                  <p className="text-[11px] text-warning mt-3 pt-3 border-t border-panel-border/70">
                    {latest.notes[0]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-[75vh] lg:h-full shrink-0 border-t lg:border-t-0 border-panel-border">
          <ChatPanel history={history} onAsk={handleAsk} loading={loading} suggestions={COMPARE_SUGGESTIONS} />
        </div>
      </div>
    </Shell>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareInner />
    </Suspense>
  );
}
