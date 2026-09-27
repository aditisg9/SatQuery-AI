"use client";

import { useState } from "react";
import type { DetectedObject, GeoMetadata } from "@/lib/types";

export default function ImageViewer({
  baseSrc,
  overlaySrc,
  objects,
  geo,
  label,
  marker,
}: {
  baseSrc: string;
  overlaySrc?: string | null;
  objects?: DetectedObject[];
  geo?: GeoMetadata;
  label?: string;
  marker?: { x: number; y: number; lat?: number | null; lon?: number | null } | null;
}) {
  const [showOverlay, setShowOverlay] = useState(true);

  const corner = (pos: string) =>
    `absolute w-4 h-4 border-primary/80 ${pos}`;

  return (
    <div className="relative rounded-lg border border-panel-border bg-black/40 overflow-hidden select-none">
      {/* image */}
      <div className="relative">
        <img src={baseSrc} alt={label || "satellite image"} className="w-full h-full object-contain" />
        {overlaySrc && showOverlay && (
          <img
            src={overlaySrc}
            alt="analysis overlay"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        )}
        {objects?.map((o, i) => {
          const [x, y, w, h] = o.bbox;
          return (
            <div
              key={i}
              className="absolute border-2 border-warning/90"
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: `${w * 100}%`,
                height: `${h * 100}%`,
              }}
            >
              <span className="absolute -top-4 left-0 text-[9px] font-mono-ui bg-warning text-white px-1 rounded-sm">
                {o.label.replace("_", " ")} {Math.round(o.confidence * 100)}%
              </span>
            </div>
          );
        })}

        {marker && (
          <div
            className="absolute pointer-events-none z-10 flex flex-col items-center"
            style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%`, transform: "translate(-50%, -100%)" }}
          >
            <span className="mb-1 px-1.5 py-0.5 rounded-sm bg-error text-white text-[9px] font-mono-ui font-semibold tracking-wide whitespace-nowrap shadow-lg">
              {marker.lat != null && marker.lon != null
                ? `${marker.lat.toFixed(5)}°, ${marker.lon.toFixed(5)}°`
                : "EXACT LOCATION"}
            </span>
            <div className="relative w-7 h-7 flex items-center justify-center">
              <span className="absolute w-7 h-7 rounded-full bg-error/40 animate-ping" />
              <span className="absolute w-4 h-4 rounded-full border-2 border-error bg-void/60" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-error" />
            </div>
            <div className="w-px h-3 bg-error -mt-0.5" />
          </div>
        )}

        {/* scanline sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute left-0 right-0 h-px bg-primary shadow-[0_0_8px_2px_rgba(79,209,197,0.6)] animate-scan" />
        </div>
      </div>

      {/* reticle corners */}
      <div className={corner("top-2 left-2 border-t-2 border-l-2")} />
      <div className={corner("top-2 right-2 border-t-2 border-r-2")} />
      <div className={corner("bottom-2 left-2 border-b-2 border-l-2")} />
      <div className={corner("bottom-2 right-2 border-b-2 border-r-2")} />

      {/* coordinate / metadata readout */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-1 rounded-full bg-void/80 border border-panel-border font-mono-ui text-[10px] text-primary tracking-wider">
        {geo?.has_geo_metadata ? (
          <span>
            {geo.bbox_min_lat?.toFixed(3)}°, {geo.bbox_min_lon?.toFixed(3)}° → {geo.bbox_max_lat?.toFixed(3)}°,{" "}
            {geo.bbox_max_lon?.toFixed(3)}°
          </span>
        ) : (
          <span>NO GEOREFERENCE · PIXEL-SPACE ONLY</span>
        )}
      </div>

      {overlaySrc && (
        <button
          onClick={() => setShowOverlay((v) => !v)}
          className="absolute top-2 right-1/2 translate-x-1/2 md:right-2 md:translate-x-0 px-3 py-1 rounded-full bg-void/80 border border-panel-border font-mono-ui text-[10px] text-ink-muted hover:text-primary hover:border-primary/40 hover:bg-void active:scale-95 transition-all"
        >
          {showOverlay ? "HIDE OVERLAY" : "SHOW OVERLAY"}
        </button>
      )}
    </div>
  );
}
