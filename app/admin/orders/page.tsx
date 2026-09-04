"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Package,
  Search,
  RefreshCw,
  LogOut,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  Inbox,
  Filter,
  X,
  User,
  Phone,
  Mail,
  Tag,
  FileText,
  CreditCard,
  IndianRupee,
  ChevronRight,
  Layers,
} from "lucide-react";

type Order = {
  id: number;
  order_number: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  product_name: string | null;
  product_size: string | null;
  color: string;
  custom_description: string | null;
  transaction_id: string | null;
  reference_photo_url: string | null;
  amount: number | null;
  status: string;
  created_at: string;
  phone_number_to_print?: string | null;
};

function formatCustomerRequest(value: string | null) {
  if (!value) return [];

  let text = value
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  const labels = [
    "Name / Text to Print",
    "Custom Name",
    "Phone Number to Print",
    "Phone Number",
    "Quantity",
    "Pickup Location",
    "PIN Code",
    "Product ID",
  ];

  for (const label of labels) {
    text = text.replace(
      new RegExp(`\\s*${label}\\s*:?\\s*`, "gi"),
      `\n${label}: `
    );
  }

  return text
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
        label: "Customer Request",
        value: line,
      };
    });
}

function statusClass(status: string) {
  switch (status) {
    case "New":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    case "Confirmed":
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    case "Printing":
      return "border-purple-500/30 bg-purple-500/10 text-purple-400";
    case "Ready for Pickup":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "Completed":
      return "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
    default:
      return "border-white/10 bg-white/5 text-zinc-400";
  }
}

const ORDER_STATUSES = [
  "New",
  "Confirmed",
  "Printing",
  "Ready for Pickup",
  "Completed",
];

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [productImages, setProductImages] = useState<Record<number, string>>({});
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setChecking(false);
      await loadOrders();
    }

    checkAdmin();
  }, [router]);

  async function loadOrders() {
    setLoading(true);
    setError("");

    const [
      { data, error: fetchError },
      { data: productsData, error: productsError },
      { data: orderItemsData, error: orderItemsError },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, image_url"),
      supabase
        .from("order_items")
        .select("order_id, phone_number"),
    ]);

    if (fetchError) {
      console.error(fetchError);
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    if (orderItemsError) {
      console.warn("Could not load order item personalization:", orderItemsError);
    }

    const phoneByOrderId: Record<number, string> = {};

    for (const item of orderItemsData || []) {
      const orderId = Number(item.order_id);
      const phoneNumber = item.phone_number
        ? String(item.phone_number).trim()
        : "";

      if (Number.isFinite(orderId) && phoneNumber) {
        phoneByOrderId[orderId] = phoneNumber;
      }
    }

    const ordersWithPersonalization = (data || []).map((order) => ({
      ...(order as Order),
      phone_number_to_print: phoneByOrderId[Number(order.id)] || null,
    }));

    setOrders(ordersWithPersonalization);

    if (productsError) {
      console.warn("Could not load product images:", productsError);
      setProductImages({});
    } else {
      const imageMap: Record<number, string> = {};
      for (const product of productsData || []) {
        if (typeof product.id === "number" && product.image_url) {
          imageMap[product.id] = product.image_url;
        }
      }
      setProductImages(imageMap);
    }

    setLoading(false);
  }

  async function updateStatus(orderId: number, newStatus: string) {
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (updateError) {
      console.error(updateError);
      alert("Could not update the order.");
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }

  async function deleteOrder(order: Order) {
    const confirmed = window.confirm(
      `Are you sure you want to delete Order #${order.id}?`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    if (deleteError) {
      console.error(deleteError);
      alert("Could not delete the order.");
      return;
    }

    if (order.reference_photo_url) {
      try {
        const marker = "/storage/v1/object/public/order-photos/";
        if (order.reference_photo_url.includes(marker)) {
          const filePath = order.reference_photo_url.split(marker)[1];
          if (filePath) {
            await supabase.storage.from("order-photos").remove([filePath]);
          }
        }
      } catch (photoError) {
        console.error("Could not remove order photo:", photoError);
      }
    }

    setOrders((current) => current.filter((item) => item.id !== order.id));
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function displayOrderNumber(order: Order) {
    if (order.order_number && !order.order_number.startsWith("I3D-LEGACY-")) {
      return order.order_number;
    }
    return `#${order.id}`;
  }

  function getReferencePhotoUrl(order: Order) {
    if (order.reference_photo_url) {
      return order.reference_photo_url;
    }

    const match = (order.custom_description || "").match(
      /Product ID\s*:\s*(\d+)/i
    );

    if (!match) return null;

    return productImages[Number(match[1])] || null;
  }

  const filteredOrders = orders.filter((order) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      String(order.id).includes(term) ||
      order.customer_name.toLowerCase().includes(term) ||
      order.customer_phone.toLowerCase().includes(term) ||
      (order.product_name || "").toLowerCase().includes(term) ||
      order.color.toLowerCase().includes(term) ||
      (order.transaction_id || "").toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111214] px-6 py-4 shadow-xl">
          <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
          <p className="text-sm font-medium text-zinc-400">Loading Orders...</p>
        </div>
      </main>
    );
  }

  const totalOrders = orders.length;
  const newOrders = orders.filter(
    (order) => order.status.toLowerCase() === "new"
  ).length;
  const printingOrders = orders.filter(
    (order) => order.status.toLowerCase() === "printing"
  ).length;
  const readyOrders = orders.filter(
    (order) => order.status.toLowerCase() === "ready for pickup"
  ).length;

  return (
    <main className="min-h-screen bg-[#08090a] font-sans text-white antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#111214]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <a
                href="/admin"
                className="text-2xl font-black tracking-tight transition hover:opacity-90 md:text-3xl"
              >
                Imphal<span className="text-orange-500">3D</span>
              </a>
              <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                Order Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/admin/products"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#08090a] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/50 hover:text-white sm:text-sm"
            >
              <Package className="h-4 w-4 text-orange-500" />
              <span className="hidden sm:inline">Products</span>
            </a>

            <a
              href="/admin"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#08090a] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/50 hover:text-white sm:text-sm"
            >
              <Layers className="h-4 w-4 text-orange-500" />
              <span className="hidden sm:inline">Dashboard</span>
            </a>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* TITLE & METRICS */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-black tracking-[0.3em] text-orange-500 uppercase">
              Management
            </span>
            <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
              Orders
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              View, verify, and track status for incoming print requests.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-[#111214] px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:border-orange-500/50 hover:bg-white/5 hover:text-white md:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            Refresh Orders
          </button>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111214] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Orders</p>
              <ShoppingBag className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight">{totalOrders}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-[#111214] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">New</p>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight text-amber-400">{newOrders}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-[#111214] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Printing</p>
              <Printer className="h-4 w-4 text-purple-400" />
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight text-purple-300">{printingOrders}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#111214] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Ready for Pickup</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight text-emerald-300">{readyOrders}</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#111214] p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <label
                htmlFor="order-search"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400"
              >
                Search Orders
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  id="order-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, customer, phone, item, or UTR..."
                  className="w-full rounded-xl border border-white/10 bg-[#08090a] pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400"
              >
                Filter Status
              </label>
              <div className="relative flex items-center">
                <Filter className="absolute left-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#08090a] pl-10 pr-8 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 lg:min-w-56 appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Printing">Printing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
            <p className="text-xs text-zinc-400">
              Showing <span className="font-bold text-white">{filteredOrders.length}</span> of {orders.length} orders
            </p>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/40 hover:text-orange-400"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ORDER LISTING */}
        {loading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-[#111214]/50 p-12 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-500" />
            <p className="mt-3 text-sm font-medium text-zinc-400">Fetching order records...</p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="font-bold text-red-400">Could not load orders</p>
            <p className="mt-1 text-sm text-red-300/80">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-[#111214]/50 p-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-zinc-600" />
            <h2 className="mt-4 text-lg font-bold">No orders recorded yet</h2>
            <p className="mt-1 text-sm text-zinc-500">Incoming customer orders will display here.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-[#111214]/50 p-12 text-center">
            <Search className="mx-auto h-10 w-10 text-zinc-600" />
            <h2 className="mt-4 text-lg font-bold">No matching orders found</h2>
            <p className="mt-1 text-sm text-zinc-500">Try revising your keyword search or category filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-orange-400"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#111214] transition hover:border-white/20"
              >
                {/* CARD HEADER */}
                <div className="flex flex-col gap-3 border-b border-white/10 bg-[#08090a]/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black tracking-tight">
                        Order {displayOrderNumber(order)}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      {new Date(order.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteOrder(order)}
                    className="inline-flex items-center gap-1.5 self-start rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 sm:self-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>

                {/* CARD BODY */}
                <div className="grid gap-6 p-5 lg:grid-cols-[0.8fr_1.2fr]">
                  {/* LEFT: REFERENCE IMAGE */}
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Reference Photo
                    </p>
                    {getReferencePhotoUrl(order) ? (
                      <a
                        href={getReferencePhotoUrl(order) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block overflow-hidden rounded-xl border border-white/10 bg-[#08090a]"
                      >
                        <img
                          src={getReferencePhotoUrl(order) || ""}
                          alt={`Order ${order.id} reference`}
                          className="max-h-[380px] w-full object-contain transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/80 px-3 py-1.5 text-xs font-semibold text-white">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Full Resolution
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#08090a] text-zinc-600">
                        <FileText className="h-8 w-8 opacity-40" />
                        <span className="mt-2 text-xs font-medium">No Reference Image</span>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: DETAILS */}
                  <div className="space-y-5">
                    {/* CUSTOMER & PRODUCT INFO */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-[#08090a] p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                          <User className="h-3.5 w-3.5 text-orange-500" />
                          Customer
                        </div>
                        <p className="mt-2 font-bold text-white">{order.customer_name}</p>
                        <div className="mt-2 space-y-1 text-xs text-zinc-400">
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-zinc-500" />
                            {order.customer_phone}
                          </p>
                          {order.customer_email && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3 w-3 text-zinc-500" />
                              {order.customer_email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#08090a] p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                          <Tag className="h-3.5 w-3.5 text-orange-500" />
                          Product Details
                        </div>
                        <p className="mt-2 font-bold text-white">
                          {order.product_name || "Custom Print Order"}
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-zinc-400">
                          {order.product_size && (
                            <p>
                              Size: <span className="text-zinc-200">{order.product_size}</span>
                            </p>
                          )}
                          <p>
                            Colour: <span className="text-zinc-200">{order.color}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CUSTOMER REQUEST BREAKDOWN */}
                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Customer Request
                      </p>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {order.phone_number_to_print && (
                          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                              Phone Number to Print
                            </p>
                            <p className="mt-0.5 break-words text-sm font-black text-white">
                              {order.phone_number_to_print}
                            </p>
                          </div>
                        )}

                        {order.custom_description &&
                          formatCustomerRequest(order.custom_description)
                            .filter(
                              (item) =>
                                item.label.toLowerCase() !==
                                  "phone number to print" &&
                                item.label.toLowerCase() !== "phone number"
                            )
                            .map((item, index) => (
                              <div
                                key={`${order.id}-${index}`}
                                className="rounded-xl border border-white/10 bg-[#08090a] p-3"
                              >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                  {item.label}
                                </p>
                                <p className="mt-0.5 break-words text-xs font-bold text-white">
                                  {item.value || "—"}
                                </p>
                              </div>
                            ))}

                        {!order.phone_number_to_print &&
                          !order.custom_description && (
                            <div className="rounded-xl border border-dashed border-white/10 bg-[#08090a] p-3 sm:col-span-2">
                              <p className="text-xs text-zinc-500">
                                No additional details supplied
                              </p>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {order.transaction_id && (
                        <div className="rounded-xl border border-white/10 bg-[#08090a] p-3.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            <CreditCard className="h-3 w-3 text-orange-500" />
                            Transaction / UTR
                          </div>
                          <p className="mt-1 break-all font-mono text-xs font-bold text-zinc-200">
                            {order.transaction_id}
                          </p>
                        </div>
                      )}

                      {order.amount !== null && (
                        <div className="rounded-xl border border-white/10 bg-[#08090a] p-3.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            <IndianRupee className="h-3 w-3 text-orange-500" />
                            Amount
                          </div>
                          <p className="mt-0.5 text-xl font-black text-orange-500">
                            ₹{order.amount}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER: STATUS CONTROL */}
                <div className="border-t border-white/10 bg-[#08090a]/60 p-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Update Order Status
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateStatus(order.id, status)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                          order.status === status
                            ? statusClass(status)
                            : "border-white/10 bg-[#08090a] text-zinc-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {order.status === status && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-2">
                      Quick Step:
                    </span>
                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, "Confirmed")}
                      disabled={order.status === "Confirmed"}
                      className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-bold text-blue-300 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Confirm
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, "Printing")}
                      disabled={order.status === "Printing"}
                      className="rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-bold text-purple-300 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Start Printing
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, "Ready for Pickup")}
                      disabled={order.status === "Ready for Pickup"}
                      className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Mark Ready
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, "Completed")}
                      disabled={order.status === "Completed"}
                      className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}