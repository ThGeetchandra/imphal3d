"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      /*
       * Supabase puts the recovery session in the browser when the
       * password-reset link is opened.
       *
       * We listen for PASSWORD_RECOVERY and also check the current
       * session in case the event has already fired.
       */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setRecoveryReady(true);
        setError("");
        setCheckingSession(false);
      } else {
        /*
         * Give Supabase a moment to process the recovery URL.
         */
        setTimeout(async () => {
          if (!mounted) return;

          const {
            data: { session: latestSession },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          if (latestSession) {
            setRecoveryReady(true);
            setError("");
          } else {
            setError(
              "This password reset link is invalid or has expired. Please request a new reset link."
            );
          }

          setCheckingSession(false);
        }, 1000);
      }
    }

    prepareRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
        setError("");
        setCheckingSession(false);
      }

      if (event === "SIGNED_IN" && session) {
        setRecoveryReady(true);
        setError("");
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!recoveryReady) {
      setError(
        "Your password reset session is not ready. Please open the reset link from your email again."
      );
      return;
    }

    if (password.length < 6) {
      setError("Your new password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Make sure the recovery session still exists.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "Your password reset session has expired. Please request a new reset link."
        );
        setLoading(false);
        return;
      }

      /*
       * Update the password of the currently authenticated
       * recovery user.
       */
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      /*
       * Keep the user logged in and take them directly
       * to their orders.
       */
      setTimeout(() => {
        router.replace("/my-orders");
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        "Something went wrong while changing your password. Please try again."
      );

      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 font-sans text-white">
        <div className="relative flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/20 to-orange-500/5 shadow-lg shadow-orange-500/10">
            <RefreshCw className="h-7 w-7 animate-spin text-orange-500" />
          </div>
          <p className="mt-5 text-sm font-semibold tracking-wide text-gray-400">
            Verifying password reset link...
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
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 no-underline transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-gray-400 transition group-hover:-translate-x-1 group-hover:text-white" />
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* RESET PASSWORD AREA */}
      <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-12 sm:px-6 sm:py-16">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="w-full max-w-md">
          {/* TITLE HEADER */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/20 to-orange-500/5 shadow-lg shadow-orange-500/10">
              {success ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              ) : (
                <KeyRound className="h-8 w-8 text-orange-500" />
              )}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Account Security</span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {success ? "Password Updated" : "Reset Password"}
            </h1>

            <p className="mt-2 text-sm font-medium text-gray-400">
              {success
                ? "Your password has been changed successfully."
                : "Create a new password for your Imphal3D account."}
            </p>
          </div>

          {/* STATE CARDS */}
          {success ? (
            /* SUCCESS STATE */
            <div className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#111214] p-6 text-center shadow-2xl backdrop-blur-md sm:p-8">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left text-xs font-medium leading-relaxed text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  Your password has been updated successfully.
                  <br />
                  Taking you to My Orders...
                </div>
              </div>

              <Link
                href="/my-orders"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-400 active:scale-[0.98]"
              >
                <span>Go to My Orders</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          ) : !recoveryReady ? (
            /* INVALID / EXPIRED LINK STATE */
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111214] p-6 shadow-2xl backdrop-blur-md sm:p-8">
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium leading-relaxed text-red-300">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
                <div>{error}</div>
              </div>

              <Link
                href="/login"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-400 active:scale-[0.98]"
              >
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            /* PASSWORD FORM */
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111214] shadow-2xl backdrop-blur-md">
              <form onSubmit={handleResetPassword} className="p-6 sm:p-8">
                <div className="space-y-5">
                  {/* NEW PASSWORD */}
                  <div>
                    <label
                      htmlFor="new-password"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                    >
                      New Password
                    </label>

                    <div className="relative flex items-center">
                      <Lock className="pointer-events-none absolute left-4 h-5 w-5 text-gray-500" />
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        minLength={6}
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

                    <p className="mt-2 text-[11px] font-medium text-gray-500">
                      Must contain at least 6 characters.
                    </p>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                    >
                      Confirm New Password
                    </label>

                    <div className="relative flex items-center">
                      <Lock className="pointer-events-none absolute left-4 h-5 w-5 text-gray-500" />
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#08090a] py-3.5 pl-11 pr-12 text-sm font-medium text-white placeholder:text-gray-600 outline-none transition duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ERROR ALERT */}
                {error && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium leading-relaxed text-red-300"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <div>{error}</div>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  <span>{loading ? "Updating Password..." : "Update Password"}</span>
                </button>

                {/* FOOTER LINK */}
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-gray-500 no-underline transition hover:text-orange-500"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}