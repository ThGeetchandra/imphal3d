"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  PackageSearch,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CustomerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        router.replace("/my-orders");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setInfo("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (loginError) {
      const message = loginError.message.toLowerCase();

      if (
        message.includes("email not confirmed") ||
        message.includes("email confirmation")
      ) {
        setError(
          "Your email address has not been confirmed yet. Please check your email and confirm your account before signing in."
        );
      } else if (
        message.includes("invalid login credentials") ||
        message.includes("invalid credentials")
      ) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(loginError.message);
      }

      setLoading(false);
      return;
    }

    router.replace("/my-orders");
  }

  async function handleForgotPassword() {
    setError("");
    setInfo("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }

    setLoading(true);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo: `${siteUrl.replace(/\/$/, "")}/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setInfo(
      "If an account exists for this email, we have sent a password reset link. Please check your inbox and spam folder."
    );
    setLoading(false);
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 font-sans text-white">
        <div className="relative flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/20 to-orange-500/5 shadow-lg shadow-orange-500/10">
            <RefreshCw className="h-7 w-7 animate-spin text-orange-500" />
          </div>
          <p className="mt-5 text-sm font-semibold tracking-wide text-gray-400">
            Checking your session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black font-sans text-white antialiased selection:bg-orange-500 selection:text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0c0e]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-2xl font-black tracking-tight no-underline text-white sm:text-3xl"
          >
            <span className="transition duration-200 group-hover:text-gray-200">
              Imphal<span className="text-orange-500">3D</span>
            </span>
          </Link>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 no-underline transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180 text-gray-400 transition group-hover:-translate-x-1 group-hover:text-white" />
            <span>Back to Website</span>
          </Link>
        </div>
      </header>

      {/* LOGIN AREA */}
      <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-12 sm:px-6 sm:py-16">
        {/* Background Ambient Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="w-full max-w-md">
          {/* TITLE HEADER */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/20 to-orange-500/5 shadow-lg shadow-orange-500/10">
              <UserRound className="h-8 w-8 text-orange-500" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Customer Portal</span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm font-medium text-gray-400">
              Sign in to manage and track your 3D orders.
            </p>
          </div>

          {/* LOGIN FORM CARD */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111214] shadow-2xl backdrop-blur-md">
            <form onSubmit={handleLogin} className="p-6 sm:p-8">
              <div className="space-y-5">
                {/* EMAIL FIELD */}
                <div>
                  <label
                    htmlFor="customer-email"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                  >
                    Email Address
                  </label>

                  <div className="relative flex items-center">
                    <Mail className="pointer-events-none absolute left-4 h-5 w-5 text-gray-500" />
                    <input
                      id="customer-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        setInfo("");
                      }}
                      placeholder="name@example.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#08090a] py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-gray-600 outline-none transition duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="customer-password"
                      className="text-xs font-bold uppercase tracking-wider text-gray-400"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-xs font-bold text-orange-500 transition hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <KeyRound className="pointer-events-none absolute left-4 h-5 w-5 text-gray-500" />
                    <input
                      id="customer-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                        setInfo("");
                      }}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#08090a] py-3.5 pl-11 pr-12 text-sm font-medium text-white placeholder:text-gray-600 outline-none transition duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ERROR STATE */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium leading-relaxed text-red-300"
                >
                  <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
                  <div>{error}</div>
                </div>
              )}

              {/* INFO STATE */}
              {info && (
                <div
                  role="status"
                  className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium leading-relaxed text-emerald-300"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <div>{info}</div>
                </div>
              )}

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                <span>{loading ? "Signing in..." : "Sign In"}</span>
              </button>

              {/* SIGN UP REDIRECT */}
              <div className="mt-6 text-center text-xs font-semibold text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-orange-500 no-underline transition hover:text-orange-400 hover:underline"
                >
                  Create Account
                </Link>
              </div>
            </form>
          </div>

          {/* GUEST TRACKING BOX */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#111214] p-5 text-center shadow-lg transition duration-200 hover:border-white/20">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <PackageSearch className="h-4 w-4 text-orange-500" />
              <span>Quick Track</span>
            </div>

            <p className="mt-1.5 text-xs text-gray-400">
              Want to check an order status without signing in?
            </p>

            <Link
              href="/track-order"
              className="group mt-3 inline-flex items-center gap-1.5 text-xs font-black text-white no-underline transition hover:text-orange-400"
            >
              <span>Track Order with Order Number</span>
              <ArrowRight className="h-3.5 w-3.5 text-orange-500 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}