"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ShoppingBag,
  ArrowLeft,
  Printer,
  Award,
  MapPin,
  Star,
  Truck,
  Wrench,
  MessageCircle,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  PackageX,
  Sparkles,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  offer_price: number | null;
  image_url: string | null;
  colour_images: Record<string, string> | null;
  size_prices: Record<string, number> | null;
  category: string | null;
  available_colours: string[] | null;
  available_sizes: string[] | null;
  is_available: boolean;
  is_customizable: boolean;
  is_phone_number_customizable: boolean;
  stock_quantity: number | null;
};

const colourValues: Record<string, string> = {
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  White: "#ffffff",
  Black: "#000000",
  Yellow: "#facc15",
  Purple: "#8b16e8",
  Pink: "#ec4899",
  "Same as Photo": "#6b7280",
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [selectedColour, setSelectedColour] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "checking" | "allowed" | "blocked"
  >("idle");
  const [pincodeMessage, setPincodeMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const idValue = params?.id;

      if (!idValue) {
        setPageError("Product not found.");
        setLoading(false);
        return;
      }

      const productId = Number(idValue);

      if (!Number.isFinite(productId)) {
        setPageError("Invalid product.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !data) {
        console.error("Product loading error:", error);
        setPageError("Product not found.");
        setLoading(false);
        return;
      }

      const loadedProduct = data as Product;
      setProduct(loadedProduct);

      if (loadedProduct.available_colours?.length) {
        setSelectedColour(loadedProduct.available_colours[0]);
      }

      if (loadedProduct.available_sizes?.length) {
        setSelectedSize(loadedProduct.available_sizes[0]);
      }

      setLoading(false);
    }

    loadProduct();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] text-white">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-16 w-16 rounded-full bg-orange-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-orange-500 relative z-10" />
          </div>
          <p className="mt-4 text-sm tracking-wide font-medium text-gray-400 animate-pulse">
            Crafting product preview...
          </p>
        </div>
      </main>
    );
  }

  if (pageError || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] px-5 text-white">
        <div className="text-center max-w-md">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20 shadow-2xl shadow-orange-500/10">
            <PackageX className="h-12 w-12" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Product Unavailable</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {pageError || "The product you're looking for doesn't exist or was recently removed."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-orange-500 px-7 py-3.5 font-bold text-black shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 hover:shadow-orange-400/30 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" /> Return to Storefront
          </button>
        </div>
      </main>
    );
  }

  const isCustomNameProduct = product.is_customizable === true;
  const isPhoneNumberProduct = product.is_phone_number_customizable === true;

  const isPetNameTag =
    product.name.trim().toLowerCase().includes("pet name tag");

  const customNameMaxLength = isPetNameTag ? 10 : 30;

  const stockQuantity =
    product.stock_quantity === null || product.stock_quantity === undefined
      ? null
      : Number(product.stock_quantity);

  const isOutOfStock = stockQuantity !== null && stockQuantity <= 0;

  const stockLabel =
    stockQuantity === null
      ? null
      : stockQuantity <= 0
        ? "Out of Stock"
        : stockQuantity <= 5
          ? `Only ${stockQuantity} ${
              stockQuantity === 1 ? "piece" : "pieces"
            } left`
          : "In Stock";

  const selectedBasePrice =
    selectedSize &&
    product.size_prices &&
    product.size_prices[selectedSize] !== undefined
      ? product.size_prices[selectedSize]
      : product.price ?? 0;

  const hasOffer =
    product.original_price !== null &&
    product.offer_price !== null &&
    product.original_price > 0 &&
    product.offer_price > 0 &&
    product.offer_price < product.original_price;

  const offerRatio = hasOffer
    ? product.offer_price! / product.original_price!
    : null;

  const selectedSellingPrice =
    offerRatio !== null
      ? Math.round(selectedBasePrice * offerRatio)
      : selectedBasePrice;

  const total = selectedSellingPrice * quantity;

  const discount =
    hasOffer
      ? Math.round(
          ((product.original_price! - product.offer_price!) /
            product.original_price!) *
            100
        )
      : null;

  const selectedColourImage =
    product.colour_images &&
    selectedColour &&
    product.colour_images[selectedColour]
      ? product.colour_images[selectedColour]
      : null;

  const displayedImage = selectedColourImage || product.image_url || "";

  const galleryImages = [
    ...(product.image_url
      ? [{ key: "main", label: "Main", src: product.image_url }]
      : []),
    ...(product.available_colours || [])
      .filter(
        (colour) =>
          !!product.colour_images &&
          !!product.colour_images[colour]
      )
      .map((colour) => ({
        key: `colour-${colour}`,
        label: colour,
        src: product.colour_images![colour],
      })),
  ];

  async function checkPincode() {
    const value = pincode.trim();

    if (!/^\d{6}$/.test(value)) {
      setPincodeStatus("blocked");
      setPincodeMessage("Please enter a valid 6-digit PIN code.");
      return false;
    }

    setPincodeStatus("checking");
    setPincodeMessage("Checking pickup availability...");

    const { data, error } = await supabase.rpc(
      "check_serviceable_pincode",
      {
        p_pincode: value,
      }
    );

    if (error) {
      console.error("Pincode check error:", error);
      setPincodeStatus("blocked");
      setPincodeMessage(
        "We could not check this PIN code right now. Please try again."
      );
      return false;
    }

    const allowed =
      Array.isArray(data) ? Boolean(data[0]) : Boolean(data);

    if (!allowed) {
      setPincodeStatus("blocked");
      setPincodeMessage(
        "We currently do not have a pickup location for this PIN code. Please contact Imphal3D before placing your order, as it may be difficult for you to pick up the order from our available pickup locations."
      );
      return false;
    }

    setPincodeStatus("allowed");
    setPincodeMessage("Pickup is available for this PIN code.");
    return true;
  }

  async function buyNow() {
    if (!product) return;

    if (isOutOfStock) {
      alert("This product is currently out of stock.");
      return;
    }

    if (!(await checkPincode())) return;

    if (isCustomNameProduct && !customName.trim()) {
      alert("Please enter the name you want printed.");
      return;
    }

    if (isPhoneNumberProduct) {
      const cleanedPhone = phoneNumber.replace(/\D/g, "");

      if (!/^\d{10}$/.test(cleanedPhone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
      }
    }

    const query = new URLSearchParams();

    query.set("productId", String(product.id));
    query.set("product", product.name);
    query.set("quantity", String(quantity));
    query.set("price", String(selectedSellingPrice));
    query.set("isCustomizable", product.is_customizable ? "1" : "0");
    query.set("pincode", pincode.trim());

    if (selectedColour) {
      query.set("colour", selectedColour);
    }

    if (selectedSize) {
      query.set("size", selectedSize);
    }

    if (isCustomNameProduct && customName.trim()) {
      query.set("customName", customName.trim());
    }

    if (isPhoneNumberProduct && phoneNumber.trim()) {
      query.set("phoneNumber", phoneNumber.replace(/\D/g, ""));
    }

    router.push(`/checkout?${query.toString()}`);
  }

  async function addToCart() {
    if (!product) return;

    if (isOutOfStock) {
      alert("This product is currently out of stock.");
      return;
    }

    if (!(await checkPincode())) return;

    if (isCustomNameProduct && !customName.trim()) {
      alert("Please enter the name you want printed.");
      return;
    }

    if (isPhoneNumberProduct) {
      const cleanedPhone = phoneNumber.replace(/\D/g, "");

      if (!/^\d{10}$/.test(cleanedPhone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
      }
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      imageUrl: displayedImage,
      price: selectedSellingPrice,
      colour: selectedColour,
      size: selectedSize,
      quantity,
      customName: isCustomNameProduct ? customName.trim() : "",
      phoneNumber: isPhoneNumberProduct ? phoneNumber.replace(/\D/g, "") : "",
      pincode: pincode.trim(),
    };

    let cart: unknown[] = [];

    const savedCart = localStorage.getItem("imphal3d-cart");

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          cart = parsed;
        }
      } catch {
        cart = [];
      }
    }

    cart.push(cartItem);

    localStorage.setItem("imphal3d-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));

    alert(
      `${product.name} added to cart!\n\n` +
        (isCustomNameProduct && customName.trim()
          ? `Name to Print: ${customName.trim()}\n`
          : "") +
        (isPhoneNumberProduct && phoneNumber.trim()
          ? `Phone Number: ${phoneNumber.replace(/\D/g, "")}\n`
          : "") +
        `Colour: ${selectedColour || "Not selected"}\n` +
        `Size: ${selectedSize || "Not selected"}\n` +
        `Quantity: ${quantity}\n` +
        `Total: ₹${total}`
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090a] font-[Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-white selection:bg-orange-500 selection:text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111214]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="group shrink-0 flex items-center gap-3">
            <div>
              <div className="text-2xl font-black tracking-tight sm:text-3xl">
                Imphal
                <span className="text-orange-500 transition-colors group-hover:text-orange-400">
                  3D
                </span>
              </div>
              <div className="text-[9px] font-bold tracking-[0.35em] text-gray-500 group-hover:text-gray-400 transition-colors">
                PRINTED WITH PASSION
              </div>
            </div>
          </a>

          <a
            href="/"
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 backdrop-blur-sm transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Shop
          </a>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 pt-5 sm:px-6 sm:pt-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <a href="/" className="transition hover:text-orange-400">
            Home
          </a>
          <span className="text-gray-600">/</span>
          <span className="truncate text-gray-200 font-semibold">{product.name}</span>
        </nav>
      </div>

      {/* PRODUCT MAIN SECTION */}
      <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        <div className="grid w-full min-w-0 items-start gap-8 lg:grid-cols-2 lg:gap-16">
          
          {/* LEFT: IMAGES & HIGHLIGHTS */}
          <div className="min-w-0 w-full space-y-5 lg:sticky lg:top-24 lg:space-y-6">
            <div className="group relative w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#16181c] to-[#111214] shadow-2xl transition-all duration-300 hover:border-white/20">
              
              {/* Subtle background glow */}
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
              <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

              {hasOffer && discount !== null && (
                <div className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-xs font-black tracking-wider text-white shadow-xl shadow-red-500/20 ring-1 ring-white/20">
                  <Zap className="h-3.5 w-3.5 fill-current" /> {discount}% OFF
                </div>
              )}

              <div className="relative flex h-[78vw] min-h-[300px] max-h-[520px] w-full min-w-0 items-center justify-center p-4 sm:h-auto sm:min-h-[420px] sm:p-12">
                {displayedImage ? (
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="flex h-full w-full min-w-0 items-center justify-center cursor-zoom-in"
                    aria-label={`Enlarge ${product.name} image`}
                    title="Click to enlarge"
                  >
                    <img
                      src={displayedImage}
                      alt={`${product.name} ${selectedColour || ""}`}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 sm:max-h-[460px]"
                    />
                  </button>
                ) : (
                  <div className="flex flex-col items-center text-gray-600">
                    <div className="rounded-full bg-white/5 p-6 ring-1 ring-white/10">
                      <ShoppingBag className="h-16 w-16 stroke-1 text-gray-500" />
                    </div>
                    <p className="mt-4 text-xs font-semibold tracking-wide text-gray-400">No Preview Available</p>
                  </div>
                )}
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#111214] p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                    Product Gallery
                  </span>
                  <span className="text-[11px] font-semibold text-gray-600">
                    {galleryImages.length} photos
                  </span>
                </div>

                <div className="flex min-w-0 max-w-full gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((image) => {
                    const isSelected =
                      image.src === displayedImage;

                    return (
                      <button
                        key={image.key}
                        type="button"
                        onClick={() => {
                          if (image.key.startsWith("colour-")) {
                            const colour = image.key.replace("colour-", "");
                            setSelectedColour(colour);
                          } else {
                            setSelectedColour("");
                          }
                        }}
                        className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? "border-orange-500 ring-2 ring-orange-500/30"
                            : "border-white/10 hover:border-white/30"
                        }`}
                        aria-label={`View ${image.label} photo`}
                        title={image.label}
                      >
                        <img
                          src={image.src}
                          alt={`${product.name} ${image.label}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span
                          className={`absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-1 text-center text-[10px] font-black text-white backdrop-blur-sm ${
                            isSelected ? "text-orange-300" : ""
                          }`}
                        >
                          {image.label}
                        </span>

                        {isSelected && (
                          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-black shadow-lg">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {displayedImage && (
              <p className="text-center text-[11px] font-semibold tracking-wide text-gray-600">
                Click the product photo to view it larger
              </p>
            )}

            <p className="text-center text-xs font-medium text-gray-500 tracking-wide">
              {product.name}
              {selectedColour ? ` • ${selectedColour}` : ""}
              {selectedSize ? ` • ${selectedSize}` : ""}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-[#111214] p-4 text-center transition-all duration-300 hover:border-orange-500/30 hover:bg-[#16181c]">
                <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400 ring-1 ring-orange-500/20 group-hover:scale-110 transition-transform">
                  <Printer className="h-5 w-5" />
                </div>
                <p className="mt-3 text-xs font-semibold text-gray-300">Precision 3D Printed</p>
              </div>

              <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-[#111214] p-4 text-center transition-all duration-300 hover:border-orange-500/30 hover:bg-[#16181c]">
                <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400 ring-1 ring-orange-500/20 group-hover:scale-110 transition-transform">
                  <Award className="h-5 w-5" />
                </div>
                <p className="mt-3 text-xs font-semibold text-gray-300">Premium Finish</p>
              </div>

              <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-[#111214] p-4 text-center transition-all duration-300 hover:border-orange-500/30 hover:bg-[#16181c]">
                <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400 ring-1 ring-orange-500/20 group-hover:scale-110 transition-transform">
                  <MapPin className="h-5 w-5" />
                </div>
                <p className="mt-3 text-xs font-semibold text-gray-300">Crafted in Imphal</p>
              </div>
            </div>
          </div>

          {/* RIGHT: BUYING OPTIONS */}
          <div className="min-w-0 w-full flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-[11px] font-black tracking-widest text-orange-400 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              {product.category || "3D PRINTED PRODUCT"}
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight leading-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-orange-400 inline" /> Imphal3D Verified Product
              </span>
            </div>

            {product.description && (
              <p className="mt-6 text-sm leading-relaxed text-gray-400 border-l-2 border-orange-500/30 pl-4">
                {product.description}
              </p>
            )}

            {/* PRICE CONTAINER */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-[#16181c] to-[#111214] p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-4xl font-black text-orange-500 sm:text-5xl tracking-tight">
                  ₹{selectedSellingPrice}
                </span>

                {hasOffer && (
                  <span className="text-2xl font-bold text-gray-500 line-through decoration-red-500/60">
                    ₹{selectedBasePrice}
                  </span>
                )}

                {hasOffer && discount !== null && (
                  <span className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-black text-red-400">
                    Save {discount}%
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold tracking-wide text-emerald-400">Ready to Print & Pickup</span>
              </div>
            </div>

            {/* STOCK STATUS */}
            {stockLabel && (
              <div
                className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  isOutOfStock
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : stockQuantity !== null && stockQuantity <= 5
                      ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    isOutOfStock
                      ? "bg-red-500"
                      : stockQuantity !== null && stockQuantity <= 5
                        ? "bg-orange-500"
                        : "bg-emerald-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-black">{stockLabel}</p>
                  {!isOutOfStock && stockQuantity !== null && stockQuantity <= 5 && (
                    <p className="mt-0.5 text-[11px] font-medium opacity-80">
                      Order soon before it sells out.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CUSTOM NAME FIELD */}
            {isCustomNameProduct && (
              <div className="mt-6 rounded-3xl border border-orange-500/30 bg-orange-500/5 p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <label className="block text-sm font-bold tracking-wide text-white">Custom Name Engraving</label>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  Enter the custom text or name you want us to print on your order.
                </p>

                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.slice(0, customNameMaxLength))}
                  maxLength={customNameMaxLength}
                  placeholder="Enter name, e.g. Sarangthem"
                  className="mt-4 w-full rounded-2xl border border-white/15 bg-[#08090a] px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />

                <div className="mt-2.5 flex justify-between text-[11px] font-medium text-gray-500">
                  <span>Maximum {customNameMaxLength} characters</span>
                  <span className={customName.length >= Math.max(1, customNameMaxLength - 2) ? "text-orange-400 font-bold" : ""}>
                    {customName.length}/{customNameMaxLength}
                  </span>
                </div>
              </div>
            )}

            {/* PHONE NUMBER PERSONALIZATION */}
            {isPhoneNumberProduct && (
              <div className="mt-6 rounded-3xl border border-orange-500/30 bg-orange-500/5 p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-400" />
                  <label className="block text-sm font-bold tracking-wide text-white">
                    Phone Number Personalization
                  </label>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  Enter a 10-digit phone number to be printed on your personalized product.
                </p>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  className="mt-4 w-full rounded-2xl border border-white/15 bg-[#08090a] px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />

                <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-gray-500">
                  <span>Example: 9774424640</span>
                  <span
                    className={
                      phoneNumber.length === 10
                        ? "text-emerald-400 font-bold"
                        : ""
                    }
                  >
                    {phoneNumber.length}/10
                  </span>
                </div>
              </div>
            )}

            {/* COLOUR SELECTOR */}
            {product.available_colours && product.available_colours.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Colour</span>
                  <span className="text-xs font-bold text-orange-400">
                    {selectedColour || "Select Option"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.available_colours.map((colour) => {
                    const colourValue = colourValues[colour] || "#6b7280";
                    const hasImage = !!(
                      product.colour_images && product.colour_images[colour]
                    );

                    return (
                      <button
                        key={colour}
                        type="button"
                        onClick={() => setSelectedColour(colour)}
                        title={colour}
                        aria-label={`Select ${colour}`}
                        className={`group relative h-11 w-11 rounded-full transition-all duration-200 active:scale-90 ${
                          selectedColour === colour
                            ? "ring-2 ring-orange-500 ring-offset-4 ring-offset-[#08090a] scale-110"
                            : "ring-1 ring-white/20 hover:ring-white/50 hover:scale-105"
                        }`}
                        style={{ backgroundColor: colourValue }}
                      >
                        {hasImage && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-black ring-2 ring-[#08090a] shadow-md">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Size</span>
                  <span className="text-xs font-bold text-orange-400">
                    {selectedSize || "Select Option"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.available_sizes.map((size) => {
                    const base = product.size_prices?.[size];
                    const displayPrice =
                      base !== undefined
                        ? offerRatio !== null
                          ? Math.round(base * offerRatio)
                          : base
                        : undefined;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[5.5rem] rounded-2xl border px-4 py-3 text-left transition-all duration-200 active:scale-95 ${
                          selectedSize === size
                            ? "border-orange-500 bg-orange-500 text-black font-extrabold shadow-lg shadow-orange-500/20"
                            : "border-white/10 bg-[#111214] text-gray-300 hover:border-orange-500/50 hover:bg-[#16181c]"
                        }`}
                      >
                        <span className="block text-sm font-bold">{size}</span>
                        {displayPrice !== undefined && (
                          <span
                            className={`mt-0.5 block text-xs ${
                              selectedSize === size
                                ? "text-black/80 font-bold"
                                : "text-gray-400"
                            }`}
                          >
                            ₹{displayPrice}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PICKUP PIN CODE */}
            <div className="mt-8 rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-500/20 p-2.5 text-blue-400 ring-1 ring-blue-500/30 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-black tracking-wide text-white">
                    Check Pickup Availability
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    Enter your 6-digit PIN code to confirm pickup availability in your area.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                        setPincode(value);
                        setPincodeStatus("idle");
                        setPincodeMessage("");
                      }}
                      placeholder="Enter 6-digit PIN code"
                      className="flex-1 rounded-2xl border border-white/15 bg-[#08090a] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />

                    <button
                      type="button"
                      onClick={checkPincode}
                      disabled={pincodeStatus === "checking"}
                      className="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-6 py-3 text-xs font-black text-blue-400 transition-all hover:bg-blue-500 hover:text-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                    >
                      {pincodeStatus === "checking" ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Checking...
                        </span>
                      ) : (
                        "Check PIN"
                      )}
                    </button>
                  </div>

                  {pincodeStatus === "allowed" && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                      <Check className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{pincodeMessage}</span>
                    </div>
                  )}

                  {pincodeStatus === "blocked" && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20 text-xs font-bold leading-relaxed text-red-400">
                      <PackageX className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{pincodeMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QUANTITY */}
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</span>
              <div className="flex items-center rounded-2xl border border-white/10 bg-[#111214] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((old) => Math.max(1, old - 1))}
                  className="rounded-xl p-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition active:scale-90"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-extrabold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((old) => old + 1)}
                  className="rounded-xl p-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition active:scale-90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
              <span className="text-sm font-semibold text-gray-400">Total Price</span>
              <span className="text-3xl font-black text-white tracking-tight">₹{total}</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={buyNow}
                disabled={isOutOfStock}
                className={`rounded-2xl py-4 text-center text-sm font-black shadow-lg transition-all active:scale-95 ${
                  isOutOfStock
                    ? "cursor-not-allowed bg-gray-700 text-gray-400 shadow-none"
                    : "bg-orange-500 text-black shadow-orange-500/20 hover:bg-orange-400 hover:shadow-orange-400/30"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </button>

              <button
                type="button"
                onClick={addToCart}
                disabled={isOutOfStock}
                className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-black transition-all active:scale-95 ${
                  isOutOfStock
                    ? "cursor-not-allowed border-white/10 bg-gray-700 text-gray-400"
                    : "border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            {/* SERVICE INFORMATIONS */}
            <div className="mt-8 divide-y divide-white/10 rounded-3xl border border-white/10 bg-[#111214] p-5 text-xs text-gray-400 space-y-3">
              <div className="flex items-center gap-3.5 pt-1">
                <div className="rounded-xl bg-orange-500/10 p-2 text-orange-400">
                  <Truck className="h-4 w-4" />
                </div>
                <span>Pickup options available during checkout.</span>
              </div>
              <div className="flex items-center gap-3.5 pt-3">
                <div className="rounded-xl bg-orange-500/10 p-2 text-orange-400">
                  <Wrench className="h-4 w-4" />
                </div>
                <span>Custom crafted and prepared by Imphal3D.</span>
              </div>
              <div className="flex items-center gap-3.5 pt-3">
                <div className="rounded-xl bg-orange-500/10 p-2 text-orange-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span>Need assistance? Contact our team anytime.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showImageModal && displayedImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`Large view of ${product.name}`}
          onClick={() => setShowImageModal(false)}
        >
          <button
            type="button"
            onClick={() => setShowImageModal(false)}
            className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl font-light text-white transition hover:bg-white/20"
            aria-label="Close image"
          >
            ×
          </button>

          <div
            className="relative flex max-h-[92vh] max-w-[95vw] flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[78vh] max-w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-[#08090a] shadow-2xl">
              <img
                src={displayedImage}
                alt={`${product.name} enlarged`}
                className="max-h-[78vh] max-w-[92vw] object-contain"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="flex max-w-[92vw] gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md">
                {galleryImages.map((image) => {
                  const isSelected =
                    image.src === displayedImage;

                  return (
                    <button
                      key={`modal-${image.key}`}
                      type="button"
                      onClick={() => {
                        if (image.key.startsWith("colour-")) {
                          const colour = image.key.replace("colour-", "");
                          setSelectedColour(colour);
                        } else {
                          setSelectedColour("");
                        }
                      }}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        isSelected
                          ? "border-orange-500"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View ${image.label} in fullscreen`}
                      title={image.label}
                    >
                      <img
                        src={image.src}
                        alt={image.label}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="rounded-full border border-white/10 bg-black/65 px-4 py-2 text-xs font-semibold text-gray-200 backdrop-blur-md">
              {selectedColour || "Main photo"} · Click outside to close
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-16 border-t border-white/10 bg-[#111214]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="text-2xl font-black tracking-tight">
                Imphal<span className="text-orange-500">3D</span>
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-[0.3em] text-gray-500">
                PRINTED WITH PASSION
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-400">
                Need help with your order, pickup, or customization?
                Contact Imphal3D directly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:+919774424640"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#08090a] px-4 py-3 text-xs font-bold text-white transition-all hover:border-orange-500/50 hover:bg-white/5 active:scale-95"
                >
                  <Phone className="h-4 w-4 text-orange-400" /> +91 97744 24640
                </a>
                <a
                  href="https://wa.me/919774424640"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 fill-current" /> WhatsApp
                </a>
                <a
                  href="mailto:imphal3d@gmail.com"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#08090a] px-4 py-3 text-xs font-bold text-white transition-all hover:border-orange-500/50 hover:bg-white/5 active:scale-95"
                >
                  ✉️ imphal3d@gmail.com
                </a>
                <a
                  href="https://www.instagram.com/imphal_3d?igsi=MTVsNjRoZ3ZrZ3dzYQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#08090a] px-4 py-3 text-xs font-bold text-white transition-all hover:border-pink-500/50 hover:bg-white/5 active:scale-95"
                >
                  📸 Instagram @imphal_3d
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-black tracking-[0.25em] text-orange-500 uppercase">
                PICKUP LOCATIONS
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Open either pickup point in Google Maps.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <a
                  href="https://maps.app.goo.gl/h3ZzrtKESCrc2dfNA"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-3xl border border-white/10 bg-[#08090a] p-5 transition-all duration-300 hover:border-orange-500/50 hover:bg-[#16181c] active:scale-95"
                >
                  <div className="flex items-center gap-2 text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                    <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                    Pickup Location 1
                  </div>
                  <span className="mt-2 block text-xs text-gray-500">
                    Open in Google Maps →
                  </span>
                </a>

                <a
                  href="https://maps.app.goo.gl/TMppWL8kLyiLkEjk7?g_st=ic"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-3xl border border-white/10 bg-[#08090a] p-5 transition-all duration-300 hover:border-orange-500/50 hover:bg-[#16181c] active:scale-95"
                >
                  <div className="flex items-center gap-2 text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                    <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                    Pickup Location 2
                  </div>
                  <span className="mt-2 block text-xs text-gray-500">
                    Open in Google Maps →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
