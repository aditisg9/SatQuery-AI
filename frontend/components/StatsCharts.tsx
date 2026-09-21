"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import type { ChangeStat, ClassStat } from "@/lib/types";

export function ClassStatsChart({ stats }: { stats: ClassStat[] }) {
  const data = stats.filter((s) => s.pixel_percentage > 0);
  return (
    <div className="rounded-lg border border-panel-border bg-panel/50 p-4 transition-all duration-200 hover:border-signal/40 hover:shadow-glow">
      <div className="font-mono-ui text-xs tracking-wider text-ink-muted uppercase mb-3">
        Land-Cover Breakdown
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2942" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#7C8BA3", fontSize: 11 }} unit="%" />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fill: "#E8EDF4", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: "#101A2B", border: "1px solid #223148", fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, "Coverage"]}
          />
          <Bar dataKey="pixel_percentage" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChangeStatsChart({ stats }: { stats: ChangeStat[] }) {
  const data = stats.map((s) => ({
    label: s.label,
    Before: s.before_pixel_percentage,
    After: s.after_pixel_percentage,
    color: s.color,
  }));
  return (
    <div className="rounded-lg border border-panel-border bg-panel/50 p-4 transition-all duration-200 hover:border-signal/40 hover:shadow-glow">
      <div className="font-mono-ui text-xs tracking-wider text-ink-muted uppercase mb-3">
        Before vs After
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2942" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#7C8BA3", fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis tick={{ fill: "#7C8BA3", fontSize: 11 }} unit="%" />
          <Tooltip contentStyle={{ background: "#101A2B", border: "1px solid #223148", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#7C8BA3" }} />
          <Bar dataKey="Before" fill="#5B6B85" radius={[3, 3, 0, 0]} />
          <Bar dataKey="After" fill="#4FD1C5" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
