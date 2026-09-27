"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  ScanSearch,
  GitCompareArrows,
  Trash2,
  ArrowLeft,
  Pencil,
  Check,
  X,
} from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { ProjectOut, SessionOut } from "@/lib/types";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectOut | null>(null);
  const [sessions, setSessions] = useState<SessionOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([api.getProject(projectId), api.projectSessions(projectId)])
      .then(([p, s]) => {
        setProject(p);
        setSessions(s);
        setEditName(p.name);
        setEditDesc(p.description || "");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!projectId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project?.name}"? Sessions inside it will be kept but unlinked.`)) return;
    await api.deleteProject(projectId);
    router.push("/projects");
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (!confirm(`Delete session "${title}"? This can't be undone.`)) return;
    await api.deleteSession(id);
    load();
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await api.updateProject(projectId, { name: editName.trim(), description: editDesc.trim() });
      setEditing(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Shell title="Project" subtitle="Loading…">
        <div className="px-6 py-16 text-sm text-ink-muted">Loading…</div>
      </Shell>
    );
  }

  if (notFound || !project) {
    return (
      <Shell title="Project" subtitle="Not found">
        <div className="px-6 py-16 text-sm text-ink-muted">Project not found.</div>
      </Shell>
    );
  }

  return (
    <Shell title="Project" subtitle={project.name}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <button
          onClick={() => router.push("/projects")}
          className="flex items-center gap-1.5 text-xs font-mono-ui text-ink-muted hover:text-ink active:scale-95 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> All Projects
        </button>

        {editing ? (
          <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4 mb-6 space-y-3">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-panel-raised border border-panel-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
              placeholder="Description (optional)"
              className="w-full bg-panel-raised border border-panel-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none placeholder:text-ink-muted"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving || !editName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-mono-ui font-semibold hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition-all"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-panel-border text-ink-muted text-xs font-mono-ui hover:text-ink hover:bg-panel-raised active:scale-95 transition-all"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <FolderKanban className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold text-ink truncate">{project.name}</h2>
                {project.description && <p className="text-sm text-ink-muted mt-1">{project.description}</p>}
                <p className="text-[10px] font-mono-ui text-ink-muted uppercase tracking-wide mt-2">
                  {sessions.length} session{sessions.length === 1 ? "" : "s"} · created{" "}
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-panel-border text-ink-muted text-xs font-mono-ui hover:text-primary hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Rename</span>
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-error/30 text-error text-xs font-mono-ui hover:bg-error/10 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => router.push(`/analyze?project=${project.id}`)}
            className="flex items-center gap-2 justify-center rounded-lg border border-panel-border bg-panel py-4 text-sm font-mono-ui text-ink-muted hover:border-primary/40 hover:text-primary hover:shadow-sm active:scale-[0.98] transition-all"
          >
            <ScanSearch className="w-4 h-4" /> New Single-Image Analysis
          </button>
          <button
            onClick={() => router.push(`/compare?project=${project.id}`)}
            className="flex items-center gap-2 justify-center rounded-lg border border-panel-border bg-panel py-4 text-sm font-mono-ui text-ink-muted hover:border-warning/40 hover:text-warning hover:shadow-sm active:scale-[0.98] transition-all"
          >
            <GitCompareArrows className="w-4 h-4" /> New Change Detection
          </button>
        </div>

        <h3 className="font-mono-ui text-xs tracking-[0.15em] text-ink-muted uppercase mb-3">
          Sessions in this Project
        </h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No sessions yet — start one above and it&rsquo;ll show up here.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() =>
                  router.push(s.mode === "single" ? `/analyze?session=${s.id}` : `/compare?session=${s.id}`)
                }
                className="group w-full flex items-center justify-between text-left rounded-lg border border-panel-border bg-panel px-4 py-3 hover:border-primary/40 hover:bg-panel-raised active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {s.mode === "single" ? (
                    <ScanSearch className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <GitCompareArrows className="w-4 h-4 text-warning shrink-0" />
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
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(e, s.id, s.title)}
                    className="p-1.5 rounded-md text-ink-muted opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-error hover:bg-error/10 hover:scale-110 active:scale-90 transition-all"
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
