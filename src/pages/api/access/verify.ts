import type { APIRoute } from "astro";
import { createHmac } from "crypto";

// Session configuration
const SESSION_SECRET = process.env.SESSION_SECRET;
const CODE_SECRET = process.env.CODE_SECRET;
const SESSION_DURATION = 24 * 60 * 60;

interface AccessCodeRecord {
  code: string;
  expiresAt: string;
  scope: string;
  maxUses?: number;
  uses?: number;
  createdAt: string;
}

interface SessionPayload {
  scope: string;
  expiresAt: number;
  issuedAt: number;
}

function createSessionToken(payload: SessionPayload): string {
  if (!SESSION_SECRET) {
    throw new Error("Session secret not configured");
  }
  const data = JSON.stringify(payload);
  const signature = createHmac("sha256", SESSION_SECRET).update(data).digest("hex");

  return `${Buffer.from(data).toString("base64")}.${signature}`;
}

function hashCode(code: string): string {
  if (!CODE_SECRET) {
    throw new Error("Code secret not configured");
  }
  return createHmac("sha256", CODE_SECRET).update(code.toLowerCase()).digest("hex");
}

export const POST: APIRoute = async ({ request, locals }) => {
  console.log(process.env.CODE_SECRET);

  if (!SESSION_SECRET) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server configuration error.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!CODE_SECRET) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server configuration error.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { accessCode } = await request.json();

    if (!accessCode || typeof accessCode !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Access code is required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Access KV storage
    const ACCESS_CODES = (locals as any).runtime?.env?.ACCESS_CODES;

    if (!ACCESS_CODES) {
      console.error("ACCESS_CODES KV namespace not available");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Service temporarily unavailable.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Hash the submitted code to look up in KV
    const codeHash = hashCode(accessCode);

    // Try to get the access code record from KV
    const recordData = await ACCESS_CODES.get(codeHash);

    if (!recordData) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid access code.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let record: AccessCodeRecord;
    try {
      record = JSON.parse(recordData);
    } catch (e) {
      console.error("Failed to parse access code record:", e);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid access code format.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(record.expiresAt);

    if (now > expiresAt) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Access code has expired.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check usage limits
    if (record.maxUses && record.uses && record.uses >= record.maxUses) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Access code has reached usage limit.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Update usage count
    const updatedRecord = {
      ...record,
      uses: (record.uses || 0) + 1,
    };

    await ACCESS_CODES.put(codeHash, JSON.stringify(updatedRecord));

    // Create session token
    const sessionPayload: SessionPayload = {
      scope: record.scope,
      expiresAt: now.getTime() + SESSION_DURATION * 1000,
      issuedAt: now.getTime(),
    };

    const sessionToken = createSessionToken(sessionPayload);

    // Set secure session cookie
    const cookieOptions = [
      `vault_session=${sessionToken}`,
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Path=/",
      `Max-Age=${SESSION_DURATION}`,
    ].join("; ");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Access granted.",
        scope: record.scope,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieOptions,
        },
      },
    );
  } catch (error) {
    console.error("Access verification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
