"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  UserRound,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Phone,
  Mail,
  Tag,
  Hash,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  order_number: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  product_name: string | null;
  product_size: string | null;
  color: string | null;
  custom_description: string | null;
  amount: number | null;
  status: string;
  created_at: string;
};

type OrderItem = {
  id?: number;
  order_id: number;
  product_id: number | null;
  product_name: string | null;
  colour: string | null;
  size: string | null;
  quantity: number | null;
  unit_price: number | null;
  custom_name: string | null;
  phone_number: string | null;
  pincode: string | null;
};

const ORDER_STATUSES = [
  "New",
  "Confirmed",
  "Printing",
  "Ready for Pickup",
  "Completed",
];

function statusIndex(status: string) {
  const index = ORDER_STATUSES.indexOf(status);
  return index >= 0 ? index : 0;
}

function statusColor(status: string) {
  switch (status) {
    case "New":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20";
    case "Confirmed":
      return "border-blue-500/30 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20";
    case "Printing":
      return "border-purple-500/30 bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20";
    case "Ready for Pickup":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20";
    case "Completed":
      return "border-zinc-500/30 bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20";
    default:
      return "border-white/10 bg-white/5 text-gray-300";
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseDescription(value: string | null) {
  if (!value) return [];

  return value
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^(Name \/ Text to Print|Custom Name|Phone Number to Print|Phone Number|Quantity|Pickup Location|PIN Code|Product ID)\s*:?\s*(.*)$/i
      );

      if (match) {
        return {
          label: match[1],
          value: match[2].trim(),
        };
      }

      return {
        label: "Details",
        value: line,
      };
    });
}

export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setEmail(user.email || "");

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, customer_email, product_name, product_size, color, custom_description, amount, status, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("My orders error:", ordersError);
      setError(ordersError.message);
      setOrders([]);
      setOrderItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const customerOrders = (ordersData || []) as Order[];
    setOrders(customerOrders);

    if (customerOrders.length > 0) {
      const orderIds = customerOrders.map((order) => order.id);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(
          "id, order_id, product_id, product_name, colour, size, quantity, unit_price, custom_name, phone_number, pincode"
        )
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Order items error:", itemsError);
        setOrderItems([]);
      } else {
        setOrderItems((itemsData || []) as OrderItem[]);
      }
    } else {
      setOrderItems([]);
    }

    setLoading(false);
    setRefreshing(false);
  }, [router]);

  useEffect(() => {
    loadOrders();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadOrders, router]);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Sign out error:", signOutError);
      setSigningOut(false);
      alert("Could not sign out. Please try again.");
      return;
    }

    router.replace("/");
  }

  const itemsByOrder = useMemo(() => {
    const map: Record<number, OrderItem[]> = {};

    for (const item of orderItems) {
      const orderId = Number(item.order_id);

      if (!map[orderId]) {
        map[orderId] = [];
      }

      map[orderId].push(item);
    }

    return map;
  }, [orderItems]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="relative flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/20 to-orange-500/5 shadow-lg shadow-orange-500/10">
            <RefreshCw className="h-7 w-7 animate-spin text-orange-500" />
          </div>
          <p className="mt-5 text-sm font-semibold tracking-wide text-gray-400">
            Loading your order history...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black font-sans text-white antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0c0e]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <a
            href="/"
            className="group flex items-center gap-2 text-2xl font-black tracking-tight no-underline text-white sm:text-3xl"
          >
            <span className="transition duration-200 group-hover:text-gray-200">
              Imphal<span className="text-orange-500">3D</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-gray-300 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-300" />
              <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        {/* User Greeting & Stats Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Account Dashboard</span>
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              My Orders
            </h1>

            <p className="mt-2 flex items-center gap-2 break-all text-sm font-medium text-gray-400">
              <Mail className="h-4 w-4 shrink-0 text-gray-500" />
              <span>{email}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111214] px-5 py-3 text-sm font-bold text-gray-300 transition-all duration-200 hover:border-orange-500/40 hover:bg-[#16171a] hover:text-orange-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 text-orange-500 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              {refreshing ? "Refreshing..." : "Refresh Orders"}
            </button>

            <a
              href="/"
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black no-underline shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-400 active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </a>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300 backdrop-blur-sm">
            <ShieldAlert className="h-6 w-6 shrink-0 text-red-400" />
            <div>
              <p className="font-bold">Could not load your orders</p>
              <p className="mt-1 text-sm text-red-200/80">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && orders.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-white/10 bg-[#0b0c0e]/60 p-10 text-center backdrop-blur-md sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              <Package className="h-8 w-8 text-gray-500" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">
              No orders found yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-400">
              Orders placed while signed in will automatically appear here so
              you can follow their live status.
            </p>

            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-black no-underline shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-400 active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </a>
          </div>
        )}

        {/* Orders List */}
        <div className="mt-10 space-y-8">
          {orders.map((order) => {
            const currentIndex = statusIndex(order.status);
            const items = itemsByOrder[order.id] || [];
            const parsedDetails = parseDescription(order.custom_description);

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c0e] shadow-2xl transition duration-300 hover:border-white/20"
              >
                {/* Order Top Banner */}
                <div className="border-b border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent p-5 sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="flex items-center gap-1 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1 font-mono text-xs font-black text-orange-400">
                          <Hash className="h-3.5 w-3.5" />
                          {order.order_number || `#${order.id}`}
                        </span>

                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wider ${statusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                        {order.product_name || "Order Details"}
                      </h2>

                      <p className="mt-1 text-xs font-medium text-gray-500">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/60 p-4 lg:min-w-44 lg:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Total Amount
                      </p>
                      <p className="mt-1 text-2xl font-black text-orange-500">
                        ₹{Number(order.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Order Progress Tracker */}
                  <div className="mt-8 overflow-x-auto pb-2 pt-2">
                    <div className="min-w-[650px] px-2">
                      <div className="flex items-start">
                        {ORDER_STATUSES.map((status, index) => {
                          const complete = index <= currentIndex;
                          const active = index === currentIndex;

                          return (
                            <div
                              key={status}
                              className="relative flex flex-1 flex-col items-center text-center"
                            >
                              {index > 0 && (
                                <div
                                  className={`absolute left-0 right-1/2 top-4 h-[2px] transition-colors duration-300 ${
                                    index <= currentIndex
                                      ? "bg-orange-500"
                                      : "bg-white/10"
                                  }`}
                                />
                              )}

                              {index < ORDER_STATUSES.length - 1 && (
                                <div
                                  className={`absolute left-1/2 right-0 top-4 h-[2px] transition-colors duration-300 ${
                                    index < currentIndex
                                      ? "bg-orange-500"
                                      : "bg-white/10"
                                  }`}
                                />
                              )}

                              <div
                                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                                  complete
                                    ? "border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                                    : "border-white/10 bg-[#111214] text-gray-600"
                                } ${
                                  active
                                    ? "ring-4 ring-orange-500/20 scale-110"
                                    : ""
                                }`}
                              >
                                {complete ? (
                                  <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                                ) : (
                                  <Clock3 className="h-4 w-4" />
                                )}
                              </div>

                              <p
                                className={`mt-3 text-xs font-black tracking-wide ${
                                  active
                                    ? "text-orange-400"
                                    : complete
                                    ? "text-gray-200"
                                    : "text-gray-600"
                                }`}
                              >
                                {status}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Details Grid */}
                <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.3fr_0.7fr]">
                  {/* Left Column: Order Items */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                        <Package className="h-4 w-4 text-orange-500" />
                        Order Items
                      </h3>

                      {items.length > 0 && (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-gray-400">
                          {items.reduce(
                            (total, item) =>
                              total + Number(item.quantity || 0),
                            0
                          )}{" "}
                          {items.reduce(
                            (total, item) =>
                              total + Number(item.quantity || 0),
                            0
                          ) === 1
                            ? "item"
                            : "items"}
                        </span>
                      )}
                    </div>

                    {items.length > 0 ? (
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div
                            key={
                              item.id ??
                              `${order.id}-${item.product_id}-${index}`
                            }
                            className="group rounded-2xl border border-white/10 bg-black/60 p-4 transition duration-200 hover:border-white/20"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="font-bold text-white group-hover:text-orange-400 transition">
                                  {item.product_name || "Product"}
                                </p>

                                <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                                  {item.colour && (
                                    <span className="rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-gray-300">
                                      Colour:{" "}
                                      <strong className="text-white">
                                        {item.colour}
                                      </strong>
                                    </span>
                                  )}

                                  {item.size && (
                                    <span className="rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-gray-300">
                                      Size:{" "}
                                      <strong className="text-white">
                                        {item.size}
                                      </strong>
                                    </span>
                                  )}

                                  <span className="rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-gray-300">
                                    Qty:{" "}
                                    <strong className="text-white">
                                      {Number(item.quantity || 0)}
                                    </strong>
                                  </span>
                                </div>

                                {(item.custom_name ||
                                  item.phone_number ||
                                  item.pincode) && (
                                  <div className="mt-3 space-y-1 rounded-xl bg-white/[0.02] p-3 text-xs text-gray-400 border border-white/5">
                                    {item.custom_name && (
                                      <p>
                                        <span className="font-medium text-gray-500">
                                          Custom Name:
                                        </span>{" "}
                                        <span className="font-semibold text-gray-200">
                                          {item.custom_name}
                                        </span>
                                      </p>
                                    )}

                                    {item.phone_number && (
                                      <p>
                                        <span className="font-medium text-gray-500">
                                          Phone to Print:
                                        </span>{" "}
                                        <span className="font-semibold text-gray-200">
                                          {item.phone_number}
                                        </span>
                                      </p>
                                    )}

                                    {item.pincode && (
                                      <p>
                                        <span className="font-medium text-gray-500">
                                          PIN Code:
                                        </span>{" "}
                                        <span className="font-semibold text-gray-200">
                                          {item.pincode}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="shrink-0 sm:text-right">
                                <p className="text-base font-black text-orange-500">
                                  ₹
                                  {(
                                    Number(item.unit_price || 0) *
                                    Number(item.quantity || 0)
                                  ).toLocaleString("en-IN")}
                                </p>

                                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                                  ₹
                                  {Number(
                                    item.unit_price || 0
                                  ).toLocaleString("en-IN")}{" "}
                                  each
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
                        <p className="font-bold text-gray-200">
                          {order.product_name || "Order Details"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {order.product_size && (
                            <span className="rounded-md bg-white/5 px-2.5 py-1 text-gray-300">
                              Size: {order.product_size}
                            </span>
                          )}

                          {order.color && (
                            <span className="rounded-md bg-white/5 px-2.5 py-1 text-gray-300">
                              Colour: {order.color}
                            </span>
                          )}
                        </div>

                        {parsedDetails.length > 0 && (
                          <div className="mt-4 space-y-2 rounded-xl bg-white/[0.02] p-3 border border-white/5">
                            {parsedDetails.map((detail, index) => (
                              <p
                                key={`${detail.label}-${index}`}
                                className="text-xs text-gray-400"
                              >
                                <span className="font-medium text-gray-500">
                                  {detail.label}:
                                </span>{" "}
                                <span className="text-gray-200">
                                  {detail.value}
                                </span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Customer & Shipping Details */}
                  <div className="space-y-4">
                    {/* Customer Card */}
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                        <UserRound className="h-4 w-4 text-orange-500" />
                        Customer Information
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <p className="font-bold text-white text-base">
                          {order.customer_name}
                        </p>

                        <p className="flex items-center gap-2 text-sm font-medium text-gray-400">
                          <Phone className="h-3.5 w-3.5 text-gray-500" />
                          <span>{order.customer_phone}</span>
                        </p>

                        {order.customer_email && (
                          <p className="flex items-center gap-2 break-all text-xs font-medium text-gray-500">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                            <span>{order.customer_email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pickup Card */}
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        Pickup Location
                      </div>

                      {parsedDetails.filter(
                        (detail) =>
                          detail.label.toLowerCase() === "pickup location" ||
                          detail.label.toLowerCase() === "pin code"
                      ).length > 0 ? (
                        <div className="mt-3 space-y-1.5">
                          {parsedDetails
                            .filter(
                              (detail) =>
                                detail.label.toLowerCase() ===
                                  "pickup location" ||
                                detail.label.toLowerCase() === "pin code"
                            )
                            .map((detail, index) => (
                              <p
                                key={`${detail.label}-${index}`}
                                className="text-sm text-gray-300"
                              >
                                <span className="font-semibold text-gray-500">
                                  {detail.label}:
                                </span>{" "}
                                {detail.value}
                              </p>
                            ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs leading-relaxed text-gray-500">
                          Pickup details are configured according to your order record.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="border-t border-white/10 bg-[#08090a] px-5 py-4 sm:px-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-gray-500">
                      Order Reference:{" "}
                      <span className="text-gray-300">
                        {order.order_number || `#${order.id}`}
                      </span>
                    </p>

                    <a
                      href={`/track-order?order=${encodeURIComponent(
                        order.order_number || String(order.id)
                      )}`}
                      className="group inline-flex items-center gap-2 text-xs font-black text-orange-400 no-underline transition hover:text-orange-300"
                    >
                      <Package className="h-4 w-4 text-orange-500 transition group-hover:scale-110" />
                      <span>Open Guest Tracking View</span>
                      <ChevronRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}