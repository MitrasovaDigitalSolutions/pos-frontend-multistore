"use client";

import { useSyncExternalStore } from "react";

// ─── Connectivity store with active heartbeat ───────────────────────────────
// navigator.onLine alone is unreliable: it only reflects whether *an* OS network
// interface is up, not whether the backend is actually reachable. On machines
// with virtual adapters (WSL / Docker vEthernet) it stays `true` even when the
// real network is down, so the browser never fires the `offline` event and the
// POS never auto-switches to offline mode.
//
// This store combines the browser online/offline events (fast path for a real
// interface-down) with an active heartbeat that pings the backend health
// endpoint. If navigator reports offline -> offline immediately. If navigator
// reports online but the heartbeat fails repeatedly, we treat it as offline.

const HEARTBEAT_URL = "/api/proxy/v1/health";
const ONLINE_INTERVAL_MS = 30_000;     // Pengecekan setiap 30 detik saat online & stabil
const OFFLINE_INTERVAL_MS = 10_000;    // Pengecekan setiap 10 detik saat offline
const PROBING_INTERVAL_MS = 4_000;     // Pengecekan cepat setiap 4 detik jika terjadi kegagalan awal (sebelum dikonfirmasi offline)
const HEARTBEAT_TIMEOUT_MS = 3_000;
const FAILURE_THRESHOLD = 2; // consecutive heartbeat failures before going offline

let isOnline = true;
let consecutiveFailures = 0;
let started = false;
let isChecking = false;
const listeners = new Set<() => void>();

function notify() {
    for (const listener of listeners) listener();
}

function setOnline(next: boolean) {
    if (next !== isOnline) {
        isOnline = next;
        notify();
    }
}

async function runHeartbeat() {
    if (isChecking) return;
    isChecking = true;

    try {
        // If the OS already reports offline, trust it immediately (no need to ping).
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            consecutiveFailures = FAILURE_THRESHOLD;
            setOnline(false);
            return;
        }

        // Skip pinging when the tab is hidden to save requests; resume on focus.
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
            return;
        }

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT_MS);
            const res = await fetch(HEARTBEAT_URL, {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
            });
            clearTimeout(timer);

            // 502/503/504 from the Next proxy mean the backend itself is unreachable
            // (the proxy returns 502 when it cannot reach the Laravel server) -> treat
            // as a connectivity failure even though the proxy responded.
            if (res.status === 502 || res.status === 503 || res.status === 504) {
                consecutiveFailures += 1;
                if (consecutiveFailures >= FAILURE_THRESHOLD) {
                    setOnline(false);
                }
            } else {
                // Any other response (200, 404, 401, ...) means the backend is reachable.
                consecutiveFailures = 0;
                setOnline(true);
            }
        } catch {
            // Network error / timeout / abort -> count as a connectivity failure.
            consecutiveFailures += 1;
            if (consecutiveFailures >= FAILURE_THRESHOLD) {
                setOnline(false);
            }
        }
    } finally {
        isChecking = false;
    }
}

let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleNextHeartbeat() {
    if (heartbeatTimer) {
        clearTimeout(heartbeatTimer);
    }

    let nextDelay = ONLINE_INTERVAL_MS;
    if (!isOnline) {
        nextDelay = OFFLINE_INTERVAL_MS;
    } else if (consecutiveFailures > 0) {
        nextDelay = PROBING_INTERVAL_MS;
    }

    heartbeatTimer = setTimeout(() => {
        void runHeartbeat().finally(() => {
            scheduleNextHeartbeat();
        });
    }, nextDelay);
}

function triggerHeartbeatNow() {
    if (heartbeatTimer) {
        clearTimeout(heartbeatTimer);
        heartbeatTimer = null;
    }
    void runHeartbeat().finally(() => {
        scheduleNextHeartbeat();
    });
}

function handleBrowserOnline() {
    // Verify with a heartbeat rather than trusting the event outright.
    consecutiveFailures = 0;
    triggerHeartbeatNow();
}

function handleBrowserOffline() {
    consecutiveFailures = FAILURE_THRESHOLD;
    setOnline(false);
    scheduleNextHeartbeat();
}

function handleVisibilityChange() {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
        triggerHeartbeatNow();
    }
}

function start() {
    if (started || typeof window === "undefined") return;
    started = true;

    isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    window.addEventListener("online", handleBrowserOnline);
    window.addEventListener("offline", handleBrowserOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial probe and start scheduling subsequent heartbeats
    triggerHeartbeatNow();
}

function subscribe(callback: () => void) {
    start();
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
        // Note: we intentionally keep the heartbeat running for the lifetime of
        // the page so status stays warm across components mounting/unmounting.
    };
}

function getSnapshot() {
    return isOnline;
}

function getServerSnapshot() {
    return true;
}

export function useNetworkStatus() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
