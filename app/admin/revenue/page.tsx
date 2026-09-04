"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  IndianRupee,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
  LogOut,
  Layers,
  Sparkles,
  ChevronRight,
  Wallet,
} from "lucide-react";

type Order = {
  id: number;
  order_number: string | null;
  customer_name: string;
  product_name: string | null;
  amount: number | null;
  status: string;
  created_at: string;
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function AdminRevenuePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email || "");
      await loadRevenue();
    }

    init();
  }, [router]);

  async function loadRevenue() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, product_name, amount, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error(fetchError);
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setOrders((data || []) as Order[]);
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  const metrics = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);

    const start7Days = new Date(now);
    start7Days.setDate(start7Days.getDate() - 6);
    start7Days.setHours(0, 0, 0, 0);

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = new Date(now.getFullYear(), 0, 1);

    const amount = (order: Order) => Number(order.amount) || 0;
    const date = (order: Order) => new Date(order.created_at);

    const total = orders.reduce((sum, order) => sum + amount(order), 0);
    const completed = orders
      .filter((order) => order.status.toLowerCase() === "completed")
      .reduce((sum, order) => sum + amount(order), 0);
    const today = orders
      .filter((order) => date(order) >= startToday)
      .reduce((sum, order) => sum + amount(order), 0);
    const last7Days = orders
      .filter((order) => date(order) >= start7Days)
      .reduce((sum, order) => sum + amount(order), 0);
    const month = orders
      .filter((order) => date(order) >= startMonth)
      .reduce((sum, order) => sum + amount(order), 0);
    const year = orders
      .filter((order) => date(order) >= startYear)
      .reduce((sum, order) => sum + amount(order), 0);

    return { total, completed, today, last7Days, month, year };
  }, [orders]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "printing":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "ready for pickup":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "completed":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-white/5 text-gray-300 border-white/10";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] text-white">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-[#111214] p-8 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500" />
            <IndianRupee className="absolute h-4 w-4 text-orange-500" />
          </div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Loading Revenue Metrics...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090a] text-white selection:bg-orange-500/30 selection:text-orange-200 antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-[#111214]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/5 transition duration-300 hover:scale-105">
              <Wallet className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight leading-none flex items-center gap-1">
                Imphal<span className="text-orange-500">3D</span>
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Financial Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-xl border border-white/10 bg-[#08090a]/50 px-3.5 py-2 text-xs font-medium text-gray-300 md:flex shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{email}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 hover:shadow-lg hover:shadow-red-500/5 active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* BACK NAVIGATION */}
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111214] px-4 py-2 text-xs font-bold text-gray-300 transition duration-200 hover:border-orange-500/30 hover:bg-white/5 hover:text-orange-400 shadow-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Executive Dashboard</span>
        </button>

        {/* TITLE BLOCK */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-orange-400 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Financial Stream
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl text-white">
              Revenue Insights
            </h1>
            <p className="mt-1.5 text-xs text-gray-400 max-w-lg leading-relaxed">
              Granular breakdown of operational income, target periods, and completed settlements.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRevenue}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111214] px-4 py-2.5 text-xs font-bold text-gray-300 transition duration-200 hover:border-orange-500/30 hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5 text-orange-500" />
            <span>Sync Revenue</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
            <span>Could not load revenue data: {error}</span>
          </div>
        )}

        {/* METRICS CARDS GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* All-time Sales */}
          <div className="group relative overflow-hidden rounded-2xl border border-orange-500/30 bg-[#111214] p-5 shadow-xl transition-all duration-300 hover:border-orange-500/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">All-Time Gross Sales</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 transition duration-300 group-hover:scale-110">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-orange-500">
              {money(metrics.total)}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Aggregated total across all logged transactions
            </p>
          </div>

          {/* Completed Revenue */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#111214] p-5 shadow-xl transition-all duration-300 hover:border-emerald-500/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Completed Settlements</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 transition duration-300 group-hover:scale-110">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-emerald-400">
              {money(metrics.completed)}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Orders marked as fulfilled and delivered
            </p>
          </div>

          {/* Today */}
          <div className="group relative overflow-hidden rounded-2xl border border-sky-500/30 bg-[#111214] p-5 shadow-xl transition-all duration-300 hover:border-sky-500/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Today's Revenue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 transition duration-300 group-hover:scale-110">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-sky-400">
              {money(metrics.today)}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Revenue generated since 00:00 today
            </p>
          </div>

          {/* Last 7 Days */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111214] p-5 shadow-xl transition-all duration-300 hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Last 7 Days</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 transition duration-300 group-hover:scale-110">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-white">
              {money(metrics.last7Days)}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Rolling 7-day revenue window
            </p>
          </div>

          {/* This Month */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111214] p-5 shadow-xl transition-all duration-300 hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Current Month</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 transition duration-300 group-hover:scale-110">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-white">
              {money(metrics.month)}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Accumulated revenue for this calendar month
            </p>
          </div>

          {/* This Year */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111214] p-5 shadow-xl transition-all duration-300 hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Current Year</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 transition duration-300 group-hover:scale-110">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-white">
              {money(metrics.year)}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Accumulated revenue for this calendar year
            </p>
          </div>
        </div>

        {/* TRANSACTIONS TABLE SECTION */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#111214] p-6 md:p-7 shadow-2xl">
          <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-orange-500 uppercase">
                Audit Trail
              </p>
              <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-white">
                Recent Sales Transactions
              </h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-12 text-center text-xs text-gray-500">
              No orders recorded yet.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-[#08090a]/40">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#08090a]/80 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Item</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {orders.slice(0, 15).map((order) => (
                    <tr
                      key={order.id}
                      className="transition duration-150 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-orange-400">
                        {order.order_number || `#${order.id}`}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-200">
                        {order.customer_name}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-400">
                        {order.product_name || "Custom Order"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize tracking-wide ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right font-black text-orange-500">
                        {money(Number(order.amount) || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}