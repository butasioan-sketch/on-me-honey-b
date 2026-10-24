import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { proxy } from "./proxy";

export function middleware(request: NextRequest) {
  // Run proxy checks first (auth for /admin, /api routes)
  const proxyResponse = proxy(request);
  if (proxyResponse.status !== 200) {
    return proxyResponse;
  }

  // Remove CORS headers from HTML/page responses (INFRA P1 1.5)
  // CORS should only be on API endpoints that need it
  const response = NextResponse.next();

  // Only add CORS for specific API routes that need cross-origin access
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const apiPath = request.nextUrl.pathname;

    // Public APIs that might be called from other domains
    const corsAllowedPaths = [
      "/api/reviews", // Public review submission
      "/api/newsletter/subscribe", // Newsletter sign-up
    ];

    if (corsAllowedPaths.some((path) => apiPath.startsWith(path))) {
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS",
      );
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif|glb)).*)",
  ],
};
