/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist, NetworkFirst, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

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
