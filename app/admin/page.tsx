"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Package,
  ShoppingBag,
  IndianRupee,
  ArrowUpRight,
  LogOut,
  Layers,
  Sparkles,
  ChevronRight,
  Clock,
  User,
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

export default function AdminDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [latestOrders, setLatestOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email || "");

      const { data: orders } = await supabase
        .from("orders")
        .select(
          "id, order_number, customer_name, product_name, amount, status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5);

      setLatestOrders((orders || []) as Order[]);
      setChecking(false);
    }

    checkAdmin();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

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

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] text-white">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-[#111214] p-8 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500" />
            <Box className="absolute h-4 w-4 text-orange-500" />
          </div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Loading Admin Panel...
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
              <Box className="h-5 w-5 stroke-[2.2]" />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight leading-none flex items-center gap-1">
                Imphal<span className="text-orange-500">3D</span>
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Admin Control Panel
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
      <section className="mx-auto flex max-w-7xl flex-col justify-center px-6 py-12 lg:py-16">
        {/* WELCOME BANNER */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-[#111214] p-8 md:p-12 shadow-2xl">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-[11px] font-bold tracking-wider text-orange-400 uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Core Operations
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-white">
                Welcome Back
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
                Select an operational module below to oversee your store, trace production workflows, or inspect financial targets.
              </p>
            </div>
          </div>
        </div>

        {/* MANAGEMENT CARDS GRID */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* ORDERS CARD */}
          <Link
            href="/admin/orders"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#111214] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-[#151619] hover:shadow-2xl hover:shadow-orange-500/5"
          >
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-orange-500/5 blur-2xl group-hover:bg-orange-500/10 transition duration-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500 shadow-lg shadow-orange-500/5 transition duration-300 group-hover:scale-110">
                  <Package className="h-7 w-7 stroke-[2]" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-gray-400 transition duration-300 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 group-hover:text-orange-400">
                  <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>

              <h2 className="mt-8 text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition duration-200">
                Orders Management
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-400">
                View customer orders, verify details, update status, and track delivery progress.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-500 group-hover:translate-x-1 transition duration-200">
              <span>Open Orders</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>

          {/* PRODUCTS CARD */}
          <Link
            href="/admin/products"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#111214] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-[#151619] hover:shadow-2xl hover:shadow-orange-500/5"
          >
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-orange-500/5 blur-2xl group-hover:bg-orange-500/10 transition duration-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500 shadow-lg shadow-orange-500/5 transition duration-300 group-hover:scale-110">
                  <ShoppingBag className="h-7 w-7 stroke-[2]" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-gray-400 transition duration-300 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 group-hover:text-orange-400">
                  <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>

              <h2 className="mt-8 text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition duration-200">
                Product Overview
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-400">
                Add products, edit pricing, manage colors, sizes, gallery images, and stock.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-500 group-hover:translate-x-1 transition duration-200">
              <span>Open Products</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>

          {/* FINANCIAL CARD */}
          <Link
            href="/admin/revenue"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#111214] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-[#151619] hover:shadow-2xl hover:shadow-orange-500/5"
          >
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-orange-500/5 blur-2xl group-hover:bg-orange-500/10 transition duration-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500 shadow-lg shadow-orange-500/5 transition duration-300 group-hover:scale-110">
                  <IndianRupee className="h-7 w-7 stroke-[2]" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-gray-400 transition duration-300 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 group-hover:text-orange-400">
                  <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>

              <h2 className="mt-8 text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition duration-200">
                Financial Analytics
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-400">
                View total revenue, completed settlements, performance metrics, and transaction history.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-500 group-hover:translate-x-1 transition duration-200">
              <span>Open Revenue</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        </div>

        {/* LATEST ORDERS SECTION */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#111214] shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500">
                Real-Time Stream
              </p>
              <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-white">
                Latest Orders
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-gray-300 transition duration-200 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 active:scale-95"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {latestOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <Package className="h-10 w-10 text-gray-600 mb-2" />
              <p className="text-xs text-gray-400 font-medium">No orders recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {latestOrders.map((order) => {
                const status = order.status || "New";

                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 px-6 py-4.5 transition duration-150 hover:bg-white/[0.02] md:flex-row md:items-center md:justify-between md:px-8"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-orange-400">
                          {order.order_number || `#${order.id}`}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize tracking-wide ${getStatusBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-white">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{order.customer_name}</span>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {order.product_name || "Custom Order"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-6 md:justify-end">
                      <div className="text-left md:text-right">
                        <p className="text-base font-black text-orange-400">
                          ₹{Number(order.amount || 0).toLocaleString("en-IN")}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500 md:justify-end">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(order.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}