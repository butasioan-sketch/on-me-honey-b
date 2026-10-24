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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
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
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/", permanent: true },
      { source: "/products", destination: "/", permanent: true },
      {
        source: "/categories/bekleidung",
        destination: "/categories/A",
        permanent: true,
      },
      { source: "/konfigurator", destination: "/product/1", permanent: true },
    ];
  },
};

export default nextConfig;
