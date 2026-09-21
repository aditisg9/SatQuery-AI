"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, ScanSearch, X } from "lucide-react";
import Shell from "@/components/Shell";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ProjectOut } from "@/lib/types";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.listProjects().then(setProjects).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.createProject({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell title="Projects" subtitle="Group repeat monitoring of the same area of interest">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Projects</h2>
            <p className="text-sm text-ink-muted max-w-md mt-1">
              Groups analysis sessions for the same site — e.g. quarterly monitoring of one
              floodplain or ward.
            </p>
          </div>
          <Button
            variant={showForm ? "ghost" : "primary"}
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? "Cancel" : "New Project"}
          </Button>
        </div>

        {showForm && (
          <div className="rounded-lg border border-signal/30 bg-signal/[0.04] p-4 mb-6 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name — e.g. Yamuna Floodplain Watch"
              className="w-full bg-panel-raised border border-panel-border rounded-md px-3 py-2 text-sm outline-none focus:border-signal/50 placeholder:text-ink-muted"
              autoFocus
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full bg-panel-raised border border-panel-border rounded-md px-3 py-2 text-sm outline-none focus:border-signal/50 placeholder:text-ink-muted resize-none"
            />
            <Button variant="primary" size="sm" onClick={submit} disabled={!name.trim() || saving}>
              {saving ? "Creating…" : "Create Project"}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg border border-panel-border bg-panel/30 p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 rounded-lg border border-dashed border-panel-border">
            <FolderKanban className="w-8 h-8 text-ink-muted mx-auto mb-3" />
            <p className="text-ink-muted text-sm mb-4">No projects yet. Create one to start grouping sessions.</p>
            <Button variant="primary" size="sm" onClick={() => setShowForm(true)} className="mx-auto">
              <Plus className="w-3.5 h-3.5" /> New Project
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/projects/${p.id}`)}
                className="text-left rounded-lg border border-panel-border bg-panel/50 p-4 hover:border-signal/40 hover:shadow-glow active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FolderKanban className="w-4 h-4 text-signal shrink-0" />
                  <div className="text-sm text-ink truncate">{p.name}</div>
                </div>
                {p.description && (
                  <p className="text-xs text-ink-muted line-clamp-2 mb-2">{p.description}</p>
                )}
                <div className="flex items-center gap-3 text-[10px] font-mono-ui text-ink-muted uppercase tracking-wide">
                  <span className="flex items-center gap-1">
                    <ScanSearch className="w-3 h-3" /> {p.session_count} session{p.session_count === 1 ? "" : "s"}
                  </span>
                  <span>{new Date(p.updated_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
