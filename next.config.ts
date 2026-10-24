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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.stripe.com https://api.resend.com https://*.neon.tech https://*.amazonaws.com",
      "frame-src https://js.stripe.com",
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
      {
        // Immutable caching for GLB models - improves 3D viewer performance (INFRA P1 1.9)
        source: "/models/:path*.glb",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
