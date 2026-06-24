"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { db, type OfflineTransaction } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { apiGetList, apiGetData, apiPost } from "@/shared/api/api-client";
import type { Product } from "@/features/products/types";
import type { Member } from "@/features/members/types";
import { toast } from "sonner";

export function useSyncEngine() {
    const isOnline = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCatalogSyncing, setIsCatalogSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    const isSyncingRef = useRef(false);

    // Update the pending transactions count from IndexedDB
    const updatePendingCount = useCallback(async () => {
        try {
            const count = await db.offlineQueue
                .where("status")
                .equals("pending")
                .count();
            setPendingCount(count);
        } catch (err) {
            console.error("Gagal membaca jumlah antrean offline:", err);
        }
    }, []);

    // ─── Phase 5: Replay Offline Queue to Bulk Endpoint ─────────────────────
    const syncOfflineTransactions = useCallback(async () => {
        if (!isOnline || isSyncingRef.current) return;

        try {
            isSyncingRef.current = true;
            setIsSyncing(true);
            setSyncError(null);

            // Fetch all pending offline transactions
            const pendingTx = await db.offlineQueue
                .where("status")
                .equals("pending")
                .sortBy("id");

            if (pendingTx.length === 0) {
                isSyncingRef.current = false;
                setIsSyncing(false);
                return;
            }

            // Mark transactions as syncing
            const ids = pendingTx.map((tx) => tx.id!);
            await db.offlineQueue.where("id").anyOf(ids).modify({ status: "syncing" });

            // Prepare the bulk transaction payload
            const payloads = pendingTx.map((tx) => ({
                uid: tx.uid,
                ...tx.payload,
                created_at: tx.timestamp, // Maintain the original offline transaction time
            }));

            try {
                // Post bulk transactions to the backend bulk endpoint
                await apiPost("/v1/transactions/bulk", { transactions: payloads });

                // Delete synced transactions from IndexedDB
                await db.offlineQueue.where("id").anyOf(ids).delete();
                setLastSyncedAt(new Date());
                toast.success(`${pendingTx.length} Transaksi offline berhasil disinkronisasi ke server.`);
            } catch (apiErr: any) {
                // If API fails, mark them as pending again and store the error message
                const errorMsg = apiErr.message || "Gagal menghubungi server";
                await db.offlineQueue.where("id").anyOf(ids).modify({
                    status: "pending",
                    errorMessage: errorMsg,
                });
                setSyncError(errorMsg);
                toast.error(`Sinkronisasi gagal: ${errorMsg}`);
            }
        } catch (err: any) {
            console.error("Gagal menjalankan sync engine:", err);
            setSyncError(err.message || "Unknown error");
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
            updatePendingCount();
        }
    }, [isOnline, updatePendingCount]);

    // ─── Phase 4 & 5: Delta Catalog Syncing ──────────────────────────────────
    const syncCatalog = useCallback(async () => {
        if (!isOnline || isCatalogSyncing) return;

        try {
            setIsCatalogSyncing(true);

            // 1. Sync Products (Incremental Delta Sync)
            let lastProductUpdate = "";
            const lastProduct = await db.products.orderBy("updated_at").last();
            if (lastProduct && lastProduct.updated_at) {
                lastProductUpdate = lastProduct.updated_at;
            }

            let currentPage = 1;
            let lastPage = 1;
            const perPage = 250;

            // Fetch and merge in pages
            while (currentPage <= lastPage) {
                const params: Record<string, any> = {
                    page: currentPage,
                    per_page: perPage,
                };
                if (lastProductUpdate) {
                    params.updated_after = lastProductUpdate;
                }

                const res = await apiGetList<Product>("/v1/products", params);
                if (res.data && res.data.length > 0) {
                    // Filter active items and upsert them into local IndexedDB products store
                    await db.products.bulkPut(res.data);
                }

                lastPage = res.meta?.last_page || 1;
                currentPage++;
            }

            // 2. Sync Members (Fetch all)
            try {
                const members = await apiGetData<Member[]>("/v1/members/all");
                if (members && members.length > 0) {
                    await db.members.clear();
                    await db.members.bulkPut(members);
                }
            } catch (err) {
                console.warn("Gagal sinkronisasi data member:", err);
            }

            localStorage.setItem("catalog_last_synced_at", new Date().toISOString());
        } catch (err) {
            console.error("Gagal sinkronisasi katalog:", err);
        } finally {
            setIsCatalogSyncing(false);
        }
    }, [isOnline, isCatalogSyncing]);

    // Listen to network status changes and trigger sync when online
    useEffect(() => {
        updatePendingCount();

        if (isOnline) {
            syncOfflineTransactions();
            syncCatalog();
        }
    }, [isOnline, syncOfflineTransactions, syncCatalog, updatePendingCount]);

    // Setup periodic sync checks (every 45 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            if (isOnline) {
                syncOfflineTransactions();
                updatePendingCount();
            }
        }, 45000);

        return () => clearInterval(interval);
    }, [isOnline, syncOfflineTransactions, updatePendingCount]);

    return {
        isSyncing,
        isCatalogSyncing,
        pendingCount,
        lastSyncedAt,
        syncError,
        isOnline,
        triggerSync: syncOfflineTransactions,
        triggerCatalogSync: syncCatalog,
    };
}
