import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// ─── Catch-All API Proxy ────────────────────────────────────────────────────
// Proxies all requests from /api/proxy/* to the Laravel backend.
// Attaches the Bearer token from the server-side NextAuth session.
// Browser never knows the real backend URL or token.

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

async function handler(req: NextRequest) {
  // Get the path after /api/proxy
  const url = new URL(req.url);
  const proxyPath = url.pathname.replace(/^\/api\/proxy/, "");
  const targetUrl = `${BACKEND_URL}${proxyPath}${url.search}`;

  // Get session for Bearer token
  const session = await auth();
  const accessToken = session?.accessToken;

  // Build headers
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Forward correlation ID if present
  const correlationId = req.headers.get("X-Correlation-ID");
  if (correlationId) {
    headers.set("X-Correlation-ID", correlationId);
  }

  try {
    const body =
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { message: "Gagal terhubung ke server backend." },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
