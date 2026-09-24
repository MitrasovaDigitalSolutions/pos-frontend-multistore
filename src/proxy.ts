// ─── Next.js 16 Proxy (replaces middleware.ts) ──────────────────────────────
// In Next.js 16+, middleware.ts is renamed to proxy.ts and the export is `proxy`.

import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "next-auth";

// In-memory cache for license status to ensure fast response without hammering Laravel API
let cachedStatus: { isOperable: boolean; timestamp: number } | null = null;
const CACHE_TTL_MS = 20_000; // 20 seconds cache

async function checkLicenseOperable(accessToken?: string): Promise<boolean> {
    const now = Date.now();
    if (cachedStatus && now - cachedStatus.timestamp < CACHE_TTL_MS) {
        return cachedStatus.isOperable;
    }

    try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
        if (!apiUrl) return true;

        const res = await fetch(`${apiUrl}/api/v1/license/status`, {
            headers: {
                Accept: "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            signal: AbortSignal.timeout(3500),
        });

        if (res.ok) {
            const json = await res.json();
            const license = json?.data;
            const isOperable = Boolean(
                license?.can_operate && (license?.status === "active" || license?.is_grace_period)
            );
            cachedStatus = { isOperable, timestamp: now };
            return isOperable;
        }
    } catch (err) {
        console.warn("Proxy: license status check failed:", err);
        if (cachedStatus) return cachedStatus.isOperable;
    }

    // Default to true if server/network is temporarily unreachable to avoid breaking offline flow
    return true;
}

export const proxy = auth(async (req: NextRequest & { auth?: Session | null }) => {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Block access to /admin if license is not active or valid (not operable)
    if (pathname.startsWith("/admin")) {
        const session = req.auth;
        if (session) {
            const accessToken = (session as Record<string, unknown>)?.accessToken as string | undefined;
            const isOperable = await checkLicenseOperable(accessToken);

            if (!isOperable) {
                const licenseUrl = new URL("/licenses", nextUrl);
                return NextResponse.redirect(licenseUrl);
            }
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         * - public files with extensions
         */
        "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
