/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist, NetworkFirst, NetworkOnly, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    precacheOptions: {
        cleanupOutdatedCaches: true,
    },
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            // Connectivity heartbeat must always hit the network, never the cache,
            // otherwise a stale cached 200 would mask a real outage.
            matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname === "/api/proxy/v1/health",
            handler: new NetworkOnly(),
        },
        {
            // QZ Tray certificate and signing requests must never be cached.
            // The client-side QZService handles failures gracefully (falls back
            // to unsigned mode or uses a localStorage-cached certificate).
            matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/proxy/v1/qz/"),
            handler: new NetworkOnly(),
        },
        {
            matcher: ({ url, sameOrigin }) => url.pathname === "/api/auth/session" && sameOrigin,
            handler: new NetworkFirst({
                cacheName: "auth-session",
                networkTimeoutSeconds: 2,
            }),
        },
        {
            matcher: ({ request, sameOrigin }) => sameOrigin && request.headers.get("RSC") === "1",
            handler: new NetworkFirst({
                cacheName: "rsc-payloads",
                networkTimeoutSeconds: 3,
            }),
        },
        {
            matcher: ({ request, sameOrigin }) => request.mode === "navigate" && sameOrigin,
            handler: new NetworkFirst({
                cacheName: "pages",
                networkTimeoutSeconds: 3,
            }),
        },
        ...defaultCache,
    ],
});

serwist.addEventListeners();
