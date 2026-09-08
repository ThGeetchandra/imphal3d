"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  Loader2, 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle,
  Sparkles 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CustomerSignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        router.push("/my-orders");
        return;
      }

      setSuccess(
        "Account created successfully. Please check your email to confirm your account."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-orange-500 selection:text-black">
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-orange-500/10 blur-[120px]" />
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111214]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-1 text-2xl font-black tracking-tight">
            <span>Imphal</span>
            <span className="text-orange-500 transition-transform group-hover:scale-110">3D</span>
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to Website</span>
          </Link>
        </div>
      </header>

      {/* SIGNUP AREA */}
      <section className="relative z-10 flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* TITLE & EMBEDDED ICON HEADER */}
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/20 to-orange-500/5 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
              <div className="absolute inset-0 rounded-2xl bg-orange-500/10 blur-sm" />
              <UserPlus size={36} className="relative z-10 text-orange-500 drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]" />
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black border border-orange-500/40 text-orange-400">
                <Sparkles size={12} />
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Create an account to easily track your orders.
            </p>
          </div>

          {/* FORM CARD */}
          <form
            onSubmit={handleSignup}
            className="rounded-3xl border border-white/10 bg-[#111214] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#08090a] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#08090a] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Must contain at least 6 characters.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#08090a] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-relaxed text-red-400">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS ALERT */}
            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-relaxed text-emerald-400">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-7 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-black transition duration-200 hover:bg-orange-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {/* LOGIN LINK */}
            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-500 transition hover:text-orange-400 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </form>

          {/* GUEST TRACKING CARD */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#111214]/60 p-5 text-center backdrop-blur-md">
            <p className="text-sm text-gray-400">
              Don't want to create an account?
            </p>
            <Link
              href="/track-order"
              className="group mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition hover:text-orange-500"
            >
              <span>Track Order with Order Number</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}