"use client";

import type { Member } from "@/features/master/members/types";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { db } from "@/lib/db";
import { apiPatch, apiPost } from "@/shared/api/api-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useCheckoutStore } from "@/stores/checkout-store";
import type { ApiResponse } from "@/types/api";
import type { MemberPayment } from "@/features/master/members/api/members-api";

import {
    catalogSyncManager,
    type SyncProgress,
    CATALOG_SYNC_INTERVAL_MS,
} from "@/features/checkout/services/catalog-sync-manager";

import { useActiveStoreStore } from "@/stores/active-store-store";

export function useSyncEngine() {
    const isOnline = useNetworkStatus();
    const queryClient = useQueryClient();
    const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);
    const [isSyncing, setIsSyncing] = useState(false);
    const [catalogProgress, setCatalogProgress] = useState<SyncProgress>(
        catalogSyncManager.getProgress()
    );
    const [pendingCount, setPendingCount] = useState(0);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    const isSyncingRef = useRef(false);

    // Subscribe ke global catalogSyncManager progress updates
    useEffect(() => {
        const unsubscribe = catalogSyncManager.subscribe((prog) => {
            setCatalogProgress(prog);
        });
        return unsubscribe;
    }, []);

    // Update the pending transactions count from IndexedDB
    const updatePendingCount = useCallback(async () => {
        try {
            const txCount = await db.offlineTransactions
                .where("status")
                .equals("pending")
                .count();
            const debtCount = await db.offlineDebtPayments
                .where("status")
                .equals("pending")
                .count();
            setPendingCount(txCount + debtCount);
        } catch (err) {
            console.error("Gagal membaca jumlah antrean offline:", err);
        }
    }, []);

    // ─── Sync a Single Offline Transaction to /v1/transactions ──────────────────
    const syncSingleTransaction = useCallback(async (uid: string): Promise<"success" | "failed"> => {
        if (!isOnline) return "failed";

        try {
            const record = await db.offlineTransactions.get(uid);
            if (!record) return "failed";

            await apiPost("/v1/transactions", record.payload);

            const now = new Date().toISOString();

            // 1. Update permanent offline history
            await db.offlineTransactions.update(uid, {
                status: "synced",
                syncedAt: now,
                errorMessage: undefined,
            });

            // 2. Remove from active sync queue table
            await db.offlineQueue.where("uid").equals(uid).delete();

            setLastSyncedAt(new Date());
            await updatePendingCount();
            return "success";
        } catch (err) {
            const error = err as Error;
            const errorMsg = error.message || "Gagal menghubungi server";

            // Mark as failed in offline history
            await db.offlineTransactions.update(uid, {
                status: "failed",
                errorMessage: errorMsg,
            });

            // Update status in active queue too
            const queueEntry = await db.offlineQueue.where("uid").equals(uid).first();
            if (queueEntry?.id) {
                await db.offlineQueue.update(queueEntry.id, {
                    status: "failed",
                    errorMessage: errorMsg,
                });
            }

            await updatePendingCount();
            return "failed";
        }
    }, [isOnline, updatePendingCount]);

    // ─── Sync a Single Offline Debt Payment to /v1/members/pay-debt/{member_uid} ─
    const syncSingleDebtPayment = useCallback(async (uid: string): Promise<"success" | "failed"> => {
        if (!isOnline) return "failed";

        try {
            const record = await db.offlineDebtPayments.get(uid);
            if (!record) return "failed";

            const now = new Date().toISOString();
            const dateOnly = String(record.payload.tanggal_bayar || record.timestamp).split("T")[0];
            const syncPayload = {
                ...record.payload,
                uid: record.uid,
                tanggal_bayar: dateOnly,
            };

            const res = await apiPatch<ApiResponse<{ member: Member; payment: MemberPayment }>>(
                `/v1/members/pay-debt/${record.member_uid}`,
                syncPayload
            );

            if (res.data?.member) {
                const updatedMember = res.data.member;
                await db.members.put(updatedMember);

                const currentSelected = useCheckoutStore.getState().selectedMember;
                if (currentSelected?.uid === updatedMember.uid) {
                    useCheckoutStore.getState().setSelectedMember(updatedMember);
                }
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.members.all });

            // Mark as synced
            await db.offlineDebtPayments.update(uid, {
                status: "synced",
                syncedAt: now,
                errorMessage: undefined,
            });

            setLastSyncedAt(new Date());
            await updatePendingCount();
            return "success";
        } catch (err) {
            const error = err as Error;
            const errorMsg = error.message || "Gagal menghubungi server";

            await db.offlineDebtPayments.update(uid, {
                status: "failed",
                errorMessage: errorMsg,
            });

            await updatePendingCount();
            return "failed";
        }
    }, [isOnline, updatePendingCount, queryClient]);

    // ─── Sync Cash In/Out Offline Actions ──────────────────────────────────────────
    const syncOfflineDrawerActions = useCallback(async () => {
        if (!isOnline) return;

        try {
            const pendingActions = await db.offlineDrawerActions
                .where("status")
                .equals("pending")
                .sortBy("timestamp");

            for (const action of pendingActions) {
                try {
                    await db.offlineDrawerActions.update(action.id!, { status: "syncing" });

                    const endpoint = action.type === "cash_in"
                        ? `/v1/cash-drawer-sessions/${action.session_uid}/cash-in`
                        : `/v1/cash-drawer-sessions/${action.session_uid}/cash-out`;

                    await apiPost(endpoint, action.payload);

                    // Successfully synced, delete it from local table
                    await db.offlineDrawerActions.delete(action.id!);
                } catch (err) {
                    const error = err as Error;
                    console.error(`Gagal sinkronisasi aksi laci kasir offline ID ${action.id}:`, error);
                    await db.offlineDrawerActions.update(action.id!, {
                        status: "failed",
                        errorMessage: error.message || "Gagal menghubungi server",
                    });
                }
            }
        } catch (err) {
            console.error("Gagal menjalankan sinkronisasi aksi laci kasir offline:", err);
        }
    }, [isOnline]);

    // ─── Sync ALL Pending Offline Debt Payments ─────────────────────────────────
    const syncOfflineDebtPayments = useCallback(async () => {
        if (!isOnline) return;

        try {
            const pendingPayments = await db.offlineDebtPayments
                .where("status")
                .equals("pending")
                .sortBy("timestamp");

            if (pendingPayments.length === 0) return;

            let successCount = 0;
            let failCount = 0;

            for (const payment of pendingPayments) {
                const result = await syncSingleDebtPayment(payment.uid);
                if (result === "success") successCount++;
                else failCount++;
            }

            if (successCount > 0) {
                toast.success(`${successCount} pembayaran hutang offline berhasil disinkronisasi.`);
            }
            if (failCount > 0) {
                toast.error(`${failCount} pembayaran hutang gagal disinkronisasi.`);
            }
        } catch (err) {
            console.error("Gagal menjalankan sinkronisasi pembayaran hutang offline:", err);
        }
    }, [isOnline, syncSingleDebtPayment]);

    // ─── Sync ALL Pending Transactions (manual trigger) ──────────────────────────
    const syncOfflineTransactions = useCallback(async () => {
        if (!isOnline || isSyncingRef.current) return;

        try {
            isSyncingRef.current = true;
            setIsSyncing(true);
            setSyncError(null);

            // Sync drawer actions first
            await syncOfflineDrawerActions();

            const pendingRecords = await db.offlineTransactions
                .where("status")
                .equals("pending")
                .sortBy("timestamp");

            if (pendingRecords.length === 0) {
                isSyncingRef.current = false;
                setIsSyncing(false);
                return;
            }

            let successCount = 0;
            let failCount = 0;

            for (const record of pendingRecords) {
                const result = await syncSingleTransaction(record.uid);
                if (result === "success") {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} transaksi offline berhasil disinkronisasi.`);
            }

            if (failCount > 0) {
                toast.error(`${failCount} transaksi offline gagal disinkronisasi.`);
            }
        } catch (err) {
            const error = err as Error;
            setSyncError(error.message || "Terjadi kesalahan saat sinkronisasi.");
            toast.error("Gagal menjalankan sinkronisasi transaksi.");
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
            await updatePendingCount();
        }
    }, [isOnline, syncSingleTransaction, syncOfflineDrawerActions, updatePendingCount]);

    // ─── Sync Selected Transactions Only ───────────────────────────────────────
    const syncSelectedTransactions = useCallback(async (uids: string[]) => {
        if (!isOnline || isSyncingRef.current || uids.length === 0) return;

        try {
            isSyncingRef.current = true;
            setIsSyncing(true);
            setSyncError(null);

            let successCount = 0;
            let failCount = 0;

            for (const uid of uids) {
                const result = await syncSingleTransaction(uid);
                if (result === "success") {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} transaksi offline berhasil disinkronisasi.`);
            }

            if (failCount > 0) {
                toast.error(`${failCount} transaksi offline gagal disinkronisasi.`);
            }
        } catch (err) {
            const error = err as Error;
            setSyncError(error.message || "Terjadi kesalahan saat sinkronisasi.");
            toast.error("Gagal menjalankan sinkronisasi transaksi.");
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
            await updatePendingCount();
        }
    }, [isOnline, syncSingleTransaction, updatePendingCount]);

    // ─── Sync Catalog Trigger (Delegates to Singleton) ─────────────────────────
    const triggerCatalogSync = useCallback(async (force = true) => {
        if (!isOnline) return false;
        return await catalogSyncManager.startSync({ force, isManual: true });
    }, [isOnline]);

    // Initialize pending count on mount and listen to global pending count updates
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        updatePendingCount();

        const handlePendingCountUpdated = () => {
            updatePendingCount();
        };

        if (typeof window !== "undefined") {
            window.addEventListener("pos_pending_count_updated", handlePendingCountUpdated);
            window.addEventListener("pos_member_updated", handlePendingCountUpdated);
            window.addEventListener("pos_catalog_synced", handlePendingCountUpdated);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("pos_pending_count_updated", handlePendingCountUpdated);
                window.removeEventListener("pos_member_updated", handlePendingCountUpdated);
                window.removeEventListener("pos_catalog_synced", handlePendingCountUpdated);
            }
        };
    }, [updatePendingCount]);

    // Sync catalog when coming back online or when switching stores
    useEffect(() => {
        if (isOnline) {
            catalogSyncManager.startSync({ force: false, isManual: false });
            syncOfflineDrawerActions();
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        updatePendingCount();
    }, [isOnline, activeStoreUid, syncOfflineDrawerActions, updatePendingCount]);

    // Periodic catalog sync every 30 minutes while online
    useEffect(() => {
        if (!isOnline) return;

        const interval = setInterval(() => {
            catalogSyncManager.startSync({ force: false, isManual: false });
        }, CATALOG_SYNC_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isOnline, activeStoreUid]);

    // Sync catalog delta when window regains focus while online
    useEffect(() => {
        if (!isOnline) return;
        const handleWindowFocus = () => {
            catalogSyncManager.startSync({ force: false, isManual: false });
        };
        window.addEventListener("focus", handleWindowFocus);
        return () => {
            window.removeEventListener("focus", handleWindowFocus);
        };
    }, [isOnline]);

    return {
        isSyncing,
        isCatalogSyncing: catalogProgress.isSyncing,
        catalogProgress,
        pendingCount,
        lastSyncedAt,
        syncError,
        isOnline,
        triggerSync: syncOfflineTransactions,
        triggerSingleSync: syncSingleTransaction,
        triggerSelectedSync: syncSelectedTransactions,
        triggerCatalogSync,
        cancelCatalogSync: () => catalogSyncManager.cancelSync(),
        triggerSingleDebtPaymentSync: syncSingleDebtPayment,
        triggerDebtPaymentSync: syncOfflineDebtPayments,
        updatePendingCount,
    };
}
