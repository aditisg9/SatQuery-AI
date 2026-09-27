"use client";

import { useState } from "react";
import {
  MapPin,
  Search,
  Loader2,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  ArrowRight,
  LocateFixed,
  ZoomIn,
} from "lucide-react";
import { api } from "@/lib/api";
import type { GeocodeMatch, ImageOut } from "@/lib/types";

const ZOOM_PRESETS = [
  { zoom: 17, label: "Close-up", detail: "~0.8 km" },
  { zoom: 15, label: "Neighborhood", detail: "~3 km" },
  { zoom: 13, label: "Wide Area", detail: "~13 km" },
] as const;

export default function LocationSearchPanel({
  onFetched,
}: {
  onFetched: (image: ImageOut) => void;
}) {
  const [mode, setMode] = useState<"name" | "current" | "coords">("name");
  const [zoom, setZoom] = useState<number>(15);

  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<GeocodeMatch[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);

  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");

  const [fetching, setFetching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<ImageOut | null>(null);
  const [doneCoords, setDoneCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);

  const search = async () => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setSearching(true);
    setError(null);
    setMatches(null);
    setNotFound(null);
    try {
      const results = await api.geocode(q);
      setMatches(results);
    } catch (e: any) {
      // A 404 here means "not found by name" — that's not a failure of the
      // app, it's expected for any place too specific/small to be indexed.
      // Guide the person straight to the guaranteed coordinates path
      // instead of just showing a dead-end error.
      setNotFound(q);
    } finally {
      setSearching(false);
    }
  };

  const fetchAt = async (lat: number, lon: number, label: string) => {
    setFetching(label);
    setError(null);
    try {
      const img = await api.fetchImagery({ lat, lon, place_name: label, zoom });
      setDone(img);
      setDoneCoords({ lat, lon });
      onFetched(img);
    } catch (e: any) {
      setError(e.message || "Could not fetch imagery for this location");
    } finally {
      setFetching(null);
    }
  };

  const fetchFromCoords = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      setError(
        "Enter a valid latitude (-90 to 90) and longitude (-180 to 180).",
      );
      return;
    }
    fetchAt(lat, lon, `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
  };

  const openInGoogleMaps = (q: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
      "_blank",
    );
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        fetchAt(
          pos.coords.latitude,
          pos.coords.longitude,
          "My Current Location",
        );
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied — allow it in your browser, or use one of the other tabs instead."
            : "Could not get your current location. Try again, or use one of the other tabs.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="rounded-xl border border-dashed border-panel-border bg-panel p-6">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono-ui text-ink">Search a location</span>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] font-mono-ui text-ink-muted uppercase tracking-wide">
          <ZoomIn className="w-3 h-3" /> Coverage:
        </span>
        {ZOOM_PRESETS.map((p) => (
          <button
            key={p.zoom}
            onClick={() => setZoom(p.zoom)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono-ui border active:scale-95 transition-all ${
              zoom === p.zoom
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-panel-border text-ink-muted hover:text-ink hover:bg-panel-raised"
            }`}
          >
            {p.label} <span className="text-ink-muted">({p.detail})</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["name", "current", "coords"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
              setNotFound(null);
            }}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono-ui uppercase tracking-wide border active:scale-95 transition-all ${
              mode === m
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-panel-border text-ink-muted hover:text-ink hover:bg-panel-raised"
            }`}
          >
            {m === "name"
              ? "By Place Name"
              : m === "current"
                ? "Current Location"
                : "By Coordinates"}
          </button>
        ))}
      </div>

      {mode === "name" ? (
        <>
          <p className="text-xs text-ink-muted mb-4">
            Type any place — city, landmark, institution. If it's not found by
            name, you'll get a 15-second path to fetch it anyway, below.
          </p>
          <div className="flex items-center gap-2 bg-panel-raised border border-panel-border rounded-lg px-3 py-2.5 focus-within:border-primary/50 focus-within:shadow-sm transition-all">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="e.g. Jaipur, your college name, a landmark…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
            />
            <button
              onClick={search}
              disabled={searching || query.trim().length < 2}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary disabled:text-ink-muted disabled:bg-transparent disabled:opacity-40 hover:bg-primary/20 hover:scale-105 active:scale-90 transition-all"
            >
              {searching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {matches && matches.length > 0 && !done && (
            <div className="mt-3 space-y-1.5">
              {matches.map((m) => (
                <button
                  key={`${m.lat}-${m.lon}`}
                  onClick={() => fetchAt(m.lat, m.lon, m.display_name)}
                  disabled={fetching !== null}
                  className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md border border-panel-border text-xs text-ink-muted hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-[0.99] disabled:opacity-50 transition-all"
                >
                  <span className="truncate pr-2">{m.display_name}</span>
                  {fetching === m.display_name ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <span className="font-mono-ui text-[10px] shrink-0">
                      {m.lat.toFixed(3)}, {m.lon.toFixed(3)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {notFound && (
            <div className="mt-3 rounded-lg border border-warning/30 bg-warning/[0.05] p-4">
              <p className="text-xs text-ink mb-3">
                <span className="text-warning font-mono-ui">"{notFound}"</span>{" "}
                isn't in our name index — that's normal for a specific college,
                building, or small local place. Get it in 15 seconds instead:
              </p>
              <ol className="text-xs text-ink-muted space-y-1.5 mb-3 list-decimal list-inside">
                <li>Open Google Maps and find the exact spot</li>
                <li>
                  Right-click it → click the coordinates that appear (copies
                  them)
                </li>
                <li>Paste them into "By Coordinates" below</li>
              </ol>
              <div className="flex gap-2">
                <button
                  onClick={() => openInGoogleMaps(notFound)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-panel-border text-xs font-mono-ui text-ink-muted hover:text-primary hover:border-primary/40 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Google Maps
                </button>
                <button
                  onClick={() => setMode("coords")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning/10 border border-warning/40 text-warning text-xs font-mono-ui hover:bg-warning/20 active:scale-95 transition-all"
                >
                  I have the coordinates <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : mode === "current" ? (
        <>
          <p className="text-xs text-ink-muted mb-4">
            Fetch satellite imagery for wherever you are right now. Most
            accurate on a phone with GPS enabled — laptops without GPS hardware
            fall back to network-based location, which can be noticeably off.
            For a guaranteed exact spot, use "By Coordinates" instead.
          </p>
          <button
            onClick={useCurrentLocation}
            disabled={locating || fetching !== null}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/40 text-primary text-sm font-mono-ui hover:bg-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all"
          >
            {locating || fetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
            {locating
              ? "Getting your location…"
              : fetching
                ? "Fetching imagery…"
                : "Use My Current Location"}
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-ink-muted mb-4">
            Works for <span className="text-ink">any exact spot on Earth</span>{" "}
            — no search service involved. Get coordinates from Google Maps:
            right-click any location, then click the coordinates to copy them.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              placeholder="Latitude (e.g. 26.9124)"
              className="bg-panel-raised border border-panel-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/50 placeholder:text-ink-muted"
            />
            <input
              value={lonInput}
              onChange={(e) => setLonInput(e.target.value)}
              placeholder="Longitude (e.g. 75.7873)"
              className="bg-panel-raised border border-panel-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/50 placeholder:text-ink-muted"
            />
          </div>
          <button
            onClick={fetchFromCoords}
            disabled={fetching !== null || !latInput || !lonInput}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/40 text-primary text-sm font-mono-ui hover:bg-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all"
          >
            {fetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
            Fetch This Exact Spot
          </button>
        </>
      )}

      {error && <p className="text-xs text-error mt-3 font-mono-ui">{error}</p>}

      {done && (
        <div className="flex items-center gap-2 mt-3 text-xs text-success font-mono-ui">
          <CheckCircle2 className="w-3.5 h-3.5" /> Fetched imagery for{" "}
          {done.place_name}
          {doneCoords && (
            <span className="text-ink-muted">
              ({doneCoords.lat.toFixed(5)}, {doneCoords.lon.toFixed(5)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
