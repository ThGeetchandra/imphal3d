"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Package,
  Plus,
  X,
  Pencil,
  Trash2,
  UploadCloud,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  Tag,
  Palette,
  Ruler,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Loader2,
  CheckCircle2,
  Phone,
} from "lucide-react";

type ColourImageMap = Record<string, string>;
type SizePriceMap = Record<string, number>;

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  offer_price: number | null;
  image_url: string | null;
  colour_images: ColourImageMap | null;
  size_prices: SizePriceMap | null;
  category: string | null;
  available_colours: string[] | null;
  available_sizes: string[] | null;
  is_available: boolean;
  is_customizable: boolean;
  is_phone_number_customizable: boolean;
  stock_quantity: number | null;
  created_at: string;
};

const colours = [
  "Red",
  "Blue",
  "Green",
  "White",
  "Black",
  "Yellow",
  "Purple",
  "Pink",
  "Same as Photo",
];

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [category, setCategory] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const [colourFiles, setColourFiles] = useState<Record<string, File | null>>({});
  const [colourPreviews, setColourPreviews] = useState<Record<string, string>>({});
  const [existingColourImages, setExistingColourImages] = useState<ColourImageMap>({});

  const [selectedColours, setSelectedColours] = useState<string[]>([]);

  // Size + size price
  const [sizes, setSizes] = useState("");
  const [sizePrices, setSizePrices] = useState<SizePriceMap>({});
  const [existingSizePrices, setExistingSizePrices] = useState<SizePriceMap>({});

  const [isAvailable, setIsAvailable] = useState(true);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [isPhoneNumberCustomizable, setIsPhoneNumberCustomizable] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    setEmail(user.email || "");
    await loadProducts();
  }

  async function loadProducts() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setProducts((data || []) as Product[]);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setOriginalPrice("");
    setOfferPrice("");
    setCategory("");

    setImageFile(null);
    setImagePreview("");
    setExistingImageUrl("");

    setColourFiles({});
    setColourPreviews({});
    setExistingColourImages({});

    setSelectedColours([]);

    setSizes("");
    setSizePrices({});
    setExistingSizePrices({});

    setIsAvailable(true);
    setIsCustomizable(false);
    setIsPhoneNumberCustomizable(false);
    setStockQuantity("");
    setShowProductForm(false);
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Please choose an image smaller than 10 MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleColourImageChange(
    colour: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Please choose an image smaller than 10 MB.");
      return;
    }

    setColourFiles((current) => ({
      ...current,
      [colour]: file,
    }));

    setColourPreviews((current) => ({
      ...current,
      [colour]: URL.createObjectURL(file),
    }));
  }

  function editProduct(product: Product) {
    setShowProductForm(true);
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");

    setOriginalPrice(
      product.original_price !== null ? String(product.original_price) : ""
    );

    setOfferPrice(
      product.offer_price !== null
        ? String(product.offer_price)
        : String(product.price)
    );

    setCategory(product.category || "");

    setExistingImageUrl(product.image_url || "");
    setImageFile(null);
    setImagePreview("");

    setExistingColourImages(product.colour_images || {});
    setColourFiles({});
    setColourPreviews({});

    setSelectedColours(product.available_colours || []);

    const savedSizes = product.available_sizes || [];
    setSizes(savedSizes.join(", "));

    setExistingSizePrices(product.size_prices || {});
    setSizePrices(product.size_prices || {});

    setIsAvailable(product.is_available);
    setIsCustomizable(product.is_customizable);
    setIsPhoneNumberCustomizable(product.is_phone_number_customizable ?? false);
    setStockQuantity(
      product.stock_quantity !== null && product.stock_quantity !== undefined
        ? String(product.stock_quantity)
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleColour(colour: string) {
    setSelectedColours((current) => {
      if (current.includes(colour)) {
        return current.filter((item) => item !== colour);
      }
      return [...current, colour];
    });
  }

  function handleSizesChange(value: string) {
    setSizes(value);

    const newSizes = value
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);

    setSizePrices((current) => {
      const next: SizePriceMap = {};

      for (const size of newSizes) {
        if (current[size] !== undefined) {
          next[size] = current[size];
        }
      }

      return next;
    });
  }

  function updateSizePrice(size: string, value: string) {
    const numeric = value === "" ? undefined : Number(value);

    setSizePrices((current) => {
      const next = { ...current };

      if (numeric === undefined || Number.isNaN(numeric)) {
        delete next[size];
      } else {
        next[size] = numeric;
      }

      return next;
    });
  }

  async function uploadProductImage(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName =
      name.trim().replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() || "product";

    const filePath = `products/${Date.now()}-${safeName}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw new Error("Could not upload product image: " + error.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function uploadColourImage(file: File, colour: string) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName =
      name.trim().replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() || "product";
    const safeColour = colour.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();

    const filePath = `colours/${Date.now()}-${safeName}-${safeColour}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw new Error(`Could not upload ${colour} image: ${error.message}`);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function deleteStorageImage(imageUrl: string | null) {
    if (!imageUrl) return;

    const marker = "/storage/v1/object/public/product-images/";
    if (!imageUrl.includes(marker)) return;

    const filePath = imageUrl.split(marker)[1];
    if (!filePath) return;

    await supabase.storage.from("product-images").remove([filePath]);
  }

  function parsedSizes() {
    return sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Please enter a product name.");
      return;
    }

    const original =
      originalPrice.trim() === "" ? null : Number(originalPrice);
    const offer = offerPrice.trim() === "" ? null : Number(offerPrice);

    if (original !== null && (Number.isNaN(original) || original < 0)) {
      alert("Please enter a valid original price.");
      return;
    }

    if (offer !== null && (Number.isNaN(offer) || offer < 0)) {
      alert("Please enter a valid offer price.");
      return;
    }

    if (original !== null && offer !== null && offer > original) {
      alert("Offer price cannot be higher than the original price.");
      return;
    }

    const stock =
      stockQuantity.trim() === "" ? null : Number(stockQuantity);

    if (
      stock !== null &&
      (Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0)
    ) {
      alert("Please enter a valid stock quantity (0 or more).");
      return;
    }

    const availableSizes = parsedSizes();

    if (availableSizes.length === 0) {
      alert("Please enter at least one size.");
      return;
    }

    for (const size of availableSizes) {
      const price = sizePrices[size];

      if (price === undefined || Number.isNaN(price) || price < 0) {
        alert(`Please enter a valid price for ${size}.`);
        return;
      }
    }

    setSaving(true);

    try {
      let finalImageUrl = existingImageUrl || null;

      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile);
      }

      const finalColourImages: ColourImageMap = {
        ...existingColourImages,
      };

      for (const colour of selectedColours) {
        const file = colourFiles[colour];

        if (file) {
          finalColourImages[colour] = await uploadColourImage(file, colour);
        }
      }

      Object.keys(finalColourImages).forEach((colour) => {
        if (!selectedColours.includes(colour)) {
          delete finalColourImages[colour];
        }
      });

      const finalSizePrices: SizePriceMap = {};

      for (const size of availableSizes) {
        finalSizePrices[size] = sizePrices[size];
      }

      const baseSizePrice = finalSizePrices[availableSizes[0]] ?? 0;

      const productData = {
        name: name.trim(),
        description: description.trim() || null,
        price: offer !== null ? offer : baseSizePrice,
        original_price: original,
        offer_price: offer,
        image_url: finalImageUrl,
        colour_images: finalColourImages,
        size_prices: finalSizePrices,
        category: category.trim() || null,
        available_colours: selectedColours,
        available_sizes: availableSizes,
        is_available: isAvailable,
        is_customizable: isCustomizable,
        is_phone_number_customizable: isPhoneNumberCustomizable,
        stock_quantity: stock,
      };

      if (editingId !== null) {
        const { data: oldProduct } = await supabase
          .from("products")
          .select("image_url, colour_images")
          .eq("id", editingId)
          .single();

        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);

        if (error) {
          throw new Error(error.message);
        }

        if (
          imageFile &&
          oldProduct?.image_url &&
          oldProduct.image_url !== finalImageUrl
        ) {
          await deleteStorageImage(oldProduct.image_url);
        }

        if (oldProduct?.colour_images) {
          const oldMap = oldProduct.colour_images as ColourImageMap;

          for (const colour of Object.keys(oldMap)) {
            const oldUrl = oldMap[colour];
            const newUrl = finalColourImages[colour];

            if (oldUrl && oldUrl !== newUrl) {
              await deleteStorageImage(oldUrl);
            }
          }
        }

        alert("Product updated successfully.");
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) {
          throw new Error(error.message);
        }

        alert("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Product save error:", error);

      alert(
        error instanceof Error ? error.message : "Could not save the product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert("Could not delete the product.\n\n" + error.message);
      return;
    }

    if (product.image_url) {
      await deleteStorageImage(product.image_url);
    }

    if (product.colour_images) {
      for (const url of Object.values(product.colour_images)) {
        await deleteStorageImage(url);
      }
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
  }

  async function toggleAvailability(product: Product) {
    const newValue = !product.is_available;

    const { error } = await supabase
      .from("products")
      .update({
        is_available: newValue,
      })
      .eq("id", product.id);

    if (error) {
      alert("Could not change availability.");
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              is_available: newValue,
            }
          : item
      )
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

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
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }

    if (stockQuantity <= 0) {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    if (stockQuantity <= 5) {
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    }

    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  function calculateDiscount(product: Product) {
    if (
      product.original_price === null ||
      product.offer_price === null ||
      product.original_price <= 0 ||
      product.offer_price >= product.original_price
    ) {
      return null;
    }

    return Math.round(
      ((product.original_price - product.offer_price) /
        product.original_price) *
        100
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090a] text-white">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="text-sm font-medium tracking-wide text-gray-400">
            Loading products...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090a] text-white selection:bg-orange-500 selection:text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#111214]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-2xl font-black tracking-tight md:text-3xl">
              <span>Imphal</span>
              <span className="text-orange-500">3D</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Product Management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs font-medium text-gray-400 md:inline-block">
              {email}
            </span>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 transition hover:text-orange-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-black tracking-[0.3em] text-orange-500">
            <Tag className="h-4 w-4" />
            <span>PRODUCTS</span>
          </div>

          <h1 className="mt-2 text-3xl font-black md:text-5xl">
            Product Management
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your store catalog. Add, edit, or remove products effortlessly.
          </p>
        </div>

        {/* MAIN PRODUCT LIST */}
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black md:text-2xl">Your Products</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Showing {products.length} product
                {products.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadProducts}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111214] px-4 py-2.5 text-xs font-bold text-gray-300 transition hover:border-orange-500/50 hover:text-orange-400"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (showProductForm) {
                    resetForm();
                  } else {
                    setShowProductForm(true);
                    setEditingId(null);
                  }
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-black shadow-lg shadow-orange-500/20 transition hover:scale-105 hover:bg-orange-400"
                aria-label={
                  showProductForm ? "Close product form" : "Add product"
                }
                title={
                  showProductForm ? "Close product form" : "Add product"
                }
              >
                {showProductForm ? (
                  <X className="h-6 w-6 stroke-[2.5]" />
                ) : (
                  <Plus className="h-6 w-6 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* FORM COLLAPSIBLE */}
          {showProductForm && (
            <div className="mb-10 rounded-3xl border border-white/10 bg-[#111214] p-6 shadow-2xl md:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-2xl font-black">
                    {editingId !== null ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Fill in details regarding pricing, variations, and photo assets.
                  </p>
                </div>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 transition hover:bg-white/10"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={saveProduct} className="mt-6 space-y-8">
                {/* PRODUCT NAME */}
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider uppercase text-gray-400">
                    Product Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sanamahi Wall Lamp"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#08090a] px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-orange-500"
                  />
                </div>

                {/* GENERAL OFFER */}
                <div>
                  <div className="mb-3">
                    <p className="text-xs font-bold tracking-wider uppercase text-gray-400">
                      General Offer
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      The offer discount percentage will apply across all sizes.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-400">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="999"
                        className="w-full rounded-xl border border-white/10 bg-[#08090a] px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-orange-400">
                        Offer Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="899"
                        className="w-full rounded-xl border border-orange-500/30 bg-[#08090a] px-4 py-3.5 text-sm text-orange-400 placeholder-gray-600 outline-none transition focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider uppercase text-gray-400">
                    Category
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="LED Wall Lights"
                    className="w-full rounded-xl border border-white/10 bg-[#08090a] px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-orange-500"
                  />
                </div>

                {/* MAIN IMAGE */}
                <div>
                  <label className="mb-3 block text-xs font-bold tracking-wider uppercase text-gray-400">
                    Main Product Photo
                  </label>

                  <label className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-[#08090a] p-4 transition hover:border-orange-500/50 hover:bg-orange-500/[0.02]">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="New product preview"
                        className="max-h-[220px] w-full object-contain"
                      />
                    ) : existingImageUrl ? (
                      <img
                        src={existingImageUrl}
                        alt="Current product"
                        className="max-h-[220px] w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-white/5 p-4 text-orange-500 group-hover:scale-110 transition">
                          <UploadCloud className="h-8 w-8" />
                        </div>
                        <p className="mt-3 text-sm font-bold text-gray-200">
                          Upload Main Photo
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG or JPEG • Max 10 MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imageFile && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{imageFile.name} selected</span>
                    </div>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider uppercase text-gray-400">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product..."
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-[#08090a] px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-orange-500"
                  />
                </div>

                {/* COLOURS */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-orange-500" />
                    <label className="text-xs font-bold tracking-wider uppercase text-gray-400">
                      Available Colours
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {colours.map((colour) => {
                      const selected = selectedColours.includes(colour);

                      return (
                        <button
                          key={colour}
                          type="button"
                          onClick={() => toggleColour(colour)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                            selected
                              ? "border-orange-500 bg-orange-500 text-black"
                              : "border-white/10 bg-[#08090a] text-gray-400 hover:border-orange-500/50 hover:text-white"
                          }`}
                        >
                          {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          {colour}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLOUR PHOTOS */}
                {selectedColours.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-[#08090a] p-5">
                    <h3 className="text-base font-bold">Colour Variations</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Assign distinct image assets to selected color variants.
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {selectedColours.map((colour) => {
                        const preview = colourPreviews[colour];
                        const existing = existingColourImages[colour];

                        return (
                          <div
                            key={colour}
                            className="rounded-xl border border-white/10 bg-[#111214] p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-200">
                                {colour}
                              </span>
                              {existing && !preview && (
                                <span className="text-[10px] font-semibold text-green-400">
                                  Has Image
                                </span>
                              )}
                            </div>

                            <label className="mt-3 flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/10 bg-[#08090a] transition hover:border-orange-500">
                              {preview ? (
                                <img
                                  src={preview}
                                  alt={`${colour} product`}
                                  className="h-full w-full object-contain"
                                />
                              ) : existing ? (
                                <img
                                  src={existing}
                                  alt={`${colour} product`}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="flex flex-col items-center text-center p-2">
                                  <UploadCloud className="h-6 w-6 text-gray-500" />
                                  <p className="mt-2 text-xs font-bold text-gray-400">
                                    Upload Photo
                                  </p>
                                </div>
                              )}

                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) =>
                                  handleColourImageChange(colour, e)
                                }
                                className="hidden"
                              />
                            </label>

                            {colourFiles[colour] && (
                              <p className="mt-2 text-[10px] text-green-400 truncate">
                                ✓ {colourFiles[colour]?.name}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SIZE + PRICE */}
                <div className="rounded-2xl border border-white/10 bg-[#08090a] p-5">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-orange-500" />
                    <h3 className="text-base font-bold">Sizes & Pricing</h3>
                  </div>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Separate dimensions or sizes using commas.
                  </p>

                  <input
                    value={sizes}
                    onChange={(e) => handleSizesChange(e.target.value)}
                    placeholder="230mm, 300mm, 400mm"
                    className="mt-4 w-full rounded-xl border border-white/10 bg-[#111214] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-orange-500"
                  />

                  {parsedSizes().length > 0 && (
                    <div className="mt-4 space-y-2.5">
                      {parsedSizes().map((size) => (
                        <div
                          key={size}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111214] p-3.5"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-200">
                              {size}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Base price for size
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-500">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={sizePrices[size] ?? ""}
                              onChange={(e) =>
                                updateSizePrice(size, e.target.value)
                              }
                              placeholder="899"
                              className="w-28 rounded-lg border border-white/10 bg-[#08090a] px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PERSONALIZATION */}
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 shrink-0 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-purple-300">
                        Personalized Product
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
                        Enable if users should provide names or text input for customization.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isCustomizable}
                      onChange={(e) => setIsCustomizable(e.target.checked)}
                      className="h-4 w-4 rounded accent-purple-500"
                    />
                  </div>
                </div>

                {/* PHONE NUMBER PERSONALIZATION */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-300">
                        Phone Number Personalization
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
                        Enable this for products where customers should provide a phone number, such as personalized name tags.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isPhoneNumberCustomizable}
                      onChange={(e) =>
                        setIsPhoneNumberCustomizable(e.target.checked)
                      }
                      className="h-4 w-4 rounded accent-blue-500"
                    />
                  </div>
                </div>

                {/* STOCK */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-start gap-3">
                    <Package className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-300">
                        Stock Quantity
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
                        Enter how many pieces are currently available. Leave
                        blank if you do not want to show stock information.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Pieces Available
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={stockQuantity}
                        onChange={(e) =>
                          setStockQuantity(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="e.g. 5"
                        className="w-full rounded-xl border border-white/10 bg-[#08090a] px-4 py-3 text-sm font-bold text-white placeholder-gray-600 outline-none transition focus:border-emerald-500"
                      />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#08090a] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Customer will see
                      </p>
                      <p className="mt-2 text-sm font-black text-emerald-400">
                        {stockQuantity.trim() === ""
                          ? "Stock not displayed"
                          : Number(stockQuantity) === 0
                            ? "Out of Stock"
                            : Number(stockQuantity) <= 5
                              ? `Only ${Number(stockQuantity)} ${
                                  Number(stockQuantity) === 1
                                    ? "piece"
                                    : "pieces"
                                } left`
                              : "In Stock"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AVAILABILITY */}
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 rounded accent-orange-500"
                  />
                  <span className="text-xs font-bold text-gray-300">
                    Product active & available for purchase
                  </span>
                </label>

                {/* SAVE BUTTON */}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading & Saving...</span>
                    </>
                  ) : editingId !== null ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>Add Product</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* EMPTY STATE */}
          {!error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111214] p-12 text-center">
              <div className="rounded-full bg-white/5 p-4 text-gray-500">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-black text-gray-200">
                No Products Found
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Get started by clicking the '+' button to list your first item.
              </p>
            </div>
          )}

          {/* PRODUCT CARDS GRID */}
          {!error && products.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const discount = calculateDiscount(product);
                const productSizes = product.available_sizes || [];

                return (
                  <div
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111214] transition hover:border-white/20"
                  >
                    {/* CARD IMAGE HEADER */}
                    <div className="relative flex h-52 items-center justify-center bg-[#08090a]">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-contain p-4"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-600">
                          <Package className="h-12 w-12" />
                        </div>
                      )}

                      {discount !== null && (
                        <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-black tracking-wider uppercase text-white shadow">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* CARD BODY */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-black text-white">
                            {product.name}
                          </h3>

                          {product.category && (
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              {product.category}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {product.is_customizable && (
                            <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                              Name
                            </span>
                          )}

                          {product.is_phone_number_customizable && (
                            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                              Phone
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              product.is_available
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {product.is_available ? "Available" : "Hidden"}
                          </span>
                          {getStockLabel(product.stock_quantity) && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStockClasses(
                                product.stock_quantity
                              )}`}
                            >
                              {getStockLabel(product.stock_quantity)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SIZE PRICES SUMMARY */}
                      {productSizes.length > 0 && (
                        <div className="mt-4 space-y-1.5 flex-1">
                          {productSizes.map((size) => {
                            const base = product.size_prices?.[size];
                            const sale =
                              product.original_price !== null &&
                              product.offer_price !== null &&
                              product.original_price > 0 &&
                              base !== undefined
                                ? Math.round(
                                    base *
                                      (product.offer_price /
                                        product.original_price)
                                  )
                                : base;

                            return (
                              <div
                                key={size}
                                className="flex items-center justify-between rounded-lg border border-white/5 bg-[#08090a] px-3 py-1.5"
                              >
                                <span className="text-xs font-medium text-gray-400">
                                  {size}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {sale !== undefined &&
                                    base !== undefined &&
                                    sale < base && (
                                      <span className="text-[10px] text-gray-500 line-through">
                                        ₹{base}
                                      </span>
                                    )}

                                  <span className="text-xs font-black text-orange-500">
                                    ₹{sale ?? base ?? product.price}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {product.colour_images &&
                        Object.keys(product.colour_images).length > 0 && (
                          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-green-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>
                              {Object.keys(product.colour_images).length}{" "}
                              colour variants available
                            </span>
                          </div>
                        )}
                      {product.stock_quantity !== null &&
                        product.stock_quantity !== undefined && (
                          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold">
                            <span
                              className={`rounded-full border px-2.5 py-1 ${getStockClasses(
                                product.stock_quantity
                              )}`}
                            >
                              Stock: {product.stock_quantity}
                            </span>
                          </div>
                        )}

                      {/* ACTIONS */}
                      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                        <button
                          onClick={() => editProduct(product)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-gray-300 transition hover:border-orange-500/50 hover:text-orange-400"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => toggleAvailability(product)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-gray-300 transition hover:border-blue-500/50 hover:text-blue-400"
                        >
                          {product.is_available ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              <span>Show</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => deleteProduct(product)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
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