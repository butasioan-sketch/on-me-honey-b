import { CATEGORIES } from "./lib/categories";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "on-me-honey-b.vercel.app" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // Content Security Policy - prevents XSS and injection attacks (INFRA P1 1.6)
    const cspDirectives = [
      "default-src 'self'",
      // 'unsafe-eval' braucht nur der Next-Dev-Server (HMR). In Produktion nur 'wasm-unsafe-eval':
      // erlaubt WebAssembly (Draco-Decoder der 360°-GLBs), aber kein JavaScript-eval (XSS-Schutz).
      `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.stripe.com https://checkout.stripe.com",
      "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
      // 3D-Modelle, Draco-Decoder und Vorschaubilder: 1 Tag frisch, danach bis 7 Tage aus dem
      // Cache bei Hintergrund-Aktualisierung. Nicht "immutable", weil Modelle unter gleichem
      // Namen nachgebessert werden (z. B. aufgerichtete Modelle am 21.11.2026).
      ...["/models/:path*", "/draco/:path*", "/products/:path*"].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      })),
    ];
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/", permanent: true },
      { source: "/products", destination: "/", permanent: true },
      ...CATEGORIES.map((c) => ({
        source: `/categories/${c.slug}`,
        destination: `/categories/${c.id}`,
        permanent: true,
      })),
      { source: "/konfigurator", destination: "/product/1", permanent: true },
    ];
  },
};

export default nextConfig;
