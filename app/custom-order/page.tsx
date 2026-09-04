"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CustomOrderPage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [description, setDescription] = useState("");
  const [colour, setColour] = useState("Any Colour");
  const [quantity, setQuantity] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");

  // =========================
  // PHOTO UPLOAD
  // =========================

  const handlePhoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhoto(file);

    const imageURL = URL.createObjectURL(file);

    setPreview(imageURL);
  };


  // =========================
  // WHATSAPP
  // =========================

  const sendCustomOrder = async () => {
    if (!photo) {
      alert("Please upload a reference photo.");
      return;
    }

    if (!description.trim()) {
      alert("Please describe what you want customized.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!pickup) {
      alert("Please select a pickup location.");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(photo.type)) {
      alert("Please upload a JPG, JPEG or PNG image.");
      return;
    }

    if (photo.size > 10 * 1024 * 1024) {
      alert("Please upload an image smaller than 10 MB.");
      return;
    }

    try {
      const fileExtension =
        photo.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeName = name
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();

      const fileName = `${Date.now()}-${safeName}.${fileExtension}`;
      const filePath = `custom-orders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("order-photos")
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        alert("The photo could not be uploaded. Please try again.");
        return;
      }

      const { data: publicData } = supabase.storage
        .from("order-photos")
        .getPublicUrl(filePath);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          product_name: "Custom Order",
          product_size: null,
          color: colour,
          custom_description:
            `${description.trim()}\n\nQuantity: ${quantity}\nPickup Location: ${pickup}`,
          transaction_id: null,
          reference_photo_url: publicData.publicUrl,
          amount: null,
          status: "New",
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order save error:", orderError);

        await supabase.storage
          .from("order-photos")
          .remove([filePath]);

        alert("Your order could not be saved. Please try again.");
        return;
      }

      const message = `
Hello Imphal3D! 👋

I have submitted a CUSTOM ORDER through the website.

━━━━━━━━━━━━━━━━━━
CUSTOM ORDER
━━━━━━━━━━━━━━━━━━

Order ID:
${order.id}

Description:
${description}

Preferred Colour:
${colour}

Quantity:
${quantity}

━━━━━━━━━━━━━━━━━━
CUSTOMER DETAILS
━━━━━━━━━━━━━━━━━━

Name: ${name}
Phone: ${phone}

━━━━━━━━━━━━━━━━━━
PICKUP LOCATION
━━━━━━━━━━━━━━━━━━

${pickup}

━━━━━━━━━━━━━━━━━━

Reference Photo:
${publicData.publicUrl}

Please let me know the price
and estimated completion time.

Thank you!
Imphal3D
      `.trim();

      const whatsappNumber = "919862135090";

      const whatsappURL =
        `https://wa.me/${whatsappNumber}?text=` +
        encodeURIComponent(message);

      alert(`Order #${order.id} submitted successfully!`);

      window.open(whatsappURL, "_blank");
    } catch (error) {
      console.error("Unexpected order error:", error);
      alert(
        "Something went wrong while submitting your order. Please try again."
      );
    }
  };


  return (
    <main className="custom-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <a href="/" className="logo">

          <div className="logo-name">
            Imphal<span>3D</span>
          </div>

          <div className="logo-tagline">
            PRINTED WITH PASSION
          </div>

        </a>

        <a href="/" className="back">
          ← Back to Shop
        </a>

      </header>


      {/* =========================
          MAIN
      ========================= */}

      <section className="container">

        <div className="label">
          CUSTOM ORDERS
        </div>

        <h1>
          Bring Your Idea
          <br />
          <span>To Life.</span>
        </h1>

        <p className="intro">
          Have something specific in mind?
          Upload a reference photo and tell
          us what you want. We'll discuss the
          details with you on WhatsApp.
        </p>


        <div className="grid">


          {/* =========================
              LEFT — PHOTO
          ========================= */}

          <div className="panel">

            <h2>
              1. Reference Photo
            </h2>

            <p className="muted">
              Upload a photo, drawing, logo,
              product or anything you want
              us to use as a reference.
            </p>


            <label className="upload-area">

              {preview ? (

                <img
                  src={preview}
                  alt="Reference preview"
                  className="preview"
                />

              ) : (

                <div className="upload-content">

                  <div className="upload-icon">
                    📷
                  </div>

                  <strong>
                    Upload Reference Photo
                  </strong>

                  <span>
                    Click here to choose an image
                  </span>

                  <small>
                    JPG, PNG or JPEG
                  </small>

                </div>

              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handlePhoto}
                hidden
              />

            </label>


            {photo && (

              <div className="file-name">
                ✓ {photo.name}
              </div>

            )}

          </div>


          {/* =========================
              RIGHT — DETAILS
          ========================== */}

          <div className="panel">

            <h2>
              2. Tell Us What You Want
            </h2>


            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Example: I want this design as a 230mm wall lamp with LED lighting..."
              rows={7}
            />


            {/* COLOUR */}

            <label className="field-label">
              Preferred Colour
            </label>

            <select
              value={colour}
              onChange={(e) =>
                setColour(e.target.value)
              }
            >

              <option>
                Any Colour
              </option>

              <option>
                Red
              </option>

              <option>
                Blue
              </option>

              <option>
                Green
              </option>

              <option>
                White
              </option>

              <option>
                Black
              </option>

              <option>
                Yellow
              </option>

              <option>
                Purple
              </option>

            </select>


            {/* QUANTITY */}

            <label className="field-label">
              Quantity
            </label>

            <div className="quantity">

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.max(
                      1,
                      quantity - 1
                    )
                  )
                }
              >
                −
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    quantity + 1
                  )
                }
              >
                +
              </button>

            </div>

          </div>


          {/* =========================
              CUSTOMER DETAILS
          ========================== */}

          <div className="panel">

            <h2>
              3. Your Details
            </h2>


            <label>
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Your name"
            />


            <label>
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Your phone number"
            />

          </div>


          {/* =========================
              PICKUP + SUBMIT
          ========================== */}

          <div className="panel">

            <h2>
              4. Pickup Location
            </h2>

            <p className="muted">
              Custom orders are pickup only.
            </p>


            <button
              type="button"
              className={
                pickup === "Wangkhei"
                  ? "pickup selected"
                  : "pickup"
              }
              onClick={() =>
                setPickup("Wangkhei")
              }
            >

              <span>
                📍
              </span>

              <div>

                <strong>
                  Wangkhei
                </strong>

                <small>
                  Pickup location
                </small>

              </div>

            </button>


            <button
              type="button"
              className={
                pickup === "Haobam Marak"
                  ? "pickup selected"
                  : "pickup"
              }
              onClick={() =>
                setPickup(
                  "Haobam Marak"
                )
              }
            >

              <span>
                📍
              </span>

              <div>

                <strong>
                  Haobam Marak
                </strong>

                <small>
                  Pickup location
                </small>

              </div>

            </button>


            {/* SUBMIT */}

            <button
              type="button"
              onClick={sendCustomOrder}
              className="whatsapp"
            >
              💬 Send Custom Request
            </button>


            <p className="note">
              Your reference photo will be uploaded
              with your order. WhatsApp will open
              with your order details after submission.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          CSS
      ========================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        .custom-page {
          min-height: 100vh;

          background: #050505;

          color: white;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* HEADER */

        .header {
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
          color: white;

          text-decoration: none;
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


        .back {
          color: #9aa8bb;

          text-decoration: none;
        }


        .back:hover {
          color: white;
        }


        /* CONTAINER */

        .container {
          width: min(
            1200px,
            92%
          );

          margin: 0 auto;

          padding: 60px 0;
        }


        .label {
          color: #ff6500;

          font-size: 14px;

          font-weight: 900;

          letter-spacing: 5px;
        }


        h1 {
          font-size: 58px;

          line-height: 1;

          font-weight: 900;

          margin:
            15px 0 25px;
        }


        h1 span {
          color: #ff6500;
        }


        .intro {
          max-width: 650px;

          color: #8795aa;

          font-size: 18px;

          line-height: 1.7;

          margin-bottom: 50px;
        }


        /* GRID */

        .grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 25px;
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
          margin:
            0 0 10px;

          font-size: 24px;
        }


        .muted {
          color: #7f8da3;

          line-height: 1.6;

          margin-bottom: 20px;
        }


        /* UPLOAD */

        .upload-area {
          min-height: 360px;

          border:
            2px dashed #3a3a3a;

          border-radius: 15px;

          display: flex;

          align-items: center;

          justify-content: center;

          text-align: center;

          cursor: pointer;

          overflow: hidden;

          background: #08090a;
        }


        .upload-area:hover {
          border-color:
            #ff6500;
        }


        .upload-content {
          display: flex;

          flex-direction:
            column;

          align-items: center;

          gap: 10px;

          padding: 30px;
        }


        .upload-icon {
          font-size: 55px;

          margin-bottom: 10px;
        }


        .upload-content strong {
          font-size: 19px;
        }


        .upload-content span {
          color: #9aa8bb;

          font-size: 14px;
        }


        .upload-content small {
          color: #596477;

          font-size: 12px;
        }


        .preview {
          width: 100%;

          height: 360px;

          object-fit: contain;

          background: white;
        }


        .file-name {
          color: #48e486;

          font-size: 13px;

          margin-top: 12px;

          word-break: break-all;
        }


        /* FORM */

        label {
          display: block;

          color: #9aa8bb;

          font-size: 14px;

          margin:
            20px 0 8px;
        }


        .field-label {
          margin-top: 25px;
        }


        input,
        textarea,
        select {
          width: 100%;

          background: #08090a;

          border:
            1px solid #363636;

          border-radius: 10px;

          color: white;

          padding: 14px;

          font-size: 16px;

          outline: none;
        }


        input {
          height: 52px;
        }


        textarea {
          resize: vertical;

          min-height: 150px;

          line-height: 1.6;
        }


        select {
          height: 52px;

          cursor: pointer;
        }


        input:focus,
        textarea:focus,
        select:focus {
          border-color:
            #ff6500;
        }


        /* QUANTITY */

        .quantity {
          display: flex;

          width: 150px;

          height: 50px;

          border:
            1px solid #363636;

          border-radius: 10px;

          overflow: hidden;
        }


        .quantity button {
          width: 50px;

          border: none;

          background: #151619;

          color: white;

          font-size: 22px;

          cursor: pointer;
        }


        .quantity button:hover {
          background: #25272a;
        }


        .quantity span {
          flex: 1;

          display: flex;

          align-items: center;

          justify-content: center;

          font-weight: 700;
        }


        /* PICKUP */

        .pickup {
          width: 100%;

          display: flex;

          align-items: center;

          gap: 15px;

          text-align: left;

          background: #08090a;

          border:
            1px solid #363636;

          border-radius: 12px;

          color: white;

          padding: 18px;

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


        .pickup > span {
          font-size: 25px;
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


        /* WHATSAPP */

        .whatsapp {
          width: 100%;

          height: 62px;

          border: none;

          border-radius: 12px;

          background: #25d366;

          color: #050505;

          font-size: 18px;

          font-weight: 900;

          cursor: pointer;

          margin-top: 30px;
        }


        .whatsapp:hover {
          background: #20bd5c;
        }


        .note {
          text-align: center;

          color: #697386;

          font-size: 12px;

          line-height: 1.6;

          margin-top: 12px;
        }


        /* MOBILE */

        @media (max-width: 850px) {

          .grid {
            grid-template-columns:
              1fr;
          }


          h1 {
            font-size: 45px;
          }

        }


        @media (max-width: 500px) {

          .header {
            padding: 0 20px;
          }


          .logo-name {
            font-size: 24px;
          }


          .back {
            font-size: 13px;
          }


          .container {
            width: 92%;

            padding:
              40px 0;
          }


          h1 {
            font-size: 38px;
          }


          .panel {
            padding: 20px;
          }


          .upload-area,
          .preview {
            min-height: 280px;

            height: 280px;
          }

        }

      `}</style>

    </main>
  );
}