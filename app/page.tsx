"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  ShoppingBag,
  ShoppingCart,
  Printer,
  Palette,
  Edit3,
  Sparkles,
  Loader2,
  Phone,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Package,
  ChevronRight,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  offer_price: number | null;
  image_url: string | null;
  category: string | null;
  available_colours: string[] | null;
  available_sizes: string[] | null;
  is_available: boolean;
  stock_quantity: number | null;
  created_at: string;
};

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load products:", error);
        setProducts([]);
      } else {
        setProducts((data || []) as Product[]);
      }

      setLoadingProducts(false);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    function updateCartCount() {
      try {
        const savedCart = localStorage.getItem("imphal3d-cart");
        const parsed = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(parsed)) {
          setCartCount(0);
          return;
        }

        const count = parsed.reduce(
          (sum, item) => sum + (Number(item?.quantity) || 0),
          0
        );

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.category?.trim())
            .filter(Boolean) as string[]
        )
      ),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        selectedCategory === "All" ||
        (product.category || "").trim() === selectedCategory
      );
    });
  }, [products, selectedCategory]);

  function getStockLabel(stockQuantity: number | null) {
    if (stockQuantity === null || stockQuantity === undefined) {
      return null;
    }

    if (stockQuantity <= 0) {
      return "Out of Stock";
    }

    if (stockQuantity <= 5) {
      return `Only ${stockQuantity} ${
        stockQuantity === 1 ? "piece" : "pieces"
      } left`;
    }

    return "In Stock";
  }

  function getStockClasses(stockQuantity: number | null) {
    if (stockQuantity === null || stockQuantity === undefined) {
      return "";
    }

    if (stockQuantity <= 0) {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (stockQuantity <= 5) {
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";
    }

    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  function selectCategory(category: string) {
    setSelectedCategory(category);
    document.getElementById("shop")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090a] font-sans text-white selection:bg-orange-500/30 selection:text-orange-400">
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#08090a]/98 px-4 backdrop-blur-2xl">
          <div className="animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)] text-center">
            <div className="relative inline-flex items-center justify-center gap-2">
              <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-3xl" />
              <span className="relative text-8xl font-black tracking-tighter text-purple-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.5)] sm:text-9xl">
                I
              </span>
              <span className="relative text-8xl font-black tracking-tighter text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.5)] sm:text-9xl">
                3
              </span>
              <span className="relative text-8xl font-black tracking-tighter text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.5)] sm:text-9xl">
                D
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
              Imphal<span className="text-orange-500">3D</span>
            </h1>

            <div className="mt-4 space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.6em] text-gray-400 sm:text-sm">
                Printed with Passion
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-orange-500/80 sm:text-xs">
                Made For You
              </p>
            </div>

            <div className="mx-auto mt-10 h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500"
                style={{
                  animation:
                    "loadingSlide 1.5s cubic-bezier(0.65,0,0.35,1) infinite",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className={`transition-opacity duration-700 ${
          showIntro ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="sticky top-0 z-50 border-b border-white/5 bg-[#0d0e10]/95 text-xs backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
            <div className="flex items-center gap-2.5 font-medium text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                <span>Imphal, Manipur</span>
              </div>
            </div>

            <div className="hidden items-center gap-6 sm:flex">
              <a
                href="/custom-order"
                className="flex items-center gap-1.5 font-semibold text-gray-300 transition hover:text-orange-400"
              >
                <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                Custom Orders
              </a>
              <span className="h-3 w-px bg-white/10" />
              <span className="flex items-center gap-1 font-semibold text-orange-400/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                Premium 3D Printing
              </span>
            </div>
          </div>
        </div>

        <header className="sticky top-[33px] z-40 border-b border-white/10 bg-[#08090a]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <a href="/" className="group flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-orange-500/20 to-purple-500/20 transition group-hover:border-orange-500/40">
                <svg
                  viewBox="0 0 48 48"
                  className="h-6 w-6 text-orange-400 transition group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 18V8h28v10" />
                  <path d="M8 18h32v14H8z" />
                  <path d="M13 32v8h22v-8" />
                  <path d="M17 8v10h14V8" />
                  <path d="M19 24h10" />
                  <path d="M18 20h12" />
                  <path d="M21 40v-8h6v8" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight sm:text-3xl">
                  Imphal<span className="text-orange-500">3D</span>
                </div>
                <div className="hidden text-[9px] font-bold uppercase tracking-[0.35em] text-gray-500 sm:block">
                  Printed with Passion
                </div>
              </div>
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/track-order"
                className="hidden items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-2.5 text-xs font-bold text-orange-400 transition hover:border-orange-500 hover:bg-orange-500/10 sm:flex"
              >
                <Package className="h-3.5 w-3.5" />
                Track Order
              </a>

              <a
                href="/cart"
                className="relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs font-black text-black shadow-lg shadow-orange-500/20 transition hover:brightness-110 active:scale-95"
                aria-label={`Open cart${
                  cartCount > 0
                    ? ` with ${cartCount} item${cartCount === 1 ? "" : "s"}`
                    : ""
                }`}
              >
                <ShoppingCart className="h-4 w-4 fill-black/20" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#08090a] bg-white px-1 text-[10px] font-black text-black shadow-lg">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </a>
            </div>
          </div>

        </header>

        <nav className="sticky top-[101px] z-30 border-b border-white/5 bg-[#0d0e10]/80 backdrop-blur-md md:top-[89px]">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 text-xs font-bold whitespace-nowrap sm:px-6">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={`shrink-0 rounded-lg border px-3.5 py-1.5 transition ${
                  selectedCategory === category
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                    : "border-transparent text-gray-400 hover:bg-white/5 hover:text-orange-400"
                }`}
              >
                {category === "All" ? "Shop All" : category}
              </button>
            ))}
            <a
              href="/custom-order"
              className="shrink-0 rounded-lg px-3.5 py-1.5 text-gray-400 transition hover:bg-white/5 hover:text-orange-400"
            >
              Custom Products
            </a>
          </div>
        </nav>

        <section className="relative overflow-hidden border-b border-white/10 py-20 sm:py-28 lg:py-36">
          <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[140px]" />
          <div className="absolute right-0 top-0 -z-10 h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[120px]" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-orange-400">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to Imphal3D
              </span>

              <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">
                Ideas into
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  something real.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
                Discover high-precision 3D printed artifacts, vibrant LED
                displays, and custom creations — designed and crafted in
                Imphal.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#shop"
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-black text-black shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 active:scale-95"
                >
                  Explore Products
                  <ChevronRight className="h-4 w-4" />
                </a>

                <a
                  href="/custom-order"
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold transition hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400 active:scale-95"
                >
                  <Edit3 className="h-4 w-4 text-orange-400" />
                  Custom Order
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                  Quality checked
                </span>
                <span className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-orange-500" />
                  Locally printed
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  Imphal based
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/30 to-purple-500/30 blur-3xl" />
                <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-[#111215]/80 shadow-2xl backdrop-blur-2xl sm:h-96 sm:w-96">
                  <div className="flex select-none items-center gap-1">
                    <span className="text-8xl font-black text-purple-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)] sm:text-9xl">
                      I
                    </span>
                    <span className="text-8xl font-black text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)] sm:text-9xl">
                      3
                    </span>
                    <span className="text-8xl font-black text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.4)] sm:text-9xl">
                      D
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="shop" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">
                Our Collection
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Featured Products
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Handpicked products designed and printed with care and precision.
            </p>
          </div>

          {selectedCategory !== "All" && (
            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-bold text-white">{selectedCategory}</span>
                {" · "}
                {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"}
              </p>

              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-gray-400 transition hover:border-orange-500/40 hover:text-orange-400"
              >
                View All
              </button>
            </div>
          )}

          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {loadingProducts ? (
              <div className="col-span-full flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#111215]/50">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="mt-4 text-sm font-medium text-gray-400">
                  Fetching catalog...
                </p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  aria-label={`View ${product.name}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111215] no-underline transition duration-300 hover:-translate-y-1.5 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10"
                >
                  <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-b from-white/5 to-transparent p-6">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-600">
                        <ShoppingBag className="h-16 w-16 stroke-[1.5] opacity-40" />
                        <span className="mt-2 text-[10px] font-bold uppercase tracking-widest">
                          No Image
                        </span>
                      </div>
                    )}

                    {index === 0 && (
                      <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[10px] font-black tracking-wider text-black shadow-md">
                        <Sparkles className="h-3 w-3 fill-black" />
                        FEATURED
                      </span>
                    )}

                    {getStockLabel(product.stock_quantity) && (
                      <span
                        className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black shadow-md backdrop-blur-md ${getStockClasses(
                          product.stock_quantity
                        )}`}
                      >
                        {getStockLabel(product.stock_quantity)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                        {product.category || "3D Printed Product"}
                      </p>

                      <h3 className="mt-1 text-xl font-bold tracking-tight text-white transition group-hover:text-orange-400">
                        {product.name}
                      </h3>

                      {product.available_sizes &&
                        product.available_sizes.length > 0 && (
                          <p className="mt-1 text-xs font-semibold text-gray-400">
                            Sizes: {product.available_sizes.join(" • ")}
                          </p>
                        )}

                      {product.stock_quantity !== null &&
                        product.stock_quantity !== undefined &&
                        product.stock_quantity <= 5 && (
                          <p
                            className={`mt-2 text-xs font-bold ${
                              product.stock_quantity <= 0
                                ? "text-red-400"
                                : "text-orange-400"
                            }`}
                          >
                            {product.stock_quantity <= 0
                              ? "Currently out of stock"
                              : `Only ${product.stock_quantity} ${
                                  product.stock_quantity === 1
                                    ? "piece"
                                    : "pieces"
                                } left`}
                          </p>
                        )}

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 border-t border-white/5 pt-4">
                      {product.original_price != null &&
                      product.offer_price != null &&
                      product.offer_price > 0 &&
                      product.offer_price < product.original_price ? (
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-orange-500">
                                ₹{product.offer_price}
                              </span>
                              <span className="text-xs font-bold text-gray-500 line-through">
                                ₹{product.original_price}
                              </span>
                            </div>
                            <span className="mt-1 block w-max rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-black text-red-400">
                              {Math.round(
                                ((product.original_price -
                                  product.offer_price) /
                                  product.original_price) *
                                  100
                              )}
                              % OFF
                            </span>
                          </div>
                          <ArrowRight className="mb-1 h-5 w-5 text-gray-600 transition group-hover:translate-x-1 group-hover:text-orange-400" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-orange-500">
                            ₹
                            {product.offer_price != null &&
                            product.offer_price > 0
                              ? product.offer_price
                              : product.price}
                          </span>
                          <ArrowRight className="h-5 w-5 text-gray-600 transition group-hover:translate-x-1 group-hover:text-orange-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-full flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111215]/30 p-8 text-center">
                <ShoppingBag className="h-12 w-12 stroke-[1.5] text-gray-500" />
                <h3 className="mt-4 text-xl font-bold">No Products Found</h3>
                <p className="mt-1 max-w-md text-xs text-gray-500">
                  Try choosing a different category.
                </p>

                {selectedCategory !== "All" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-black text-black transition hover:bg-orange-400"
                  >
                    View All Products
                  </button>
                )}
              </div>
            )}

            <div className="group relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#181411] to-[#0d0e10] p-8 text-center shadow-xl transition hover:border-orange-500/60">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_70%)]" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400 transition duration-300 group-hover:scale-110">
                  <Edit3 className="h-8 w-8" />
                </div>

                <h3 className="mt-5 text-2xl font-black">Custom Products</h3>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-gray-400">
                  Have a unique 3D model, logo, or personalized idea? Let
                  Imphal3D turn it into something real.
                </p>

                <a
                  href="/custom-order"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-500 px-6 py-3 text-xs font-black text-orange-400 transition hover:bg-orange-500 hover:text-black active:scale-95"
                >
                  Request Custom Order
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0d0e10]/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">
                Why Choose Us
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Made with Precision
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-white/5 bg-[#111215] p-8 text-center transition hover:border-orange-500/30">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                  <Printer className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold">Quality 3D Printing</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Carefully printed products with clean details, strong
                  materials, and attention to finish.
                </p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-[#111215] p-8 text-center transition hover:border-orange-500/30">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                  <Palette className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold">Custom Options</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Choose available colours, sizes, and personalization options
                  for selected products.
                </p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-[#111215] p-8 text-center transition hover:border-orange-500/30">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                  <MapPin className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold">Made in Imphal</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Designed, produced, and supported locally from Imphal,
                  Manipur.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 bg-[#08090a]">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 px-4 py-14 sm:px-6 md:flex-row">
            <div>
              <div className="text-3xl font-black tracking-tight">
                Imphal<span className="text-orange-500">3D</span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                Printed with Passion
              </p>
              <p className="mt-5 max-w-sm text-xs leading-relaxed text-gray-500">
                3D printed products, LED creations, and custom designs made in
                Imphal, Manipur.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Contact & Connect</p>

              <ul className="mt-4 space-y-3 text-xs text-gray-400">
                <li className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                  <span>Imphal, Manipur</span>
                </li>

                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                  <a
                    href="tel:+919774424640"
                    className="transition hover:text-white"
                  >
                    +91 97744 24640
                  </a>
                </li>
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href="https://wa.me/919774424640"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-gray-300 transition hover:border-emerald-500/50 hover:text-emerald-400"
                >
                  WhatsApp
                  <ExternalLink className="h-3 w-3" />
                </a>

                <a
                  href="https://www.instagram.com/imphal_3d?igsi=MTVsNjRoZ3ZrZ3dzYQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-gray-300 transition hover:border-pink-500/50 hover:text-pink-400"
                >
                  Instagram
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Pickup Locations
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href="https://maps.app.goo.gl/h3ZzrtKESCrc2dfNA"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-gray-300 transition hover:border-orange-500/50 hover:text-white"
                  >
                    📍 Location 1
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>

                  <a
                    href="https://maps.app.goo.gl/TMppWL8kLyiLkEjk7?g_st=ic"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-gray-300 transition hover:border-orange-500/50 hover:text-white"
                  >
                    📍 Location 2
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
              </div>

              <a
                href="/track-order"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 transition hover:text-orange-300 hover:underline"
              >
                Track Your Order
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="border-t border-white/5 py-6 text-center text-xs font-medium text-gray-600">
            © 2026 Imphal3D. All rights reserved.
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes loadingSlide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </main>
  );
}

