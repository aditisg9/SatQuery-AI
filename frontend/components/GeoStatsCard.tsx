"use client";

import { MapPin, Ruler, Calendar, Globe2, CheckCircle2, AlertCircle } from "lucide-react";
import type { ClassStat, GeoMetadata } from "@/lib/types";
import { formatAreaDual, formatCoord } from "@/lib/format";

export default function GeoStatsCard({ geo, classStats }: { geo: GeoMetadata; classStats: ClassStat[] }) {
  const totalAreaHectares = classStats.reduce((sum, c) => sum + (c.area_hectares ?? 0), 0);

  if (!geo.has_geo_metadata) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel/50 p-4 transition-all duration-200 hover:border-change/40 hover:shadow-glow-change">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-3.5 h-3.5 text-change" />
          <div className="font-mono-ui text-xs tracking-wider text-change uppercase">No Georeference</div>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          This image has no embedded CRS/geotransform, so statistics below are pixel-percentage
          only. Upload a georeferenced GeoTIFF to unlock real-world area, coordinate bounds, and
          resolution-aware analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-signal/30 bg-signal/[0.04] p-4 transition-all duration-200 hover:border-signal/50 hover:shadow-glow">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-3.5 h-3.5 text-signal" />
        <div className="font-mono-ui text-xs tracking-wider text-signal uppercase">
          Georeferenced Analysis
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <GeoField icon={Globe2} label="CRS" value={geo.crs || "—"} />
        <GeoField
          icon={Ruler}
          label="Pixel Resolution"
          value={geo.pixel_resolution_m ? `${geo.pixel_resolution_m.toFixed(2)} m` : "—"}
        />
        <GeoField icon={Calendar} label="Acquired" value={geo.acquisition_date || "Unknown"} />
        <GeoField icon={MapPin} label="Total Analyzed Area" value={formatAreaDual(totalAreaHectares)} />
      </div>

      <div className="mt-3 pt-3 border-t border-panel-border/70">
        <div className="text-[10px] font-mono-ui text-ink-muted uppercase tracking-wider mb-1.5">
          Bounding Box
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono-ui text-[11px] text-ink">
          <span>N: {formatCoord(geo.bbox_max_lat)}</span>
          <span>E: {formatCoord(geo.bbox_max_lon)}</span>
          <span>S: {formatCoord(geo.bbox_min_lat)}</span>
          <span>W: {formatCoord(geo.bbox_min_lon)}</span>
        </div>
      </div>

      {classStats.length > 0 && (
        <div className="mt-3 pt-3 border-t border-panel-border/70 space-y-1.5">
          <div className="text-[10px] font-mono-ui text-ink-muted uppercase tracking-wider mb-1">
            Area by Class
          </div>
          {classStats
            .filter((c) => c.pixel_percentage > 0)
            .map((c) => (
              <div key={c.key} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-muted">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.label}
                </span>
                <span className="font-mono-ui text-ink">{formatAreaDual(c.area_hectares)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function GeoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-ink-muted text-[10px] font-mono-ui uppercase tracking-wide mb-0.5">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-ink truncate">{value}</div>
    </div>
  );
}
