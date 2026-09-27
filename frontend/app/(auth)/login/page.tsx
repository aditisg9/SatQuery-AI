"use client";

import { useState } from "react";
import Link from "next/link";
import { Satellite, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      
      const res = await api.login(params);
      await login(res.access_token);
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-4 font-sans selection:bg-[#315FA8]/20 selection:text-[#315FA8]">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#D9D5CC] shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-6">
            <div className="relative flex items-center justify-center w-8 h-8 rounded border border-[#315FA8]/40 bg-[#315FA8]/10">
              <Satellite className="w-4 h-4 text-[#315FA8]" />
            </div>
            <div className="font-display leading-tight">
              <div className="text-sm font-semibold tracking-wide text-[#182438]">SatQuery</div>
              <div className="text-[10px] font-mono text-[#315FA8] tracking-[0.2em] uppercase">AI · GEOINT</div>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-[#182438]">Welcome back</h1>
          <p className="text-sm text-[#59636E] mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-[#B85C5C]/10 border border-[#B85C5C]/30 flex items-start gap-3 text-[#B85C5C]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#182438] uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-[#D9D5CC] bg-white text-[#172033] text-sm outline-none focus:border-[#315FA8] focus:ring-1 focus:ring-[#315FA8] transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#182438] uppercase tracking-wide">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#315FA8] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-[#D9D5CC] bg-white text-[#172033] text-sm outline-none focus:border-[#315FA8] focus:ring-1 focus:ring-[#315FA8] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#182438] text-white text-sm font-medium hover:bg-[#243451] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#59636E]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#315FA8] font-medium hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
