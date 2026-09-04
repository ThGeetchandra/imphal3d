"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShoppingCart,
  ArrowRight,
  MapPin,
} from "lucide-react";

type CartItem = {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
  colour: string;
  size: string;
  quantity: number;
  customName: string;
  phoneNumber?: string;
  pincode?: string;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("imphal3d-cart");
      const parsed = saved ? JSON.parse(saved) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("imphal3d-cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  }, [items, ready]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      ),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items]
  );

  function updateQuantity(index: number, delta: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: Math.max(
                1,
                (Number(item.quantity) || 1) + delta
              ),
            }
          : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function clearCart() {
    setItems([]);
  }

  function checkout() {
    if (!items.length) return;

    localStorage.setItem(
      "imphal3d-cart-checkout",
      JSON.stringify(items)
    );

    const firstPincode =
      String(items.find((item) => item.pincode)?.pincode || "");

    const params = new URLSearchParams();
    params.set("cart", "1");

    if (firstPincode) {
      params.set("pincode", firstPincode);
    }

    window.location.href = `/checkout?${params.toString()}`;
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] text-white">
        <p className="text-sm text-gray-400">Loading cart...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090a] font-sans text-white">
      <header className="border-b border-white/10 bg-[#111214]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a
            href="/"
            className="text-2xl font-black tracking-tight no-underline text-white sm:text-3xl"
          >
            Imphal<span className="text-orange-500">3D</span>
          </a>

          <a
            href="/"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 transition hover:border-orange-500/40 hover:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">
              Shopping Cart
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Your Cart
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10 sm:self-auto"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-white/10 bg-[#111214] px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500/10 text-orange-400">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-black">
              Your cart is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Add products from the store and they will appear here.
            </p>
            <a
              href="/#shop"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-black no-underline transition hover:bg-orange-400"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mt-10 grid gap-7 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item, index) => (
                <article
                  key={`${item.productId}-${index}`}
                  className="rounded-3xl border border-white/10 bg-[#111214] p-4 shadow-xl shadow-black/10 sm:p-6"
                >
                  <div className="flex gap-5">
                    <a
                      href={`/products/${item.productId}`}
                      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/5 p-3 sm:h-36 sm:w-36"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="h-12 w-12 text-gray-600" />
                      )}
                    </a>

                    <div className="min-w-0 flex-1">
                      <a
                        href={`/products/${item.productId}`}
                        className="text-lg font-black text-white no-underline transition hover:text-orange-400 sm:text-xl"
                      >
                        {item.name}
                      </a>

                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                        {item.colour && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-400">
                            Colour: {item.colour}
                          </span>
                        )}
                        {item.size && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-400">
                            Size: {item.size}
                          </span>
                        )}
                        {item.customName && (
                          <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-orange-400">
                            Name: {item.customName}
                          </span>
                        )}
                        {item.phoneNumber && (
                          <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-orange-400">
                            Phone: {item.phoneNumber}
                          </span>
                        )}
                        {item.pincode && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/15 bg-blue-500/5 px-2.5 py-1 text-blue-300">
                            <MapPin className="h-3.5 w-3.5" />
                            PIN: {item.pincode}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-600">
                            Quantity
                          </p>
                          <div className="flex items-center rounded-xl border border-white/10 bg-[#08090a] p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(index, -1)}
                              disabled={Number(item.quantity) <= 1}
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="w-10 text-center text-sm font-black">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(index, 1)}
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-end gap-4">
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-600">
                              Unit price
                            </p>
                            <p className="mt-1 text-xs font-bold text-gray-400">
                              ₹{Number(item.price || 0).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="text-lg font-black text-orange-500">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/5 pt-4 sm:hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Item total</span>
                      <span className="text-lg font-black text-orange-500">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-3xl border border-white/10 bg-[#111214] p-6 shadow-2xl shadow-black/20 lg:sticky lg:top-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                  Order Summary
                </p>
                <ShoppingBag className="h-5 w-5 text-orange-500" />
              </div>

              <div className="mt-6 space-y-3 border-b border-white/5 pb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Items</span>
                  <span className="font-bold text-gray-300">{itemCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-300">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Pickup</span>
                  <span className="font-bold text-emerald-400">Local pickup</span>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500">Total</p>
                  <p className="mt-1 text-[11px] text-gray-600">Before checkout confirmation</p>
                </div>
                <span className="text-3xl font-black tracking-tight text-orange-500">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4">
                <p className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <MapPin className="h-4 w-4" />
                  Pickup only
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your PIN code and pickup location will be confirmed during checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={checkout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 active:scale-[0.98]"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-gray-600">
                You can review your details and pickup information before placing the order.
              </p>

              <a
                href="/#shop"
                className="mt-4 block text-center text-xs font-bold text-gray-500 no-underline transition hover:text-orange-400"
              >
                Continue Shopping
              </a>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
