"use client";
/* eslint-disable */

import { useEffect, useState } from "react";
import { trackPurchase } from "@/lib/analytics";

const SHARE_TEXT: Record<
  string,
  {
    title: string;
    text: string;
    banner: string;
    processing: string;
    pending: string;
    share: string;
    copied: string;
  }
> = {
  de: {
    title: "Mein neues ON ME Piece",
    text: "Gerade bestellt — mein Motiv auf Performance-Polyester. On me. In your head.",
    banner: "✓ Zahlung erfolgreich!",
    processing: "✓ Zahlung bestätigt – dein Auftrag wird verarbeitet.",
    pending:
      "Die Zahlung ist noch nicht bestätigt. Dein Warenkorb bleibt erhalten.",
    share: "Teilen",
    copied: "Link kopiert!",
  },
  ro: {
    title: "Noul meu ON ME",
    text: "Tocmai am comandat — motivul meu pe poliester premium. On me. In your head.",
    banner: "✓ Plată reușită!",
    processing: "✓ Plată confirmată – comanda ta este în procesare.",
    pending: "Plata nu a fost încă confirmată. Coșul tău rămâne salvat.",
    share: "Distribuie",
    copied: "Link copiat!",
  },
  en: {
    title: "My new ON ME piece",
    text: "Just ordered — my design on performance polyester. On me. In your head.",
    banner: "✓ Payment successful!",
    processing: "✓ Payment confirmed – your order is being processed.",
    pending: "Payment is awaiting confirmation. Your cart is still saved.",
    share: "Share",
    copied: "Link copied!",
  },
};

const MAX_ORDER_CHECKS = 20;

export default function PaymentSuccessBanner() {
  const [status, setStatus] = useState<
    "paid" | "processing" | "pending" | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [locale, setLocale] = useState("de");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (params.get("payment") !== "success" || !sessionId) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const storedLocale = localStorage.getItem("on_me_honey_b_locale") || "de";
    setLocale(storedLocale);

    async function checkPayment(verifiedSessionId: string) {
      try {
        const query = new URLSearchParams({ session_id: verifiedSessionId });
        const response = await fetch(`/api/payments/checkout-status?${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = response.ok ? await response.json() : null;
        if (controller.signal.aborted) return;
        // A failed poll after Stripe confirmed payment keeps "processing".
        if (result === null && attempts > 0) return retryOrderCheck();
        if (result?.paid !== true) {
          setStatus("pending");
          return;
        }
        if (result.orderSaved !== true) {
          // Paid at Stripe, but the webhook has not stored the order yet.
          setStatus("processing");
          return retryOrderCheck();
        }
        setStatus("paid");
        window.history.replaceState({}, "", "/");
        const pendingPurchase = JSON.parse(
          sessionStorage.getItem("plt_pending_purchase") ?? "null",
        );
        if (pendingPurchase?.sessionId === verifiedSessionId) {
          sessionStorage.removeItem("plt_pending_purchase");
          if (
            pendingPurchase.cart === localStorage.getItem("on_me_honey_b_cart")
          ) {
            localStorage.removeItem("on_me_honey_b_cart");
            window.dispatchEvent(new Event("cart-updated"));
          }
          if (result.amount > 0) trackPurchase("unknown", result.amount, []);
        }
        timer = setTimeout(() => setStatus(null), 15000);
      } catch {
        if (controller.signal.aborted) return;
        if (attempts > 0) retryOrderCheck();
        else setStatus("pending");
      }
    }
    function retryOrderCheck() {
      if (++attempts < MAX_ORDER_CHECKS) {
        timer = setTimeout(() => void checkPayment(sessionId!), 3000);
      }
    }
    void checkPayment(sessionId);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  if (!status) return null;

  const t = SHARE_TEXT[locale] || SHARE_TEXT.de;
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://on-me-honey-b.vercel.app";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t.title, text: t.text, url: siteUrl });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(siteUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background:
          status === "paid"
            ? "#15803d"
            : status === "processing"
              ? "#1d4ed8"
              : "#854d0e",
        color: "#fff",
        padding: "1rem 1.5rem",
        borderRadius: "14px",
        fontWeight: 700,
        fontSize: "0.9rem",
        boxShadow: "0 12px 36px rgba(22,163,74,0.4)",
        maxWidth: "90vw",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        animation: "plt-fadeInUp 0.4s ease",
      }}
    >
      <span role="status">
        {status === "paid"
          ? t.banner
          : status === "processing"
            ? t.processing
            : t.pending}
      </span>
      {status === "paid" && (
        <button
          onClick={handleShare}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            color: "#fff",
            padding: "0.45rem 1rem",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          {copied ? t.copied : `${t.share} ↗`}
        </button>
      )}
    </div>
  );
}
