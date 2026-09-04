"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#111214]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <a
            href="/"
            className="text-3xl font-black"
          >
            Imphal
            <span className="text-orange-500">
              3D
            </span>
          </a>

          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to Website
          </a>

        </div>
      </header>


      {/* LOGIN AREA */}
      <section className="flex min-h-[calc(100vh-85px)] items-center justify-center px-5">

        <div className="w-full max-w-md">

          <div className="mb-8 text-center">

            <div className="mb-4 text-5xl">
              🔐
            </div>

            <h1 className="text-4xl font-black">
              Admin Login
            </h1>

            <p className="mt-3 text-gray-500">
              Sign in to manage your Imphal3D orders.
            </p>

          </div>


          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-white/10 bg-[#111214] p-7"
          >

            {/* EMAIL */}
            <label className="mb-2 block text-sm font-semibold text-gray-400">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Admin email"
              autoComplete="email"
              required
              className="mb-5 w-full rounded-xl border border-white/10 bg-[#08090a] px-4 py-4 text-white outline-none transition focus:border-orange-500"
            />


            {/* PASSWORD */}
            <label className="mb-2 block text-sm font-semibold text-gray-400">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/10 bg-[#08090a] px-4 py-4 text-white outline-none transition focus:border-orange-500"
            />


            {/* ERROR */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}


            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

        </div>

      </section>

    </main>
  );
}