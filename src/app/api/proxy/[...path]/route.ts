import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ─── Catch-All API Proxy ────────────────────────────────────────────────────
// Proxies all requests from /api/proxy/* to the Laravel backend.
// Attaches the Bearer token from the server-side NextAuth session.
// Browser never knows the real backend URL or token.

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

async function handler(req: NextRequest) {
  // Get the path after /api/proxy
  const url = new URL(req.url);
  const proxyPath = url.pathname.replace(/^\/api\/proxy/, "");
  const targetUrl = `${BACKEND_URL}/api${proxyPath}${url.search}`;

  // Get session for Bearer token
  const session = await auth();
  const accessToken = session?.accessToken;

  // Build headers
  const headers = new Headers();
  headers.set("Accept", "application/json");

  // Forward the original Content-Type (which contains the multipart boundary)
  const contentType = req.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  } else {
    headers.set("Content-Type", "application/json");
  }

  // Check client Authorization header (prioritized for testing)
  const clientAuth = req.headers.get("Authorization");
  if (clientAuth) {
    headers.set("Authorization", clientAuth);
  } else if (accessToken) {
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
        ? await req.arrayBuffer()
        : undefined;

    if (body) {
      headers.set("Content-Length", body.byteLength.toString());
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseData = await response.arrayBuffer();

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
