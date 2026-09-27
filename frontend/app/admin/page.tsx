"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ShieldCheck, MapPin, Upload, Globe2, Users, Loader2 } from "lucide-react";
import Shell from "@/components/Shell";
import { api, assetUrl } from "@/lib/api";
import type { AdminImageRow, AdminStats } from "@/lib/types";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [rows, setRows] = useState<AdminImageRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.adminImages(), api.adminStats(), api.adminUsers()])
      .then(([r, s, u]) => {
        setRows(r);
        setStats(s);
        setUsers(u);
      })
      .finally(() => setLoading(false));
  };
  
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.updateUserRole(userId, newRole);
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to update role");
    }
  };

  if (authLoading || (user && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <Loader2 className="w-8 h-8 text-[#315FA8] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Shell title="Admin" subtitle="Every image in the system — uploaded or auto-fetched">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl font-semibold text-ink">Data Oversight</h2>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatTile icon={Users} label="Total Users" value={users.length} />
            <StatTile icon={Globe2} label="Total Images" value={stats.total_images} />
            <StatTile icon={Upload} label="Uploaded" value={stats.uploaded_count} />
            <StatTile icon={MapPin} label="Auto-Fetched" value={stats.fetched_count} accent="warning" />
            <StatTile icon={ShieldCheck} label="Georeferenced" value={stats.georeferenced_count} />
          </div>
        )}
        
        {/* Users Table */}
        <div className="rounded-xl border border-panel-border bg-panel shadow-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-panel-border bg-panel-header">
            <h2 className="font-semibold text-ink">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-panel-border text-ink-muted">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-panel-border last:border-0 hover:bg-black/5">
                    <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-5 py-3 text-ink-muted">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-[#315FA8]/10 text-[#315FA8]' : 'bg-gray-100 text-gray-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.id !== user.id && (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border border-panel-border rounded px-2 py-1 bg-white"
                        >
                          <option value="USER">Make USER</option>
                          <option value="ADMIN">Make ADMIN</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-panel-border bg-panel shadow-panel overflow-hidden">
          <div className="px-5 py-3 border-b border-panel-border">
            <span className="font-mono-ui text-xs tracking-[0.15em] text-ink-muted uppercase">
              Image Log
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-ink-muted">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-ink-muted">
              No images in the system yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono-ui text-ink-muted uppercase tracking-wide border-b border-panel-border">
                    <th className="px-5 py-2.5 font-normal">Image</th>
                    <th className="px-5 py-2.5 font-normal">Name / Place</th>
                    <th className="px-5 py-2.5 font-normal">Source</th>
                    <th className="px-5 py-2.5 font-normal">Coordinates</th>
                    <th className="px-5 py-2.5 font-normal">Georeferenced</th>
                    <th className="px-5 py-2.5 font-normal">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-panel-border/60 last:border-0 hover:bg-panel-raised transition-colors"
                    >
                      <td className="px-5 py-2.5">
                        {r.thumbnail_url ? (
                          <img
                            src={assetUrl(r.thumbnail_url)}
                            alt={r.filename}
                            className="w-12 h-12 object-cover rounded-md border border-panel-border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-panel-raised border border-panel-border" />
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-ink truncate max-w-[220px]">
                        {r.place_name || r.filename}
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono-ui uppercase tracking-wide border ${
                            r.source === "fetched"
                              ? "border-warning/40 text-warning bg-warning/10"
                              : "border-primary/40 text-primary bg-primary/10"
                          }`}
                        >
                          {r.source === "fetched" ? (
                            <MapPin className="w-3 h-3" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          {r.source}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 font-mono-ui text-[11px] text-ink-muted">
                        {r.query_lat != null ? `${r.query_lat.toFixed(4)}, ${r.query_lon?.toFixed(4)}` : "—"}
                      </td>
                      <td className="px-5 py-2.5">
                        {r.has_geo_metadata ? (
                          <span className="text-primary text-xs">Yes</span>
                        ) : (
                          <span className="text-ink-muted text-xs">No</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 font-mono-ui text-[11px] text-ink-muted whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent = "signal",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: "signal" | "warning";
}) {
  return (
    <div className="rounded-lg border border-panel-border bg-panel p-4 flex items-center gap-3 transition-all duration-200 hover:border-primary/50 hover:bg-panel-raised hover:shadow-sm hover:-translate-y-0.5 cursor-default group">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
          accent === "warning" ? "bg-warning/10 border border-warning/30" : "bg-primary/10 border border-primary/30"
        }`}
      >
        <Icon className={`w-4.5 h-4.5 ${accent === "warning" ? "text-warning" : "text-primary"}`} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-display font-semibold text-ink">{value}</div>
        <div className="text-[11px] text-ink-muted truncate">{label}</div>
      </div>
    </div>
  );
}
