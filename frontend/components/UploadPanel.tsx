"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import type { ImageOut } from "@/lib/types";

export default function UploadPanel({
  label,
  onUploaded,
  compact = false,
}: {
  label: string;
  onUploaded: (image: ImageOut) => void;
  compact?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<ImageOut | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const img = await api.uploadImage(file);
        setUploaded(img);
        onUploaded(img);
      } catch (e: any) {
        setError(e.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center text-center border rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.99] ${
        compact ? "p-6" : "p-10 md:p-12"
      } ${
        dragging
          ? "border-primary bg-primary/5 shadow-sm scale-[1.01]"
          : uploaded
            ? "border-success/40 bg-panel"
            : "border-dashed border-panel-border bg-panel hover:border-primary/50 hover:bg-panel-raised"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.tif,.tiff"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) doUpload(file);
        }}
      />

      {uploading ? (
        <>
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-mono-ui text-ink-muted">
            Uploading &amp; extracting metadata…
          </p>
        </>
      ) : uploaded ? (
        <>
          <CheckCircle2 className="w-8 h-8 text-success mb-3" />
          <p className="text-sm font-mono-ui text-ink">{uploaded.filename}</p>
          <p className="text-xs text-ink-muted mt-1">
            {uploaded.width}×{uploaded.height}px ·{" "}
            {uploaded.geo.has_geo_metadata
              ? "Georeferenced"
              : "No geo metadata"}
          </p>
          <p className="text-[11px] text-success mt-3 font-mono-ui">
            Click to replace
          </p>
        </>
      ) : (
        <>
          {compact ? (
            <ImageIcon className="w-7 h-7 text-ink-muted mb-2" />
          ) : (
            <UploadCloud className="w-10 h-10 text-ink-muted mb-3" />
          )}
          <p className="text-sm font-mono-ui text-ink">{label}</p>
          <p className="text-xs text-ink-muted mt-1">
            Drag &amp; drop, or click to browse
          </p>
          <p className="text-[11px] text-ink-muted mt-3 font-mono-ui tracking-wide">
            SUPPORTS: JPG · PNG · GeoTIFF
          </p>
        </>
      )}

      {error && <p className="text-xs text-error mt-3 font-mono-ui">{error}</p>}
    </div>
  );
}
