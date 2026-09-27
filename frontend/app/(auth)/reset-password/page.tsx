"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Satellite, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({ token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-[#5E8C61]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-[#5E8C61]" />
        </div>
        <h2 className="text-xl font-semibold text-[#182438] mb-2">Password reset successful</h2>
        <p className="text-sm text-[#59636E] mb-6">
          You can now sign in with your new password. Redirecting to login...
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full py-2.5 rounded-md border border-[#D9D5CC] text-[#182438] text-sm font-medium hover:bg-[#F5F3EE] transition-all"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <>
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
        <h1 className="text-2xl font-semibold text-[#182438]">Set New Password</h1>
        <p className="text-sm text-[#59636E] mt-2">Please enter your new password below.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-md bg-[#B85C5C]/10 border border-[#B85C5C]/30 flex items-start gap-3 text-[#B85C5C]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#182438] uppercase tracking-wide mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            disabled={!token}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md border border-[#D9D5CC] bg-white text-[#172033] text-sm outline-none focus:border-[#315FA8] focus:ring-1 focus:ring-[#315FA8] transition-all disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#182438] uppercase tracking-wide mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            required
            disabled={!token}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md border border-[#D9D5CC] bg-white text-[#172033] text-sm outline-none focus:border-[#315FA8] focus:ring-1 focus:ring-[#315FA8] transition-all disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-md bg-[#182438] text-white text-sm font-medium hover:bg-[#243451] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Reset Password
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-4 font-sans selection:bg-[#315FA8]/20 selection:text-[#315FA8]">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#D9D5CC] shadow-sm p-8">
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#315FA8]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
