"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
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
};

export default function AdminDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState("");

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
      setChecking(false);

      await loadOrders();
    }

    checkAdmin();
  }, [router]);

  async function loadOrders() {
    setLoadingOrders(true);
    setOrderError("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading orders:", error);
      setOrderError(error.message);
      setLoadingOrders(false);
      return;
    }

    setOrders((data || []) as Order[]);
    setLoadingOrders(false);
  }

  async function updateStatus(
    orderId: number,
    newStatus: string
  ) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Status update error:", error);
      alert("Could not update the order.");
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  }

  async function deleteOrder(orderId: number) {
    const confirmed = window.confirm(
      `Are you sure you want to delete Order #${orderId}?`
    );

    if (!confirmed) return;

    const orderToDelete = orders.find(
      (order) => order.id === orderId
    );

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Delete error:", error);
      alert("Could not delete the order.");
      return;
    }

    // Also remove the uploaded photo from Storage.
    if (orderToDelete?.reference_photo_url) {
      try {
        const url = orderToDelete.reference_photo_url;
        const marker = "/storage/v1/object/public/order-photos/";

        if (url.includes(marker)) {
          const filePath = url.split(marker)[1];

          if (filePath) {
            await supabase.storage
              .from("order-photos")
              .remove([filePath]);
          }
        }
      } catch (photoError) {
        console.error(
          "Photo deletion error:",
          photoError
        );
      }
    }

    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) => order.id !== orderId
      )
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">
          Loading Admin Dashboard...
        </p>
      </main>
    );
  }

  const totalOrders = orders.length;

  const newOrders = orders.filter(
    (order) =>
      order.status.toLowerCase() === "new"
  ).length;

  const printingOrders = orders.filter(
    (order) =>
      order.status.toLowerCase() === "printing"
  ).length;

  const readyOrders = orders.filter(
    (order) =>
      order.status.toLowerCase() ===
      "ready for pickup"
  ).length;

  return (
    <main className="min-h-screen bg-[#08090a] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#111214]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <div>
            <div className="text-3xl font-black">
              Imphal
              <span className="text-orange-500">
                3D
              </span>
            </div>

            <p className="mt-1 text-xs tracking-widest text-gray-500">
              ADMIN DASHBOARD
            </p>
          </div>

          <div className="flex items-center gap-4">

            <span className="hidden text-sm text-gray-400 md:block">
              {email}
            </span>

            <button
              onClick={logout}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-gray-300 transition hover:border-red-500 hover:text-red-400"
            >
              Sign Out
            </button>

          </div>

        </div>

      </header>


      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-5 py-10">

        <div className="mb-10">

          <p className="text-sm font-black tracking-[0.3em] text-orange-500">
            MANAGEMENT
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Welcome to Imphal3D
          </h1>

          <p className="mt-3 text-gray-500">
            Manage your orders, products and customers
            from one place.
          </p>

        </div>


        {/* STATS */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#111214] p-6">

            <div className="text-3xl">
              📦
            </div>

            <p className="mt-5 text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-1 text-4xl font-black">
              {totalOrders}
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-[#111214] p-6">

            <div className="text-3xl">
              🟡
            </div>

            <p className="mt-5 text-sm text-gray-500">
              New Orders
            </p>

            <p className="mt-1 text-4xl font-black">
              {newOrders}
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-[#111214] p-6">

            <div className="text-3xl">
              🖨️
            </div>

            <p className="mt-5 text-sm text-gray-500">
              Printing
            </p>

            <p className="mt-1 text-4xl font-black">
              {printingOrders}
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-[#111214] p-6">

            <div className="text-3xl">
              🟢
            </div>

            <p className="mt-5 text-sm text-gray-500">
              Ready for Pickup
            </p>

            <p className="mt-1 text-4xl font-black">
              {readyOrders}
            </p>

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div className="mt-10 grid gap-5 md:grid-cols-3">

          <button
            onClick={() =>
              document
                .getElementById("orders")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            className="rounded-2xl border border-white/10 bg-[#111214] p-7 text-left transition hover:border-orange-500"
          >

            <div className="text-3xl">
              📦
            </div>

            <h2 className="mt-4 text-xl font-black">
              Orders
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              View and manage customer orders.
            </p>

          </button>


          <button
            className="rounded-2xl border border-white/10 bg-[#111214] p-7 text-left transition hover:border-orange-500"
          >

            <div className="text-3xl">
              🛍️
            </div>

            <h2 className="mt-4 text-xl font-black">
              Products
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add, edit and remove products.
            </p>

          </button>


          <button
            className="rounded-2xl border border-white/10 bg-[#111214] p-7 text-left transition hover:border-orange-500"
          >

            <div className="text-3xl">
              ⚙️
            </div>

            <h2 className="mt-4 text-xl font-black">
              Settings
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Manage your admin settings.
            </p>

          </button>

        </div>


        {/* ORDERS */}

        <div
          id="orders"
          className="mt-10 rounded-2xl border border-white/10 bg-[#111214] p-6 md:p-8"
        >

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-2xl font-black">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Customer orders submitted through your website.
              </p>

            </div>

            <button
              onClick={loadOrders}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-gray-300 hover:border-orange-500 hover:text-orange-500"
            >
              ↻ Refresh
            </button>

          </div>


          {/* LOADING */}

          {loadingOrders && (
            <div className="mt-8 rounded-xl border border-dashed border-white/10 p-12 text-center">

              <div className="text-4xl">
                ⏳
              </div>

              <p className="mt-4 font-bold text-gray-400">
                Loading orders...
              </p>

            </div>
          )}


          {/* ERROR */}

          {!loadingOrders && orderError && (
            <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-6">

              <p className="font-bold text-red-400">
                Could not load orders
              </p>

              <p className="mt-2 text-sm text-red-300">
                {orderError}
              </p>

            </div>
          )}


          {/* EMPTY */}

          {!loadingOrders &&
            !orderError &&
            orders.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed border-white/10 p-12 text-center">

                <div className="text-5xl">
                  📭
                </div>

                <p className="mt-4 font-bold text-gray-400">
                  No orders yet
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Orders will appear here once customers
                  start submitting them.
                </p>

              </div>
            )}


          {/* ORDER LIST */}

          {!loadingOrders &&
            !orderError &&
            orders.length > 0 && (
              <div className="mt-8 space-y-5">

                {orders.map((order) => (

                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#08090a]"
                  >

                    {/* ORDER HEADER */}

                    <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">

                      <div>

                        <div className="flex items-center gap-3">

                          <h3 className="text-xl font-black">
                            Order #{order.id}
                          </h3>

                          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                            {order.status}
                          </span>

                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(
                            order.created_at
                          ).toLocaleString()}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          deleteOrder(order.id)
                        }
                        className="rounded-xl border border-red-500/20 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>

                    </div>


                    {/* ORDER CONTENT */}

                    <div className="grid gap-6 p-5 md:grid-cols-2">

                      {/* PHOTO */}

                      <div>

                        <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-500">
                          Reference Photo
                        </p>

                        {order.reference_photo_url ? (
                          <a
                            href={order.reference_photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={order.reference_photo_url}
                              alt={`Reference for Order #${order.id}`}
                              className="max-h-[400px] w-full rounded-xl border border-white/10 object-contain"
                            />
                          </a>
                        ) : (
                          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 text-gray-600">
                            No photo
                          </div>
                        )}

                      </div>


                      {/* DETAILS */}

                      <div className="space-y-5">

                        <div>

                          <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                            Customer
                          </p>

                          <p className="mt-1 text-lg font-bold">
                            {order.customer_name}
                          </p>

                          <p className="text-sm text-gray-400">
                            {order.customer_phone}
                          </p>

                          {order.customer_email && (
                            <p className="text-sm text-gray-500">
                              {order.customer_email}
                            </p>
                          )}

                        </div>


                        <div>

                          <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                            Product
                          </p>

                          <p className="mt-1 font-bold">
                            {order.product_name ||
                              "Custom Order"}
                          </p>

                          {order.product_size && (
                            <p className="text-sm text-gray-500">
                              Size: {order.product_size}
                            </p>
                          )}

                        </div>


                        <div>

                          <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                            Colour
                          </p>

                          <p className="mt-1 font-bold">
                            {order.color}
                          </p>

                        </div>


                        <div>

                          <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                            Description
                          </p>

                          <div className="mt-3 rounded-xl border border-white/10 bg-[#111214] p-4">
                            {order.custom_description ? (
                              <div className="space-y-3">
                                {order.custom_description
                                  .replace(/\\\\n/g, "\n")
                                  .split("\n")
                                  .filter((line) => line.trim())
                                  .map((line, index) => {
                                    const separator = line.indexOf(":");

                                    if (separator === -1) {
                                      return (
                                        <p
                                          key={index}
                                          className="text-sm text-gray-300"
                                        >
                                          {line.trim()}
                                        </p>
                                      );
                                    }

                                    const label = line
                                      .slice(0, separator)
                                      .trim();

                                    const value = line
                                      .slice(separator + 1)
                                      .trim();

                                    return (
                                      <div
                                        key={index}
                                        className="rounded-lg border border-white/5 bg-[#08090a] px-4 py-3"
                                      >
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                                          {label}
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-white">
                                          {value}
                                        </p>
                                      </div>
                                    );
                                  })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">
                                No customer request
                              </p>
                            )}
                          </div>

                        </div>


                        {order.transaction_id && (
                          <div>

                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                              Transaction ID
                            </p>

                            <p className="mt-1 font-mono text-sm">
                              {order.transaction_id}
                            </p>

                          </div>
                        )}


                        {order.amount !== null && (
                          <div>

                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                              Amount
                            </p>

                            <p className="mt-1 font-bold">
                              ₹{order.amount}
                            </p>

                          </div>
                        )}

                      </div>

                    </div>


                    {/* STATUS BUTTONS */}

                    <div className="border-t border-white/10 p-5">

                      <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-500">
                        Order Status
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {[
                          "New",
                          "Confirmed",
                          "Printing",
                          "Ready for Pickup",
                          "Completed",
                        ].map((status) => (

                          <button
                            key={status}
                            onClick={() =>
                              updateStatus(
                                order.id,
                                status
                              )
                            }
                            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                              order.status === status
                                ? "border-orange-500 bg-orange-500 text-black"
                                : "border-white/10 text-gray-400 hover:border-orange-500 hover:text-orange-400"
                            }`}
                          >
                            {status}
                          </button>

                        ))}

                      </div>

                    </div>

                  </div>

                ))}

              </div>
            )}

        </div>

      </section>

    </main>
  );
}