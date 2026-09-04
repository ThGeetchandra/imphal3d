"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function CheckoutContent() {
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") || "";
  const customName = searchParams.get("customName") || "";
  const phoneNumber = searchParams.get("phoneNumber") || "";
  const isCustomizable =
    searchParams.get("isCustomizable") === "1";

  const isCartCheckout =
    searchParams.get("cart") === "1";

  const [cartItems, setCartItems] = useState<
    Array<{
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
    }>
  >([]);

  // =========================
  // ORDER DETAILS
  // =========================

  const product =
    searchParams.get("product") ||
    "Sanamahi Wall Lamp 230mm";

  const colour =
    searchParams.get("colour") ||
    "Green";

  const size = searchParams.get("size") || "";
  const pincode =
    (searchParams.get("pincode") || "")
      .replace(/\D/g, "")
      .slice(0, 6);

  const quantity =
    Number(searchParams.get("quantity")) || 1;

  const passedPrice = Number(searchParams.get("price"));
  const price = Number.isFinite(passedPrice) && passedPrice > 0 ? passedPrice : 899;
  const total = price * quantity;

  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.price) || 0) *
        (Number(item.quantity) || 0),
    0
  );

  const checkoutTotal =
    isCartCheckout ? cartTotal : total;

  const checkoutProduct =
    isCartCheckout
      ? cartItems.map(
          (item) =>
            `${item.name} × ${item.quantity}`
        ).join("\n")
      : product;

  const checkoutDetails =
    isCartCheckout
      ? cartItems
          .map((item) =>
            [
              `Product: ${item.name}`,
              `Colour: ${item.colour || "Not selected"}`,
              `Size: ${item.size || "Not selected"}`,
              item.customName
                ? `Name / Text to Print: ${item.customName}`
                : "",
              item.phoneNumber
                ? `Phone Number to Print: ${item.phoneNumber}`
                : "",
              `Quantity: ${item.quantity}`,
              `Price: ₹${item.price}`,
              item.pincode ? `PIN Code: ${item.pincode}` : "",
            ]
              .filter(Boolean)
              .join("\n")
          )
          .join("\n\n")
      : "";

  const needsPrintName =
    isCustomizable && !isCartCheckout;

  const [savingOrder, setSavingOrder] = useState(false);


  // =========================
  // CUSTOMER DETAILS
  // =========================

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] =
    useState("");


  // =========================
  // PICKUP
  // =========================

  const [pickupLocation, setPickupLocation] =
    useState("");


  // =========================
  // PAYMENT
  // =========================

  const [utr, setUtr] =
    useState("");

  const [orderSubmitted, setOrderSubmitted] =
    useState(false);

  const [submittedOrderNumber, setSubmittedOrderNumber] =
    useState("");

  const [submittedTrackingUrl, setSubmittedTrackingUrl] =
    useState("");

  const [formError, setFormError] = useState("");

  // =========================
  // PAYMENT READY
  // =========================

  useEffect(() => {
    if (!isCartCheckout) return;

    try {
      const saved = localStorage.getItem("imphal3d-cart-checkout");
      const parsed = saved ? JSON.parse(saved) : [];

      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      }
    } catch {
      setCartItems([]);
    }
  }, [isCartCheckout]);

  const cleanPhone = phone.replace(/\D/g, "");
  const customerDetailsReady =
    customerName.trim().length >= 2 &&
    cleanPhone.length === 10 &&
    pincode.length === 6 &&
    Boolean(pickupLocation);

  const paymentReady =
    customerDetailsReady && utr.length === 12;


  // =========================
  // WHATSAPP ORDER
  // =========================

  function generateOrderNumber() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const random = Math.floor(
      100000 + Math.random() * 900000
    );

    return `I3D-${year}${month}${day}-${random}`;
  }

  const sendToWhatsApp = async () => {
    setFormError("");

    if (customerName.trim().length < 2) {
      setFormError("Please enter your full name.");
      return;
    }

    if (cleanPhone.length !== 10) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!pickupLocation) {
      setFormError("Please select a pickup location.");
      return;
    }

    if (pincode.length !== 6) {
      setFormError("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (utr.length !== 12) {
      setFormError("Please enter the exact 12-digit UTR / Transaction ID.");
      return;
    }

    if (savingOrder) return;

    setSavingOrder(true);

    const { data: pincodeData, error: pincodeError } =
      await supabase.rpc(
        "check_serviceable_pincode",
        { p_pincode: pincode }
      );

    const pincodeAllowed =
      !pincodeError &&
      (Array.isArray(pincodeData)
        ? Boolean(pincodeData[0])
        : Boolean(pincodeData));

    if (!pincodeAllowed) {
      setSavingOrder(false);
      alert(
        pincodeError
          ? "We could not verify your PIN code. Please try again."
          : "We currently do not have a pickup location for this PIN code. Please contact Imphal3D before placing your order, as it may be difficult for you to pick up the order from our available pickup locations."
      );
      return;
    }

    const orderNumber = generateOrderNumber();

    const customerRequest = [
      needsPrintName && customName.trim()
        ? `Name / Text to Print: ${customName.trim()}`
        : "",
      `Quantity: ${quantity}`,
      `Pickup Location: ${pickupLocation}`,
      `PIN Code: ${pincode}`,
      productId ? `Product ID: ${productId}` : "",
    ].filter(Boolean).join("\\n");

    const { data: savedOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        customer_email: null,
        product_name: checkoutProduct,
        product_size: isCartCheckout ? "Multiple" : (size || null),
        color: isCartCheckout ? "Multiple" : colour,
        custom_description:
          isCartCheckout
            ? checkoutDetails
            : customerRequest || null,
        transaction_id: utr,
        reference_photo_url: null,
        amount: checkoutTotal,
        status: "New",
      })
      .select("id")
      .single();

    if (orderError || !savedOrder) {
      console.error("Order save error:", orderError);
      setSavingOrder(false);
      alert(
        "Your order could not be saved.\\n\\n" +
          (orderError?.message || "No order ID was returned.")
      );
      return;
    }

    /*
     * Save every cart/product line as its own order_items row.
     * The parent order above is still kept in the existing orders table
     * so the current admin/tracking system remains compatible.
     */
    const orderItems = isCartCheckout
      ? cartItems
          .filter(
            (item) =>
              Number(item.productId) > 0 &&
              Number(item.quantity) > 0 &&
              Number(item.price) >= 0
          )
          .map((item) => ({
            order_id: Number(savedOrder.id),
            product_id: Number(item.productId),
            product_name: item.name,
            colour: item.colour || null,
            size: item.size || null,
            quantity: Number(item.quantity),
            unit_price: Number(item.price),
            custom_name: item.customName?.trim() || null,
            phone_number: item.phoneNumber?.trim() || null,
            pincode: item.pincode || pincode || null,
          }))
      : [
          {
            order_id: Number(savedOrder.id),
            product_id:
              productId && Number(productId) > 0
                ? Number(productId)
                : null,
            product_name: product,
            colour: colour || null,
            size: size || null,
            quantity,
            unit_price: price,
            custom_name:
              needsPrintName && customName.trim()
                ? customName.trim()
                : null,
            phone_number: phoneNumber.trim() || null,
            pincode: pincode || null,
          },
        ];

    if (orderItems.length === 0) {
      await supabase.from("orders").delete().eq("id", savedOrder.id);
      setSavingOrder(false);
      alert("Your order could not be saved because it contains no valid items.");
      return;
    }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items save error:", itemsError);

      // Roll back the parent order so we do not leave an incomplete order.
      await supabase.from("orders").delete().eq("id", savedOrder.id);

      setSavingOrder(false);
      alert(
        "Your order could not be completed.\\n\\n" +
          itemsError.message +
          "\\n\\nPlease try again."
      );
      return;
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      window.location.origin;

    const trackingUrl =
      `${siteUrl.replace(/\/$/, "")}/track-order?order=${encodeURIComponent(orderNumber)}`;

    setSubmittedOrderNumber(orderNumber);
    setSubmittedTrackingUrl(trackingUrl);
    setOrderSubmitted(true);

    if (isCartCheckout) {
      localStorage.removeItem("imphal3d-cart");
      localStorage.removeItem("imphal3d-cart-checkout");
      window.dispatchEvent(new Event("cart-updated"));
    }

    const whatsappProducts = isCartCheckout
      ? cartItems
          .map((item, index) =>
            [
              `${index + 1}. ${item.name}`,
              `   Colour: ${item.colour || "Not selected"}`,
              `   Size: ${item.size || "Not selected"}`,
              item.customName
                ? `   Name / Text to Print: ${item.customName}`
                : "",
              item.phoneNumber
                ? `   Phone Number to Print: ${item.phoneNumber}`
                : "",
              `   Quantity: ${item.quantity}`,
              `   Unit Price: ₹${item.price}`,
              `   Item Total: ₹${(
                Number(item.price) * Number(item.quantity)
              ).toLocaleString("en-IN")}`,
              item.pincode
                ? `   PIN Code: ${item.pincode}`
                : "",
            ]
              .filter(Boolean)
              .join("\n")
          )
          .join("\n\n")
      : [
          `Product: ${product}`,
          needsPrintName && customName
            ? `Name / Text to Print: ${customName}`
            : "",
          phoneNumber
            ? `Phone Number to Print: ${phoneNumber}`
            : "",
          `Colour: ${colour}`,
          size ? `Size: ${size}` : "",
          `Quantity: ${quantity}`,
          `Unit Price: ₹${price}`,
        ]
          .filter(Boolean)
          .join("\n");

    const message = `
Hello Imphal3D! 👋

I would like to place an order.

━━━━━━━━━━━━━━━━━━
ORDER INFORMATION
━━━━━━━━━━━━━━━━━━

Order Number: ${orderNumber}

Track your order:
${trackingUrl}

${whatsappProducts}

Total: ₹${checkoutTotal}

━━━━━━━━━━━━━━━━━━
CUSTOMER DETAILS
━━━━━━━━━━━━━━━━━━

Customer / Purchaser Name: ${customerName}
Phone: ${cleanPhone}

━━━━━━━━━━━━━━━━━━
PICKUP LOCATION
━━━━━━━━━━━━━━━━━━

${pickupLocation}
PIN Code: ${pincode}

━━━━━━━━━━━━━━━━━━
PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━

Payment Method: PhonePe / UPI
Amount: ₹${checkoutTotal}
UTR / Transaction ID: ${utr}

━━━━━━━━━━━━━━━━━━

Thank you!
Imphal3D`.trim();

    const whatsappNumber = "919862135090";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    setSavingOrder(false);
    window.open(whatsappURL, "_blank");
  };


  if (orderSubmitted) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <a
            href="/"
            className="inline-block text-3xl font-black no-underline text-white"
          >
            Imphal<span className="text-orange-500">3D</span>
          </a>

          <p className="mt-1 text-[10px] tracking-[0.3em] text-gray-500">
            PRINTED WITH PASSION
          </p>

          <section className="mt-12 rounded-3xl border border-green-500/20 bg-[#0d1510] p-7 text-center shadow-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#25d366] text-3xl font-black text-black">
              ✓
            </div>

            <p className="mt-5 text-xs font-black tracking-[0.3em] text-green-400">
              ORDER SUBMITTED
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Thank you, your order is confirmed!
            </h1>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-400">
              Keep your Order Number safe. You can use it to track your
              order anytime.
            </p>

            <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-white/10 bg-[#08090a] p-5">
              <p className="text-[11px] font-black tracking-[0.2em] text-gray-500">
                ORDER NUMBER
              </p>

              <p className="mt-2 break-all text-2xl font-black sm:text-3xl">
                {submittedOrderNumber}
              </p>
            </div>

            <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#08090a] p-4">
                <p className="text-[10px] font-black tracking-widest text-gray-500">
                  PRODUCT
                </p>
                <p className="mt-2 font-black">
                  {checkoutProduct}
                </p>
              </div>

              {needsPrintName && customName && (
                <div className="rounded-2xl border border-white/10 bg-[#08090a] p-4">
                  <p className="text-[10px] font-black tracking-widest text-gray-500">
                    NAME / TEXT TO PRINT
                  </p>
                  <p className="mt-2 font-black">
                    {customName}
                  </p>
                </div>
              )}

              {phoneNumber && (
                <div className="rounded-2xl border border-white/10 bg-[#08090a] p-4">
                  <p className="text-[10px] font-black tracking-widest text-gray-500">
                    PHONE NUMBER TO PRINT
                  </p>
                  <p className="mt-2 font-black">
                    {phoneNumber}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-[#08090a] p-4">
                <p className="text-[10px] font-black tracking-widest text-gray-500">
                  CUSTOMER / PURCHASER
                </p>
                <p className="mt-2 font-black">
                  {customerName}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#08090a] p-4">
                <p className="text-[10px] font-black tracking-widest text-gray-500">
                  PICKUP PIN CODE
                </p>
                <p className="mt-2 font-black">
                  {pincode}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#08090a] p-4">
                <p className="text-[10px] font-black tracking-widest text-gray-500">
                  {isCartCheckout ? "ITEMS" : "QUANTITY"}
                </p>
                <p className="mt-2 font-black">
                  {isCartCheckout ? cartItems.length : quantity}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#08090a] p-4 sm:col-span-2">
                <p className="text-[10px] font-black tracking-widest text-gray-500">
                  TOTAL
                </p>
                <p className="mt-2 text-2xl font-black text-orange-500">
                  ₹{checkoutTotal}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href={submittedTrackingUrl}
                className="rounded-xl bg-orange-500 px-6 py-3 font-black text-black no-underline hover:bg-orange-400"
              >
                Track My Order
              </a>

              <a
                href="/"
                className="rounded-xl border border-white/10 bg-[#111214] px-6 py-3 font-black text-white no-underline hover:border-white/20"
              >
                Continue Shopping
              </a>
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Your order details have also been prepared for WhatsApp.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">


      {/* =========================
          HEADER
      ========================= */}

      <header className="checkout-header">

        <a
          href="/"
          className="logo"
        >

          <div className="logo-name">
            Imphal
            <span>3D</span>
          </div>

          <div className="logo-tagline">
            PRINTED WITH PASSION
          </div>

        </a>


        <a
          href={productId ? `/products/${productId}` : "/"}
          className="back-link"
        >
          ← Back to Product
        </a>

      </header>


      {/* =========================
          CHECKOUT
      ========================= */}

      <section className="checkout-container">


        <div className="checkout-label">
          CHECKOUT
        </div>


        <h1>
          Complete Your Order
        </h1>


        <div className="checkout-grid">


          {/* =========================
              CUSTOMER
          ========================= */}

          <div className="panel">

            <h2>
              Customer Details
            </h2>

            <div className="pin-reminder">
              <strong>Pickup PIN Code</strong>
              <span>
                We use your PIN code to confirm that pickup is available in your area.
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                readOnly
                placeholder="6-digit PIN"
                aria-label="Pickup PIN Code"
              />
              <p className="field-help">
                Pickup availability will be checked again when you place the order.
              </p>
            </div>


            <label>
              Full Name
            </label>


            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setFormError("");
              }}
              placeholder="Enter your full name"
              autoComplete="name"
            />


            <label>
              Phone Number
            </label>


            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                );
                setFormError("");
              }}
              placeholder="10-digit phone number"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
            />
            <p className="field-help">
              Enter the 10-digit number we can use to contact you about your order.
            </p>


            {formError && (
              <div className="form-error" role="alert">
                ⚠️ {formError}
              </div>
            )}

            {/* =========================
                PICKUP
            ========================= */}

            <h2 className="section-title">
              Pickup Location
            </h2>


            <p className="muted">
              We currently provide
              pickup only.
            </p>


            {/* WANGKHEI */}

            <button
              type="button"
              className={
                pickupLocation ===
                "Wangkhei"
                  ? "pickup selected"
                  : "pickup"
              }
              onClick={() =>
                setPickupLocation(
                  "Wangkhei"
                )
              }
            >

              <span className="pickup-icon">
                📍
              </span>


              <span>

                <strong>
                  Wangkhei
                </strong>

                <small>
                  Pickup location
                </small>

              </span>

            </button>


            {/* HAOBAM MARAK */}

            <button
              type="button"
              className={
                pickupLocation ===
                "Haobam Marak"
                  ? "pickup selected"
                  : "pickup"
              }
              onClick={() =>
                setPickupLocation(
                  "Haobam Marak"
                )
              }
            >

              <span className="pickup-icon">
                📍
              </span>


              <span>

                <strong>
                  Haobam Marak
                </strong>

                <small>
                  Pickup location
                </small>

              </span>

            </button>

          </div>


          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <div className="panel">

            <h2>
              Order Summary
            </h2>


            <div className="product-summary">

              <div className="summary-label">
                PRODUCT
              </div>


              <h3 className="whitespace-pre-line">
                {checkoutProduct}
              </h3>

              {isCartCheckout ? (
                <div className="cart-summary-details">
                  {cartItems.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="summary-item">
                      <div className="summary-row">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <strong>
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </strong>
                      </div>
                      <div className="summary-customization">
                        {item.colour && <span>Colour: {item.colour}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                        {item.customName && <span>Name: {item.customName}</span>}
                        {item.phoneNumber && <span>Phone: {item.phoneNumber}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                needsPrintName &&
                customName && (
                  <div className="summary-row">
                    <span>Name / Text to Print</span>
                    <strong>{customName}</strong>
                  </div>
                )
              )}

              {size && (
                <div className="summary-row">
                  <span>Size</span>
                  <strong>{size}</strong>
                </div>
              )}


              {!isCartCheckout && (
                <div className="summary-row">

                  <span>
                    Colour
                  </span>

                  <strong>
                    {colour}
                  </strong>

                </div>
              )}


              {!isCartCheckout && (
                <div className="summary-row">

                  <span>
                    Quantity
                  </span>

                  <strong>
                    {quantity}
                  </strong>

                </div>
              )}

            </div>


            {/* PRICE */}

            <div className="price-section">

              <div className="summary-row">

                <span>
                  Price
                </span>

                <strong>
                  ₹{isCartCheckout ? checkoutTotal : price}
                </strong>

              </div>


              {!isCartCheckout && (
                <div className="summary-row">

                  <span>
                    Quantity
                  </span>

                  <strong>
                    × {quantity}
                  </strong>

                </div>
              )}


              <div className="total-row">

                <span>
                  Total
                </span>

                <strong>
                  ₹{checkoutTotal}
                </strong>

              </div>

            </div>


            {/* =========================
                PAYMENT
            ========================= */}

            <div className="payment-box">


              <div className="payment-label">
                PAYMENT
              </div>


              <h2>
                Pay ₹{checkoutTotal}
              </h2>


              <p className="muted">
                Scan the QR code using
                PhonePe or another
                supported UPI app.
              </p>


              {/* QR CODE */}

              <div className="qr-container">

                <img
                  src="/product/phonepe-qr.jpeg"
                  alt="Imphal3D PhonePe payment QR code"
                  className="qr-code"
                />

              </div>


              {/* STEP 1 */}

              <div className="payment-instruction">

                <strong>
                  Step 1
                </strong>

                <span>
                  Scan the QR code and
                  complete the payment
                  of ₹{checkoutTotal}.
                </span>

              </div>


              {/* STEP 2 */}

              <div className="payment-instruction">

                <strong>
                  Step 2
                </strong>

                <span>
                  Open your PhonePe transaction details and find the 12-digit UTR.
                </span>

              </div>


              {/* UTR */}

              <label>
                UTR / Transaction ID
              </label>


              <input
                type="text"
                inputMode="numeric"
                value={utr}
                onChange={(e) => {

                  const value =
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 12);

                  setUtr(value);

                  setOrderSubmitted(
                    false
                  );

                }}
                placeholder="Enter 12-digit UTR"
                maxLength={12}
              />


              {/* COUNTER */}

              <div className="utr-counter">

                {utr.length} / 12 digits

              </div>


              {/* ERROR */}

              {utr.length > 0 &&
                utr.length < 12 && (

                  <p className="utr-error">

                    ⚠️ UTR must contain
                    exactly 12 digits.

                  </p>

                )}


              {/* SUCCESS */}

              {utr.length === 12 && (

                <p className="utr-success">

                  ✓ 12-digit UTR entered

                </p>

              )}


              {/* WARNING */}

              <p className="payment-warning">

                ⚠️ Please complete the
                payment before submitting
                your order.

              </p>


              {/* =========================
                  ORDER SUBMITTED STATUS
              ========================= */}

              {orderSubmitted && (

                <div className="submitted-box">

                  <div className="submitted-icon">
                    ✓
                  </div>


                  <div>

                    <strong>
                      Payment details submitted
                    </strong>

                    <p>
                      We will verify your
                      payment using the
                      submitted UTR.
                    </p>

                  </div>

                </div>

              )}


              {/* =========================
                  WHATSAPP BUTTON
              ========================= */}

              <button
                type="button"
                onClick={
                  sendToWhatsApp
                }
                disabled={!paymentReady || savingOrder}
                className={
                  paymentReady
                    ? "whatsapp-button active"
                    : "whatsapp-button"
                }
              >

                {savingOrder
                  ? "Saving Order..."
                  : paymentReady
                  ? "💬 Confirm Payment & Order"
                  : customerDetailsReady
                  ? "🔒 Enter 12-digit UTR"
                  : "🔒 Complete Customer & Pickup Details"}

              </button>


              <p className="whatsapp-note">

                Your order details and
                UTR will be sent to
                Imphal3D on WhatsApp.

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          CSS
      ========================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        .checkout-page {
          min-height: 100vh;

          background: #050505;

          color: white;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }


        /* HEADER */

        .checkout-header {
          height: 90px;

          background: #111214;

          border-bottom:
            1px solid #292929;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          padding: 0 5%;
        }


        .logo {
          text-decoration: none;

          color: white;
        }


        .logo-name {
          font-size: 30px;

          font-weight: 900;
        }


        .logo-name span {
          color: #ff6500;
        }


        .logo-tagline {
          font-size: 10px;

          letter-spacing: 4px;

          color: #697386;

          margin-top: 3px;
        }


        .back-link {
          color: #9aa8bb;

          text-decoration: none;

          font-size: 16px;
        }


        .back-link:hover {
          color: white;
        }


        /* CONTAINER */

        .checkout-container {
          width: min(
            1200px,
            92%
          );

          margin: 0 auto;

          padding: 60px 0;
        }


        .checkout-label {
          color: #ff6500;

          font-size: 14px;

          font-weight: 900;

          letter-spacing: 5px;

          margin-bottom: 15px;
        }


        .checkout-container > h1 {
          font-size: 52px;

          line-height: 1.05;

          font-weight: 900;

          margin: 0 0 45px;
        }


        /* GRID */

        .checkout-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 30px;

          align-items: start;
        }


        /* PANEL */

        .panel {
          background: #111214;

          border:
            1px solid #292929;

          border-radius: 20px;

          padding: 30px;
        }


        .panel h2 {
          font-size: 25px;

          margin:
            0 0 25px;
        }


        .section-title {
          margin-top:
            35px !important;

          margin-bottom:
            10px !important;
        }


        /* PICKUP PIN REMINDER */

        .pin-reminder {
          margin-bottom: 22px;
          padding: 14px;
          border: 1px solid #26374f;
          border-radius: 12px;
          background: #0a111b;
        }

        .pin-reminder strong {
          display: block;
          margin-bottom: 4px;
          color: #60a5fa;
          font-size: 13px;
        }

        .pin-reminder span {
          display: block;
          margin-bottom: 10px;
          color: #718096;
          font-size: 12px;
          line-height: 1.5;
        }

        .pin-reminder input {
          margin-bottom: 0;
        }


        /* INPUT */

        label {
          display: block;

          color: #9aa8bb;

          font-size: 14px;

          margin-bottom: 8px;
        }


        input {
          width: 100%;

          height: 52px;

          background: #08090a;

          border:
            1px solid #363636;

          border-radius: 10px;

          color: white;

          padding: 0 15px;

          font-size: 16px;

          outline: none;

          margin-bottom: 5px;
        }


        input:focus {
          border-color:
            #ff6500;
        }


        input::placeholder {
          color: #687386;
        }


        .muted {
          color: #7f8da3;

          line-height: 1.6;
        }


        /* PICKUP */

        .pickup {
          width: 100%;

          min-height: 75px;

          display: flex;

          align-items: center;

          gap: 15px;

          text-align: left;

          background: #08090a;

          border:
            1px solid #363636;

          border-radius: 12px;

          color: white;

          padding: 15px 18px;

          margin-top: 12px;

          cursor: pointer;
        }


        .pickup:hover {
          border-color: #777;
        }


        .pickup.selected {
          border:
            2px solid #ff6500;

          background: #1c120b;
        }


        .pickup-icon {
          font-size: 24px;
        }


        .pickup strong {
          display: block;

          font-size: 17px;
        }


        .pickup small {
          display: block;

          color: #7f8da3;

          margin-top: 5px;
        }


        /* PRODUCT */

        .product-summary {
          background: #08090a;

          border:
            1px solid #292929;

          border-radius: 14px;

          padding: 22px;
        }


        .summary-label {
          color: #ff6500;

          font-size: 12px;

          font-weight: 900;

          letter-spacing: 3px;

          margin-bottom: 12px;
        }


        .product-summary h3 {
          font-size: 22px;

          margin:
            0 0 18px;
        }


        .summary-row {
          display: flex;

          justify-content:
            space-between;

          gap: 20px;

          color: #9aa8bb;

          margin-bottom: 12px;
        }


        .summary-row strong {
          color: white;
        }


        /* PRICE */

        .price-section {
          padding: 22px 0;

          border-bottom:
            1px solid #292929;
        }


        .total-row {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          border-top:
            1px solid #292929;

          padding-top: 18px;

          margin-top: 18px;
        }


        .total-row span {
          font-size: 20px;

          font-weight: 700;
        }


        .total-row strong {
          font-size: 32px;

          font-weight: 900;
        }


        /* PAYMENT */

        .payment-box {
          margin-top: 25px;

          background: #0b0c0e;

          border:
            1px solid #292929;

          border-radius: 16px;

          padding: 25px;
        }


        .payment-label {
          color: #ff6500;

          font-size: 12px;

          font-weight: 900;

          letter-spacing: 3px;
        }


        .payment-box h2 {
          margin-top: 10px;

          margin-bottom: 8px;

          font-size: 28px;
        }


        /* QR */

        .qr-container {
          width: 280px;

          max-width: 100%;

          margin: 25px auto;

          background: white;

          padding: 10px;

          border-radius: 12px;
        }


        .qr-code {
          width: 100%;

          display: block;

          height: auto;
        }


        /* INSTRUCTIONS */

        .payment-instruction {
          display: flex;

          gap: 12px;

          margin: 15px 0;

          color: #aab4c4;

          line-height: 1.5;
        }


        .payment-instruction strong {
          color: #ff6500;

          white-space: nowrap;
        }


        /* UTR */

        .utr-counter {
          text-align: right;

          color: #687386;

          font-size: 12px;

          margin-top: 5px;

          margin-bottom: 8px;
        }


        .utr-error {
          background: #211010;

          border:
            1px solid #612323;

          border-radius: 8px;

          padding: 10px;

          color: #ff6b6b;

          font-size: 13px;

          margin: 8px 0;
        }


        .utr-success {
          background: #0d2115;

          border:
            1px solid #205d35;

          border-radius: 8px;

          padding: 10px;

          color: #48e486;

          font-size: 13px;

          margin: 8px 0;
        }


        /* WARNING */

        .payment-warning {
          background: #1a130d;

          border:
            1px solid #5a371d;

          border-radius: 10px;

          padding: 12px;

          color: #e0b98c;

          font-size: 13px;

          line-height: 1.5;
        }


        /* SUBMITTED */

        .submitted-box {
          display: flex;

          align-items: center;

          gap: 14px;

          background: #0d2115;

          border:
            1px solid #205d35;

          border-radius: 12px;

          padding: 16px;

          margin-top: 15px;

          margin-bottom: 15px;
        }


        .submitted-icon {
          width: 38px;

          height: 38px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background: #25d366;

          color: black;

          font-size: 20px;

          font-weight: 900;

          flex-shrink: 0;
        }


        .submitted-box strong {
          color: #48e486;

          font-size: 14px;
        }


        .submitted-box p {
          color: #91a99a;

          font-size: 12px;

          margin:
            5px 0 0;

          line-height: 1.5;
        }


        /* WHATSAPP */

        .whatsapp-button {
          width: 100%;

          min-height: 60px;

          border: none;

          border-radius: 12px;

          background: #242629;

          color: #777;

          font-size: 17px;

          font-weight: 900;

          cursor: not-allowed;

          margin-top: 10px;
        }


        .whatsapp-button.active {
          background: #25d366;

          color: #050505;

          cursor: pointer;
        }


        .whatsapp-button.active:hover {
          background: #20bd5c;
        }


        .whatsapp-note {
          text-align: center;

          color: #697386;

          font-size: 12px;

          line-height: 1.5;

          margin-top: 12px;
        }


        .cart-summary-details {
          margin-top: 10px;
          border-top: 1px solid #292929;
          padding-top: 12px;
        }

        .field-help {
          margin-top: 6px;
          color: #697386;
          font-size: 12px;
          line-height: 1.5;
        }


        .form-error {
          margin: 0 0 18px;
          padding: 12px 14px;
          border: 1px solid #6b2929;
          border-radius: 10px;
          background: #211010;
          color: #ff8585;
          font-size: 13px;
          line-height: 1.5;
        }

        .summary-item {
          padding: 10px 0;
          border-bottom: 1px solid #1d1d1d;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item .summary-row {
          margin-bottom: 0;
        }

        .summary-customization {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 7px;
        }

        .summary-customization span {
          padding: 5px 8px;
          border: 1px solid #292929;
          border-radius: 999px;
          background: #111214;
          color: #7f8da3;
          font-size: 11px;
        }

        /* MOBILE */

        @media (max-width: 850px) {

          .checkout-header {
            min-height: 82px;
            height: auto;
            gap: 15px;
            padding-top: 15px;
            padding-bottom: 15px;
          }

          .checkout-grid {
            grid-template-columns: 1fr;
          }


          .checkout-container > h1 {
            font-size: 42px;
          }

        }


        @media (max-width: 500px) {

          .checkout-header {
            padding: 0 20px;
          }


          .logo-name {
            font-size: 24px;
          }


          .back-link {
            font-size: 13px;
          }


          .checkout-container {
            width: 92%;

            padding:
              40px 0;
          }


          .checkout-container > h1 {
            font-size: 35px;
          }


          .panel {
            padding: 20px;
          }


          .payment-box {
            padding: 18px;
          }


          .qr-container {
            width: 250px;
          }

        }

      `}</style>

    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "#050505",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <p style={{ color: "#9aa8bb" }}>
            Loading checkout...
          </p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
