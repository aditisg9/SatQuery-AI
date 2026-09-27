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

const BASE = "/backend";

export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("satquery_auth_token");
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("satquery_auth_token", token);
  }
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("satquery_auth_token");
  }
}

function authHeaders(headers: Record<string, string> = {}) {
  const token = getAuthToken();
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    
    // Note: 401 handling (redirects/logout) is done in the AuthProvider
    // to avoid circular dependencies and redirect loops here.
    const err = new Error(detail) as any;
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

async function authFetch(url: string, options: RequestInit = {}) {
  const headers = authHeaders(options.headers as Record<string, string>);
  return fetch(url, { ...options, headers });
}

export const api = {
  // ---- Auth ----
  register: (payload: any) =>
    fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<any>(r)),

  login: (payload: URLSearchParams) =>
    fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    }).then((r) => handle<{ access_token: string; token_type: string }>(r)),

  createGuestSession: () =>
    fetch(`${BASE}/api/auth/guest`, { method: "POST" }).then((r) => handle<{ access_token: string; token_type: string }>(r)),

  me: () => authFetch(`${BASE}/api/auth/me`).then((r) => handle<any>(r)),

  forgotPassword: (email: string) =>
    fetch(`${BASE}/api/auth/forgot-password?email=${encodeURIComponent(email)}`, { method: "POST" }).then((r) => handle<any>(r)),

  resetPassword: (payload: any) =>
    fetch(`${BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<any>(r)),

  // ---- Status ----
  status: () => fetch(`${BASE}/api/status`).then((r) => handle<SystemStatus>(r)),

  // ---- Upload & Analysis ----
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return authFetch(`${BASE}/api/images/upload`, { method: "POST", body: form }).then((r) => handle<ImageOut>(r));
  },

  createSession: (payload: any) =>
    authFetch(`${BASE}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<SessionOut>(r)),

  listSessions: () => authFetch(`${BASE}/api/sessions`).then((r) => handle<SessionOut[]>(r)),

  deleteSession: (sessionId: string) =>
    authFetch(`${BASE}/api/sessions/${sessionId}`, { method: "DELETE" }).then((r) => handle<{ ok: boolean }>(r)),

  getImage: (imageId: string) => authFetch(`${BASE}/api/images/${imageId}`).then((r) => handle<ImageOut>(r)),

  sessionHistory: (sessionId: string) =>
    authFetch(`${BASE}/api/sessions/${sessionId}/history`).then((r) => handle<HistoryEntry[]>(r)),

  analyze: (sessionId: string, question: string) =>
    authFetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question }),
    }).then((r) => handle<AnalysisResult>(r)),

  // ---- Projects ----
  listProjects: () => authFetch(`${BASE}/api/projects`).then((r) => handle<ProjectOut[]>(r)),

  getProject: (projectId: string) => authFetch(`${BASE}/api/projects/${projectId}`).then((r) => handle<ProjectOut>(r)),

  createProject: (payload: any) =>
    authFetch(`${BASE}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ProjectOut>(r)),

  updateProject: (projectId: string, payload: any) =>
    authFetch(`${BASE}/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ProjectOut>(r)),

  deleteProject: (projectId: string) =>
    authFetch(`${BASE}/api/projects/${projectId}`, { method: "DELETE" }).then((r) => handle<{ ok: boolean }>(r)),

  projectSessions: (projectId: string) =>
    authFetch(`${BASE}/api/projects/${projectId}/sessions`).then((r) => handle<SessionOut[]>(r)),

  // ---- Imagery fetch ----
  geocode: (query: string) =>
    authFetch(`${BASE}/api/imagery/geocode?q=${encodeURIComponent(query)}`).then((r) => handle<GeocodeMatch[]>(r)),

  fetchImagery: (payload: any) =>
    authFetch(`${BASE}/api/imagery/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ImageOut>(r)),

  getWeather: (lat: number, lon: number) =>
    authFetch(`${BASE}/api/imagery/weather?lat=${lat}&lon=${lon}`).then((r) => handle<WeatherInfo>(r)),

  // ---- Admin ----
  adminUsers: () => authFetch(`${BASE}/api/admin/users`).then((r) => handle<any[]>(r)),
  
  updateUserRole: (userId: string, role: string) =>
    authFetch(`${BASE}/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).then((r) => handle<any>(r)),
    
  adminImages: () => authFetch(`${BASE}/api/admin/images`).then((r) => handle<AdminImageRow[]>(r)),
  
  adminStats: () => authFetch(`${BASE}/api/admin/stats`).then((r) => handle<AdminStats>(r)),
};

export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  // Check if we need to authenticate asset fetching. Currently they are public in backend?
  // If we need auth for images, we might have to pass token in query param or fetch as blob.
  return `${BASE}${path}`;
}
