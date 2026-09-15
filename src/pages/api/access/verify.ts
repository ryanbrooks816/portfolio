import type { APIRoute } from "astro";
import { createHmac } from "crypto";
import { COOKIE_NAME, createSessionToken, getAccessCodes, isAccessCodeExpired } from "../../../utils/auth";
import type { SessionPayload, AccessCodeRecord } from "../../../utils/auth";

// Session configuration
const SESSION_SECRET = process.env.SESSION_SECRET;
const CODE_SECRET = process.env.CODE_SECRET;
const SESSION_DURATION = 24 * 60 * 60;

function hashCode(code: string): string {
  if (!CODE_SECRET) {
    throw new Error("Code secret not configured");
  }
  return createHmac("sha256", CODE_SECRET).update(code.toLowerCase()).digest("hex");
}

export const POST: APIRoute = async ({ request, locals }) => {
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
    const accessCodes = getAccessCodes({ locals } as any);

    if (!accessCodes) {
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
    const recordData = await accessCodes.get(codeHash);

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

    const now = new Date().getTime();

    // Check if code has expired
    if (isAccessCodeExpired(record, now)) {
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

    await accessCodes.put(codeHash, JSON.stringify(updatedRecord));

    // Create session token
    const sessionPayload: SessionPayload = {
      codeId: codeHash,
      expiresAt: now + SESSION_DURATION * 1000,
      issuedAt: now,
    };

    const sessionToken = createSessionToken(sessionPayload);

    // Set secure session cookie
    const cookieOptions = [
      `${COOKIE_NAME}=${sessionToken}`,
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
