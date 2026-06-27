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
const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_TIMEOUT_MS = 3_000;
const FAILURE_THRESHOLD = 2; // consecutive heartbeat failures before going offline

let isOnline = true;
let consecutiveFailures = 0;
let started = false;
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

        if (res.ok) {
            consecutiveFailures = 0;
            setOnline(true);
        } else {
            // A reachable backend returning an error still means we have connectivity.
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
}

function handleBrowserOnline() {
    // Verify with a heartbeat rather than trusting the event outright.
    consecutiveFailures = 0;
    void runHeartbeat();
}

function handleBrowserOffline() {
    consecutiveFailures = FAILURE_THRESHOLD;
    setOnline(false);
}

function handleVisibilityChange() {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void runHeartbeat();
    }
}

function start() {
    if (started || typeof window === "undefined") return;
    started = true;

    isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    window.addEventListener("online", handleBrowserOnline);
    window.addEventListener("offline", handleBrowserOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial probe + periodic heartbeat. The interval intentionally runs for
    // the lifetime of the page so connectivity status stays warm.
    void runHeartbeat();
    setInterval(() => void runHeartbeat(), HEARTBEAT_INTERVAL_MS);
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
