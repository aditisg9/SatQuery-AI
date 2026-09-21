import type {
  AdminImageRow,
  AdminStats,
  AnalysisResult,
  GeocodeMatch,
  HistoryEntry,
  ImageOut,
  ProjectOut,
  SessionOut,
  SystemStatus,
  WeatherInfo,
} from "./types";

// Requests go through the Next.js rewrite at /backend/* -> FastAPI, so the
// browser never needs to know the backend's real host/port.
const BASE = "/backend";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  status: () => fetch(`${BASE}/api/status`).then((r) => handle<SystemStatus>(r)),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${BASE}/api/images/upload`, { method: "POST", body: form }).then((r) =>
      handle<ImageOut>(r)
    );
  },

  createSession: (payload: {
    mode: "single" | "compare";
    image_id?: string;
    before_image_id?: string;
    after_image_id?: string;
    title?: string;
    project_id?: string;
  }) =>
    fetch(`${BASE}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<SessionOut>(r)),

  listSessions: () => fetch(`${BASE}/api/sessions`).then((r) => handle<SessionOut[]>(r)),

  deleteSession: (sessionId: string) =>
    fetch(`${BASE}/api/sessions/${sessionId}`, { method: "DELETE" }).then((r) => handle<{ ok: boolean }>(r)),

  getImage: (imageId: string) => fetch(`${BASE}/api/images/${imageId}`).then((r) => handle<ImageOut>(r)),

  sessionHistory: (sessionId: string) =>
    fetch(`${BASE}/api/sessions/${sessionId}/history`).then((r) => handle<HistoryEntry[]>(r)),

  analyze: (sessionId: string, question: string) =>
    fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question }),
    }).then((r) => handle<AnalysisResult>(r)),

  // ---- Projects ----
  listProjects: () => fetch(`${BASE}/api/projects`).then((r) => handle<ProjectOut[]>(r)),

  getProject: (projectId: string) =>
    fetch(`${BASE}/api/projects/${projectId}`).then((r) => handle<ProjectOut>(r)),

  createProject: (payload: { name: string; description?: string }) =>
    fetch(`${BASE}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ProjectOut>(r)),

  updateProject: (projectId: string, payload: { name?: string; description?: string }) =>
    fetch(`${BASE}/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ProjectOut>(r)),

  deleteProject: (projectId: string) =>
    fetch(`${BASE}/api/projects/${projectId}`, { method: "DELETE" }).then((r) => handle<{ ok: boolean }>(r)),

  projectSessions: (projectId: string) =>
    fetch(`${BASE}/api/projects/${projectId}/sessions`).then((r) => handle<SessionOut[]>(r)),

  // ---- Imagery fetch (location search) ----
  geocode: (query: string) =>
    fetch(`${BASE}/api/imagery/geocode?q=${encodeURIComponent(query)}`).then((r) =>
      handle<GeocodeMatch[]>(r)
    ),

  fetchImagery: (payload: { lat: number; lon: number; place_name?: string; zoom?: number }) =>
    fetch(`${BASE}/api/imagery/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ImageOut>(r)),

  getWeather: (lat: number, lon: number) =>
    fetch(`${BASE}/api/imagery/weather?lat=${lat}&lon=${lon}`).then((r) => handle<WeatherInfo>(r)),

  // ---- Admin ----
  adminImages: () => fetch(`${BASE}/api/admin/images`).then((r) => handle<AdminImageRow[]>(r)),
  adminStats: () => fetch(`${BASE}/api/admin/stats`).then((r) => handle<AdminStats>(r)),
};

export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  return `${BASE}${path}`;
}
