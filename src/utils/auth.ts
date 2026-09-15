import type { APIContext } from "astro";
import { createHmac } from "crypto";
import type { KVNamespace } from "@cloudflare/workers-types";

const SESSION_SECRET = process.env.SESSION_SECRET;

export const COOKIE_NAME = "portfolio_session";

export interface AccessCodeRecord {
  scope: string;
  createdAt: string;
  expiresAt: string;
  maxUses?: number;
  uses?: number;
}

export interface SessionPayload {
  codeId: string; // Generated from hash of CODE_SECRET
  expiresAt: number;
  issuedAt: number;
}

export interface AuthResult {
  isAuthenticated: boolean;
  reason?: string;
  payload?: SessionPayload;
}

/**
 * Check session re-authentication for private routes.
 *
 * Check for a valid session cookie, verify the token, and check if the user has access
 * to the project based on the codeId, and that it is not expired.
 * Returns redirect response if not authenticated, null if authorized.
 */
export async function authenticateSession(context: APIContext, projectId: string): Promise<Response | null> {
  const cookies = context.request.headers.get("cookie") || "";
  const existingSession = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));

  if (!existingSession) {
    return redirectToAccess(context.url);
  }

  const authResult = verifySessionToken(existingSession[1]);

  if (!authResult.isAuthenticated || !authResult.payload) {
    return redirectToAccess(context.url);
  }

  // Validate access code record from KV store
  const accessCodes = getAccessCodes(context);

  if (!accessCodes) {
    console.error("ACCESS_CODES KV namespace not available");
    return redirectToAccess(context.url);
  }

  const record = await getAccessCodeRecord(accessCodes, authResult.payload.codeId);

  if (!record) {
    return redirectToAccess(context.url);
  }

  if (isAccessCodeExpired(record)) {
    return redirectToAccess(context.url);
  }

  if (!hasRequiredScope(record.scope, projectId)) {
    return redirectToAccess(context.url);
  }

  return null; // Authorized
}

/**
 * Creates a session token with a payload and signs it with the SESSION_SECRET.
 * The token is a base64-encoded JSON string of the payload, followed by a signature.
 */
export function createSessionToken(payload: SessionPayload): string {
  if (!SESSION_SECRET) {
    throw new Error("Session secret not configured");
  }
  const data = JSON.stringify(payload);
  const signature = createHmac("sha256", SESSION_SECRET).update(data).digest("hex");

  return `${Buffer.from(data).toString("base64")}.${signature}`;
}

/**
 * Verifies a session token matches the correct signature and the payload is not expired.
 * Returns an AuthResult indicating whether the token is valid and, if so, the decoded payload.
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

    // Verify signature matches SESSION_SECRET
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
      payload: payload,
    };
  } catch (error) {
    return { isAuthenticated: false, reason: "Token verification failed" };
  }
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

export function getAccessCodes(context: APIContext): KVNamespace | null {
  return (context.locals as any).runtime?.env?.ACCESS_CODES ?? null;
}

export async function getAccessCodeRecord(accessCodes: KVNamespace, codeId: string): Promise<AccessCodeRecord | null> {
  return await accessCodes.get<AccessCodeRecord>(codeId, "json");
}

export function isAccessCodeExpired(record: AccessCodeRecord, now = Date.now()): boolean {
  const expiresAt = Date.parse(record.expiresAt);

  return !Number.isFinite(expiresAt) || now >= expiresAt;
}

function hasRequiredScope(currentScope: string, projectId: string): boolean {
  // '*' grants access to all, otherwise check for requiredScope in the list
  const scopes = currentScope.split(",").map((s) => s.trim());
  return scopes.includes("*") || scopes.includes(projectId);
}
