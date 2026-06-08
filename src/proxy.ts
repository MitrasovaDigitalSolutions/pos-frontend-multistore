// ─── Next.js 16 Proxy (replaces middleware.ts) ──────────────────────────────
// In Next.js 16+, middleware.ts is renamed to proxy.ts and the export is `proxy`.

export { auth as proxy } from "@/lib/auth";

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
