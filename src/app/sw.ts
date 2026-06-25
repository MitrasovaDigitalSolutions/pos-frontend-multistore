/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist, NetworkFirst, StaleWhileRevalidate, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

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
            matcher: ({ url, sameOrigin }) => url.pathname === "/api/auth/session" && sameOrigin,
            handler: new NetworkFirst({
                cacheName: "auth-session",
                networkTimeoutSeconds: 2,
            }),
        },
        {
            matcher: ({ request, sameOrigin }) => sameOrigin && request.headers.get("RSC") === "1",
            handler: new StaleWhileRevalidate({
                cacheName: "rsc-payloads",
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
