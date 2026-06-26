"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";

export type OfflineReadinessStatus =
    | "checking"
    | "ready"
    | "partial"
    | "not-ready"
    | "dev-mode";

export interface OfflineReadinessState {
    status: OfflineReadinessStatus;
    swStatus: "none" | "installing" | "installed" | "activating" | "activated" | "controlling";
    productsCount: number;
    membersCount: number;
    lastSyncedAt: string | null;
    isDevMode: boolean;
}

const INITIAL_STATE: OfflineReadinessState = {
    status: "checking",
    swStatus: "none",
    productsCount: 0,
    membersCount: 0,
    lastSyncedAt: null,
    isDevMode: false,
};

function resolveStatus(
    isDevMode: boolean,
    swStatus: OfflineReadinessState["swStatus"],
    productsCount: number
): OfflineReadinessStatus {
    if (isDevMode) return "dev-mode";
    const swReady = swStatus === "controlling" || swStatus === "activated";
    const hasLocalData = productsCount > 0;
    if (swReady && hasLocalData) return "ready";
    if (swReady || hasLocalData) return "partial";
    return "not-ready";
}

async function getDbCounts(): Promise<{ productsCount: number; membersCount: number }> {
    try {
        const [productsCount, membersCount] = await Promise.all([
            db.products.count(),
            db.members.count(),
        ]);
        return { productsCount, membersCount };
    } catch {
        return { productsCount: 0, membersCount: 0 };
    }
}

export function useOfflineReadiness(): OfflineReadinessState {
    const [state, setState] = useState<OfflineReadinessState>(INITIAL_STATE);
    const mountedRef = useRef(true);

    const updateDbCounts = useCallback(async () => {
        const { productsCount, membersCount } = await getDbCounts();
        if (!mountedRef.current) return;
        const lastSyncedAt = localStorage.getItem("catalog_last_synced_at") ?? null;
        setState((prev) => ({
            ...prev,
            productsCount,
            membersCount,
            lastSyncedAt,
            status: resolveStatus(prev.isDevMode, prev.swStatus, productsCount),
        }));
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

        const isDevMode = process.env.NODE_ENV === "development";

        if (isDevMode) {
            // SW is intentionally disabled in dev — still show IndexedDB status
            let active = true;
            void getDbCounts().then(({ productsCount, membersCount }) => {
                if (!active) return;
                setState({
                    status: "dev-mode",
                    swStatus: "none",
                    productsCount,
                    membersCount,
                    lastSyncedAt: localStorage.getItem("catalog_last_synced_at") ?? null,
                    isDevMode: true,
                });
            });
            return () => {
                active = false;
            };
        }

        // Use @serwist/window for accurate SW lifecycle tracking
        let serwistCleanup: (() => void) | null = null;
        let active = true;

        // Track if SW was already controlling when page loaded.
        // If it was, no need to refresh (SW was already set up from a previous visit).
        // If not, this is a first install — we must refresh so the SW can take control.
        const wasAlreadyControlled = !!navigator.serviceWorker.controller;

        const initSerwist = async () => {
            const { Serwist } = await import("@serwist/window");
            if (!active) return;

            const serwist = new Serwist("/sw.js");

            const handleSwStatus = (swStatus: OfflineReadinessState["swStatus"]) => {
                if (!active) return;
                void getDbCounts().then(({ productsCount, membersCount }) => {
                    if (!active) return;
                    setState({
                        status: resolveStatus(false, swStatus, productsCount),
                        swStatus,
                        productsCount,
                        membersCount,
                        lastSyncedAt: localStorage.getItem("catalog_last_synced_at") ?? null,
                        isDevMode: false,
                    });
                });
            };

            // Map Serwist lifecycle events to our swStatus
            const onInstalling = () => handleSwStatus("installing");
            const onInstalled = () => handleSwStatus("installed");
            const onActivating = () => handleSwStatus("activating");
            const onActivated = () => handleSwStatus("activated");
            const onControlling = () => {
                handleSwStatus("controlling");

                // Auto-refresh only on first install (SW was not controlling before).
                // This ensures the SW actually starts intercepting fetch requests
                // so the app can work offline after a single reload.
                if (!wasAlreadyControlled) {
                    // Small delay so the "controlling" state renders briefly before reload.
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                }
            };
            const onRedundant = () => handleSwStatus("none");

            serwist.addEventListener("installing", onInstalling);
            serwist.addEventListener("installed", onInstalled);
            serwist.addEventListener("activating", onActivating);
            serwist.addEventListener("activated", onActivated);
            serwist.addEventListener("controlling", onControlling);
            serwist.addEventListener("redundant", onRedundant);

            // If SW is already controlling, resolve immediately (no reload needed)
            if (wasAlreadyControlled) {
                handleSwStatus("controlling");
            }

            await serwist.register();

            serwistCleanup = () => {
                serwist.removeEventListener("installing", onInstalling);
                serwist.removeEventListener("installed", onInstalled);
                serwist.removeEventListener("activating", onActivating);
                serwist.removeEventListener("activated", onActivated);
                serwist.removeEventListener("controlling", onControlling);
                serwist.removeEventListener("redundant", onRedundant);
            };
        };

        void initSerwist();

        return () => {
            active = false;
            serwistCleanup?.();
        };
    }, []);

    // Periodically re-check DB counts (e.g., after catalog sync completes)
    useEffect(() => {
        const interval = setInterval(() => void updateDbCounts(), 30_000);
        return () => clearInterval(interval);
    }, [updateDbCounts]);

    return state;
}
