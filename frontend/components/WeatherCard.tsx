"use client";

import { useEffect, useState } from "react";
import { Cloud, Droplets, Wind, ThermometerSun } from "lucide-react";
import { api } from "@/lib/api";
import type { WeatherInfo } from "@/lib/types";

export default function WeatherCard({ lat, lon }: { lat: number; lon: number }) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [failed, setFailed] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    setWeather(null);
    setFailed(false);
    api
      .getWeather(lat, lon)
      .then((w) => {
        setWeather(w);
        setFetchedAt(new Date());
      })
      .catch(() => setFailed(true));
  }, [lat, lon]);

  if (failed) return null; // weather is a bonus — never show a broken card for it
  if (!weather) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel/50 p-4 animate-pulse h-20" />
    );
  }

  return (
    <div className="rounded-lg border border-panel-border bg-panel/50 p-4 transition-all duration-200 hover:border-signal/40 hover:shadow-glow">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono-ui text-ink-muted uppercase tracking-wider">
          <Cloud className="w-3 h-3" /> Live Weather at This Location
        </div>
        {fetchedAt && (
          <span className="text-[10px] font-mono-ui text-ink-muted">
            as of {fetchedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-2xl font-display font-semibold text-ink">
          {Math.round(weather.temperature_c)}°C
        </div>
        <div className="text-xs text-ink-muted">{weather.condition}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] text-ink-muted">
        {weather.humidity_percent != null && (
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3" /> {weather.humidity_percent}%
          </span>
        )}
        {weather.wind_speed_kmh != null && (
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3" /> {weather.wind_speed_kmh} km/h
          </span>
        )}
        {weather.precipitation_mm != null && (
          <span className="flex items-center gap-1">
            <ThermometerSun className="w-3 h-3" /> {weather.precipitation_mm} mm
          </span>
        )}
      </div>
    </div>
  );
}
