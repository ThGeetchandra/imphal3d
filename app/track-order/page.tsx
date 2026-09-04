"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  order_number: string | null;
  customer_name: string;
  customer_phone: string;
  product_name: string | null;
  product_size: string | null;
  color: string;
  custom_description: string | null;
  amount: number | null;
  status: string;
  created_at: string;
};

const STATUSES = [
  "New",
  "Confirmed",
  "Printing",
  "Ready for Pickup",
  "Completed",
];

function getStatusIndex(status: string) {
  const index = STATUSES.findIndex(
    (item) =>
      item.toLowerCase() === status.toLowerCase()
  );

  return index >= 0 ? index : 0;
}

function formatRequest(value: string | null) {
  if (!value) return [];

  let text = value
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  const labels = [
    "Custom Name",
    "Quantity",
    "Pickup Location",
    "Product ID",
  ];

  for (const label of labels) {
    text = text.replace(
      new RegExp(
        `\\s*${label}\\s*:?\\s*`,
        "gi"
      ),
      `\n${label}: `
    );
  }

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");

      if (separator === -1) {
        return {
          label: "Customer Request",
          value: line,
        };
      }

      return {
        label: line
          .slice(0, separator)
          .trim(),
        value: line
          .slice(separator + 1)
          .trim(),
      };
    });
}

async function loadOrder(
  valueFromUrl: string,
  setOrder: React.Dispatch<React.SetStateAction<Order | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  showLoading = true
) {
  const value = valueFromUrl.trim();

  if (!value) {
    setError("Please enter your Order Number.");
    setOrder(null);
    return;
  }

  if (!/^I3D-/i.test(value) && !/^\\d+$/.test(value)) {
    setError(
      "Please enter a valid Order Number such as I3D-20260901-1234."
    );
    return;
  }

  if (showLoading) {
    setLoading(true);
    setError("");
    setOrder(null);
  }

  const { data, error: queryError } =
    await supabase.rpc(
      "get_public_order_by_number",
      {
        p_order_number: value.toUpperCase(),
      }
    );

  if (queryError) {
    console.error(
      "Order tracking error:",
      queryError
    );

    if (showLoading) {
      setError(
        "We could not check this order right now. Please try again."
      );
      setLoading(false);
    }

    return;
  }

  const foundOrder =
    Array.isArray(data) ? data[0] : data;

  if (!foundOrder) {
    if (showLoading) {
      setError(
        "Order not found. Please check your Order Number and try again."
      );
      setLoading(false);
    } else {
      setError(
        "Order not found. Please check your Order Number and try again."
      );
    }
    return;
  }

  setOrder(foundOrder as Order);

  if (showLoading) {
    setLoading(false);
  }
}


export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] =
    useState<Order | null>(null);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const orderFromUrl =
      params.get("order")?.trim() || "";

    if (orderFromUrl) {
      const normalized =
        orderFromUrl.toUpperCase();

      setOrderNumber(normalized);
      loadOrder(
        normalized,
        setOrder,
        setLoading,
        setError
      );
    }
  }, []);

  async function findOrder() {
    await loadOrder(
      orderNumber,
      setOrder,
      setLoading,
      setError
    );
  }


  const currentIndex = order
    ? getStatusIndex(order.status)
    : 0;

  return (
    <main className="min-h-screen bg-[#08090a] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#111214]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <a href="/" className="block">
            <div className="text-3xl font-black">
              Imphal
              <span className="text-orange-500">
                3D
              </span>
            </div>

            <p className="mt-1 text-[10px] tracking-[0.3em] text-gray-500">
              PRINTED WITH PASSION
            </p>
          </a>

          <a
            href="/"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-gray-400 hover:border-orange-500 hover:text-orange-400"
          >
            ← Back to Shop
          </a>

        </div>
      </header>


      {/* MAIN */}

      <section className="mx-auto max-w-5xl px-5 py-14">

        <div className="text-center">

          <p className="text-sm font-black tracking-[0.3em] text-orange-500">
            ORDER TRACKING
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Enter the Order Number shown after your
            order is submitted to see the latest
            status.
          </p>

        </div>


        {/* SEARCH */}

        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 bg-[#111214] p-6 md:p-8">

          <label
            htmlFor="order-number"
            className="mb-2 block text-sm font-bold text-gray-400"
          >
            Order Number
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">

            <input
              id="order-number"
              type="text"
              autoCapitalize="characters"
              value={orderNumber}
              onChange={(event) =>
                setOrderNumber(
                  event.target.value.toUpperCase()
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  findOrder();
                }
              }}
              placeholder="Example: I3D-20260901-1234"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#08090a] px-4 py-4 text-lg text-white outline-none placeholder:text-gray-600 focus:border-orange-500"
            />

            <button
              type="button"
              onClick={findOrder}
              disabled={loading}
              className="rounded-xl bg-orange-500 px-7 py-4 font-black text-black transition hover:bg-orange-400 disabled:opacity-50"
            >
              {loading
                ? "Checking..."
                : "Track Order"}
            </button>

          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

        </div>


        {/* RESULT */}

        {order && (
          <div className="mt-10 space-y-6">

            {/* ORDER HEADER */}

            <div className="rounded-3xl border border-white/10 bg-[#111214] p-6 md:p-8">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                    Order
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    {order.order_number || `#${order.id}`}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Placed{" "}
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <span className="self-start rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-black text-orange-400">
                  {order.status}
                </span>

              </div>

            </div>


            {/* PROGRESS */}

            <div className="rounded-3xl border border-white/10 bg-[#111214] p-6 md:p-8">

              <h2 className="text-2xl font-black">
                Order Progress
              </h2>

              <div className="mt-8">

                <div className="hidden items-start justify-between md:flex">

                  {STATUSES.map(
                    (status, index) => {
                      const completed =
                        index <= currentIndex;
                      const active =
                        index === currentIndex;

                      return (
                        <div
                          key={status}
                          className="relative flex flex-1 flex-col items-center text-center"
                        >

                          {index > 0 && (
                            <div
                              className={`absolute right-1/2 top-5 h-1 w-full ${
                                index <= currentIndex
                                  ? "bg-orange-500"
                                  : "bg-white/10"
                              }`}
                            />
                          )}

                          <div
                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black ${
                              completed
                                ? "border-orange-500 bg-orange-500 text-black"
                                : "border-white/10 bg-[#08090a] text-gray-600"
                            } ${
                              active
                                ? "ring-4 ring-orange-500/10"
                                : ""
                            }`}
                          >
                            {completed
                              ? "✓"
                              : index + 1}
                          </div>

                          <p
                            className={`mt-3 max-w-28 text-xs font-bold ${
                              completed
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          >
                            {status}
                          </p>

                        </div>
                      );
                    }
                  )}

                </div>


                {/* MOBILE */}

                <div className="space-y-3 md:hidden">

                  {STATUSES.map(
                    (status, index) => {
                      const completed =
                        index <= currentIndex;
                      const active =
                        index === currentIndex;

                      return (
                        <div
                          key={status}
                          className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                            active
                              ? "border-orange-500/30 bg-orange-500/10"
                              : "border-white/10 bg-[#08090a]"
                          }`}
                        >

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
                              completed
                                ? "border-orange-500 bg-orange-500 text-black"
                                : "border-white/10 text-gray-600"
                            }`}
                          >
                            {completed
                              ? "✓"
                              : index + 1}
                          </div>

                          <div>
                            <p
                              className={`font-black ${
                                active
                                  ? "text-orange-400"
                                  : completed
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            >
                              {status}
                            </p>

                            {active && (
                              <p className="mt-1 text-xs text-gray-500">
                                Current order status
                              </p>
                            )}
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>


            {/* ORDER DETAILS */}

            <div className="grid gap-6 lg:grid-cols-2">

              <div className="rounded-3xl border border-white/10 bg-[#111214] p-6">

                <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                  Order Details
                </p>

                <h2 className="mt-3 text-2xl font-black">
                  {order.product_name ||
                    "Custom Order"}
                </h2>

                <div className="mt-6 space-y-3">

                  {order.product_size && (
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-gray-500">
                        Size
                      </span>

                      <strong>
                        {order.product_size}
                      </strong>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                    <span className="text-gray-500">
                      Colour
                    </span>

                    <strong>
                      {order.color}
                    </strong>
                  </div>

                  {order.amount !== null && (
                    <div className="flex justify-between gap-4 pt-1">
                      <span className="text-gray-500">
                        Total
                      </span>

                      <strong className="text-xl text-orange-500">
                        ₹{order.amount}
                      </strong>
                    </div>
                  )}

                </div>

              </div>


              <div className="rounded-3xl border border-white/10 bg-[#111214] p-6">

                <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                  Customer Request
                </p>

                {order.custom_description ? (
                  <div className="mt-5 space-y-3">

                    {formatRequest(
                      order.custom_description
                    ).map(
                      (item, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/10 bg-[#08090a] p-4"
                        >

                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                            {item.label}
                          </p>

                          <p className="mt-1 break-words text-sm font-bold text-white">
                            {item.value || "—"}
                          </p>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <p className="mt-5 text-sm text-gray-600">
                    No additional request.
                  </p>
                )}

              </div>

            </div>


            {/* PICKUP / HELP */}

            <div className="rounded-3xl border border-orange-500/20 bg-[#111214] p-6 md:p-8">

              <h2 className="text-2xl font-black">
                Need Help?
              </h2>

              <p className="mt-2 max-w-2xl text-gray-500">
                Your status is updated by Imphal3D
                as your order moves through
                production. For questions about
                your order, contact us directly.
              </p>

              <a
                href="https://wa.me/919862135090"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-xl bg-[#25d366] px-6 py-3 font-black text-black"
              >
                💬 Contact Imphal3D
              </a>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}
