import { defineMiddleware } from "astro/middleware";

// Define private route patterns
const PRIVATE_ROUTES = [
  /^\/projects\/[^\/]+$/, // Dynamic project routes will check individually
  /^\/api\/private\//, // Any private API routes
];

// Routes that should always be accessible
const PUBLIC_ROUTES = ["/access", "/api/access/verify", "/", "/projects"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Skip middleware for public routes and static assets
  if (
    PUBLIC_ROUTES.some((route) => pathname === route) ||
    pathname.startsWith("/_") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/access/")
  ) {
    return next();
  }

  // Continue with normal processing, individual pages will handle their own auth
  const response = await next();

  // Add security headers to all responses for extra protection
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Add cache control for private routes
  if (PRIVATE_ROUTES.some((pattern) => pattern.test(pathname))) {
    response.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
});
