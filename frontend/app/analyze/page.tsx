"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import UploadPanel from "@/components/UploadPanel";
import LocationSearchPanel from "@/components/LocationSearchPanel";
import ImageViewer from "@/components/ImageViewer";
import ChatPanel from "@/components/ChatPanel";
import AnswerCallout from "@/components/AnswerCallout";
import GeoStatsCard from "@/components/GeoStatsCard";
import WeatherCard from "@/components/WeatherCard";
import { ClassStatsChart } from "@/components/StatsCharts";
import { api, assetUrl } from "@/lib/api";
import type { AnalysisResult, HistoryEntry, ImageOut, SessionOut } from "@/lib/types";

function AnalyzeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session");
  const projectId = params.get("project");

  const [session, setSession] = useState<SessionOut | null>(null);
  const [image, setImage] = useState<ImageOut | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [latest, setLatest] = useState<AnalysisResult | null>(null);
  const [latestQuestion, setLatestQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sourceTab, setSourceTab] = useState<"upload" | "search">("upload");

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const sessions = await api.listSessions();
      const s = sessions.find((x) => x.id === sessionId) || null;
      setSession(s);
      if (s?.image_id) {
        setImage(await api.getImage(s.image_id));
      }
      const h = await api.sessionHistory(sessionId);
      setHistory(h);
      const last = [...h].reverse().find((x) => x.result);
      if (last?.result) {
        setLatest(last.result);
        setLatestQuestion(last.question);
      }
    })();
  }, [sessionId]);

  const handleUploaded = async (img: ImageOut) => {
    const s = await api.createSession({
      mode: "single",
      image_id: img.id,
      project_id: projectId || undefined,
    });
    router.push(`/analyze?session=${s.id}`);
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
    } catch (e) {
      setHistory((h) => h.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <Shell title="Analyze" subtitle="Single-image analysis">
        <div className="max-w-xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex gap-2 mb-4 justify-center">
            {(["upload", "search"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSourceTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono-ui uppercase tracking-wide border active:scale-95 transition-all ${
                  sourceTab === t
                    ? "border-signal/40 text-signal bg-signal/10"
                    : "border-panel-border text-ink-muted hover:text-ink hover:bg-panel-raised"
                }`}
              >
                {t === "upload" ? "Upload File" : "Search Location"}
              </button>
            ))}
          </div>
          {sourceTab === "upload" ? (
            <UploadPanel label="Upload a satellite image to begin" onUploaded={handleUploaded} />
          ) : (
            <LocationSearchPanel onFetched={handleUploaded} />
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Analyze" subtitle={session?.title || "Single-image analysis"}>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] lg:h-full min-h-0">
        <div className="overflow-y-auto p-4 md:p-6 space-y-5 min-w-0">
          {image && (
            <>
              <div className="flex items-center gap-2 text-xs font-mono-ui">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                    image.source === "fetched"
                      ? "border-change/40 text-change bg-change/10"
                      : "border-signal/40 text-signal bg-signal/10"
                  }`}
                >
                  {image.source === "fetched" ? "Live fetch" : "Uploaded file"}
                </span>
                {image.place_name && (
                  <span className="text-ink-muted truncate">{image.place_name}</span>
                )}
              </div>
              <ImageViewer
                baseSrc={assetUrl(image.url)}
                overlaySrc={latest?.overlay_image_url ? assetUrl(latest.overlay_image_url) : null}
                objects={latest?.objects}
                geo={image.geo}
                label={image.filename}
                marker={
                  image.marker_x != null && image.marker_y != null
                    ? { x: image.marker_x, y: image.marker_y, lat: image.query_lat, lon: image.query_lon }
                    : null
                }
              />
            </>
          )}

          {latest && <AnswerCallout question={latestQuestion} result={latest} />}

          {latest && (
            <div className="grid md:grid-cols-2 gap-4">
              <ClassStatsChart stats={latest.class_stats} />
              {image && <GeoStatsCard geo={image.geo} classStats={latest.class_stats} />}
            </div>
          )}

          {image && image.geo.has_geo_metadata && image.geo.bbox_min_lat != null && (
            <WeatherCard
              lat={(image.geo.bbox_min_lat + image.geo.bbox_max_lat!) / 2}
              lon={(image.geo.bbox_min_lon! + image.geo.bbox_max_lon!) / 2}
            />
          )}
        </div>

        <div className="h-[75vh] lg:h-full shrink-0 border-t lg:border-t-0 border-panel-border">
          <ChatPanel history={history} onAsk={handleAsk} loading={loading} />
        </div>
      </div>
    </Shell>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={null}>
      <AnalyzeInner />
    </Suspense>
  );
}
