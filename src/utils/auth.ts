import type { APIContext } from "astro";
import { createHmac } from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET;

export interface SessionPayload {
  codeId: string;
  expiresAt: number;
  issuedAt: number;
}

export interface AccessCodeRecord {
  expiresAt: string;
  scope: string;
  maxUses?: number;
  uses?: number;
  createdAt: string;
}

export interface AuthResult {
  isAuthenticated: boolean;
  scope?: string;
  reason?: string;
}
/**
 * Verifies a session token and returns authentication status
 */
export function verifySessionToken(token: string): AuthResult {
  if (!SESSION_SECRET) {
    return { isAuthenticated: false, reason: "Session secret not configured" };
  }

  try {
    const [dataB64, signature] = token.split(".");

    if (!dataB64 || !signature) {
      return { isAuthenticated: false, reason: "Invalid token format" };
    }

    // Verify signature
    const data = Buffer.from(dataB64, "base64").toString();
    const expectedSignature = createHmac("sha256", SESSION_SECRET).update(data).digest("hex");

    if (signature !== expectedSignature) {
      return { isAuthenticated: false, reason: "Invalid signature" };
    }

    // Parse payload
    const payload: SessionPayload = JSON.parse(data);

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return { isAuthenticated: false, reason: "Token expired" };
    }

    return {
      isAuthenticated: true,
    };
  } catch (error) {
    return { isAuthenticated: false, reason: "Token verification failed" };
  }
}

/**
 * Middleware function to check authentication for private routes
 * Returns redirect response if not authenticated, null if authorized
 */
export async function requireAuthentication(context: APIContext, requiredScope: string): Promise<Response | null> {
  const cookies = context.request.headers.get("cookie") || "";
  const sessionMatch = cookies.match(/vault_session=([^;]+)/);

  if (!sessionMatch) {
    return redirectToAccess(context.url);
  }

  const authResult = verifySessionToken(sessionMatch[1]);

  if (!authResult.isAuthenticated) {
    return redirectToAccess(context.url);
  }

  // Check scope authorization
  if (!hasRequiredScope(authResult.scope!, requiredScope)) {
    return redirectToAccess(context.url);
  }

  return null; // Authorized
}

/**
 * Creates redirect response to access page with return URL
 */
function redirectToAccess(currentUrl: URL): Response {
  const accessUrl = new URL("/access", currentUrl.origin);

  // Only add redirect param for non-access pages to avoid loops
  if (currentUrl.pathname !== "/access") {
    accessUrl.searchParams.set("redirect", currentUrl.pathname + currentUrl.search);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: accessUrl.toString(),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

/**
 * Checks if current scope meets required scope
 */
function hasRequiredScope(currentScope: string, requiredScope: string): boolean {
  // '*' grants access to all, otherwise check for requiredScope in the list
  const scopes = currentScope.split(",").map((s) => s.trim());
  return scopes.includes("*") || scopes.includes(requiredScope);
}

/**
 * Adds security headers for private content
 */
export function addPrivateHeaders(response: Response): Response {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

/**
 * Utility function to get current user's scope from request
 */
export function getUserScope(context: APIContext): string | null {
  const cookies = context.request.headers.get("cookie") || "";
  const sessionMatch = cookies.match(/vault_session=([^;]+)/);

  if (!sessionMatch) {
    return null;
  }

  const authResult = verifySessionToken(sessionMatch[1]);
  return authResult.isAuthenticated ? authResult.scope! : null;
}
