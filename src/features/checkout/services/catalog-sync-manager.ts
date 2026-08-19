"use client";

import { getDb } from "@/lib/db";
import { apiGetList } from "@/shared/api/api-client";
import type { Product } from "@/features/master/products/types";
import type { Member } from "@/features/master/members/types";
import type { PaginationParams } from "@/types/api";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useActiveStoreStore } from "@/stores/active-store-store";
import type { AxiosRequestConfig } from "axios";

export interface SyncProgress {
    isSyncing: boolean;
    page: number;
    lastPage: number;
    percent: number;
    syncedItemsCount: number;
    totalEstimate: number;
    isIncremental: boolean;
    stage: "idle" | "products" | "members" | "completed" | "error";
    message: string;
}

const DEFAULT_PROGRESS: SyncProgress = {
    isSyncing: false,
    page: 0,
    lastPage: 0,
    percent: 0,
    syncedItemsCount: 0,
    totalEstimate: 0,
    isIncremental: false,
    stage: "idle",
    message: "",
};

// Interval otomatis sync katalog saat online (30 menit)
export const CATALOG_SYNC_INTERVAL_MS = 30 * 60 * 1000;
// Ukuran batch produk & member per halaman (250 item agar cepat dan stabil)
export const CATALOG_SYNC_PER_PAGE = 250;

export function getCatalogLastSyncedAt(storeUid?: string | null): string | null {
    if (typeof window === "undefined") return null;
    const uid = storeUid ?? useActiveStoreStore.getState().activeStoreUid;
    if (uid) {
        const storeVal = localStorage.getItem(`catalog_last_synced_at_${uid}`);
        if (storeVal) return storeVal;
    }
    return localStorage.getItem("catalog_last_synced_at");
}

function getStoreSyncKeys(storeUid?: string | null) {
    const uid = storeUid ?? useActiveStoreStore.getState().activeStoreUid ?? "default";
    return {
        lastSyncedKey: `catalog_last_synced_at_${uid}`,
        checkpointPageKey: `pos_catalog_sync_checkpoint_page_${uid}`,
    };
}

export class CatalogSyncManager {
    private static instance: CatalogSyncManager | null = null;
    private activeSyncPromise: Promise<boolean> | null = null;
    private syncingStoreUid: string | null = null;
    private abortController: AbortController | null = null;
    private currentProgress: SyncProgress = { ...DEFAULT_PROGRESS };
    private listeners: Set<(progress: SyncProgress) => void> = new Set();

    private constructor() { }

    public static getInstance(): CatalogSyncManager {
        if (!CatalogSyncManager.instance) {
            CatalogSyncManager.instance = new CatalogSyncManager();
        }
        return CatalogSyncManager.instance;
    }

    public getProgress(): SyncProgress {
        return this.currentProgress;
    }

    public isCurrentlySyncing(): boolean {
        return this.activeSyncPromise !== null;
    }

    public subscribe(listener: (progress: SyncProgress) => void): () => void {
        this.listeners.add(listener);
        listener(this.currentProgress);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private updateProgress(patch: Partial<SyncProgress>) {
        this.currentProgress = { ...this.currentProgress, ...patch };
        this.listeners.forEach((listener) => {
            try {
                listener(this.currentProgress);
            } catch (err) {
                console.error("Error in sync progress listener:", err);
            }
        });
    }

    /**
     * Memeriksa apakah katalog lokal toko aktif sudah kadaluwarsa dan butuh sync.
     */
    public async isSyncNeeded(storeUid?: string | null): Promise<boolean> {
        try {
            const targetUid = storeUid ?? useActiveStoreStore.getState().activeStoreUid;
            const targetDb = getDb(targetUid);
            const productsCount = await targetDb.products.count();
            if (productsCount === 0) return true; // Belum pernah sync / DB kosong untuk store ini

            const lastSyncedAt = getCatalogLastSyncedAt(targetUid);
            if (!lastSyncedAt) return true;

            const timeDiff = Date.now() - new Date(lastSyncedAt).getTime();
            return timeDiff > CATALOG_SYNC_INTERVAL_MS;
        } catch {
            return true;
        }
    }

    /**
     * Memulai sinkronisasi katalog dengan Zero-Tick Shared Promise Lock.
     * Jika berpindah store, otomatis membatalkan sync store sebelumnya dan memulai untuk store baru.
     */
    public startSync(options?: {
        force?: boolean;
        isManual?: boolean;
        resetAll?: boolean;
        targetStoreUid?: string;
    }): Promise<boolean> {
        const targetStoreUid = options?.targetStoreUid || useActiveStoreStore.getState().activeStoreUid;
        if (!targetStoreUid) {
            return Promise.resolve(false);
        }

        // Jika sync aktif saat ini adalah untuk store yang BERBEDA, batalkan sinkronisasi store lama!
        if (this.activeSyncPromise && this.syncingStoreUid && this.syncingStoreUid !== targetStoreUid) {
            console.log(`[CatalogSyncManager] Berpindah dari store ${this.syncingStoreUid} ke ${targetStoreUid}. Membatalkan sync lama...`);
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
            this.activeSyncPromise = null;
            this.syncingStoreUid = null;
        }

        // SHARED PROMISE LOCK: Jika ada proses sync yang sedang aktif untuk store yang SAMA, gunakan promise yang sama
        if (this.activeSyncPromise && this.syncingStoreUid === targetStoreUid) {
            return this.activeSyncPromise;
        }

        // Kunci secara sinkron di memori sebelum ada microtask/await
        this.syncingStoreUid = targetStoreUid;
        this.activeSyncPromise = this.executeSync(targetStoreUid, options).finally(() => {
            if (this.syncingStoreUid === targetStoreUid) {
                this.activeSyncPromise = null;
                this.syncingStoreUid = null;
            }
        });

        return this.activeSyncPromise;
    }

    /**
     * Eksekusi sinkronisasi internal (Products + Members)
     */
    private async executeSync(
        targetStoreUid: string,
        options?: { force?: boolean; isManual?: boolean; resetAll?: boolean }
    ): Promise<boolean> {
        const force = options?.force ?? false;
        const isManual = options?.isManual ?? false;
        const resetAll = options?.resetAll ?? false;

        // Freshness check jika bukan force atau manual trigger
        if (!force && !isManual) {
            const needed = await this.isSyncNeeded(targetStoreUid);
            if (!needed) {
                return false;
            }
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        // Kunci DB dan config API strictly ke targetStoreUid
        const targetDb = getDb(targetStoreUid);
        const reqConfig: AxiosRequestConfig = {
            headers: {
                "X-Store-UID": targetStoreUid,
            },
            signal,
        };

        try {
            const { lastSyncedKey, checkpointPageKey } = getStoreSyncKeys(targetStoreUid);
            const localProductsCount = await targetDb.products.count();
            const lastSyncedAt = getCatalogLastSyncedAt(targetStoreUid);
            const savedCheckpoint = localStorage.getItem(checkpointPageKey);

            // True Delta Sync: jika sudah ada data lokal dan pernah sync sebelumnya (dan bukan resetAll)
            const isIncremental = !resetAll && Boolean(lastSyncedAt) && localProductsCount > 0;
            let lastProductUpdate: string | undefined;

            if (isIncremental && lastSyncedAt) {
                lastProductUpdate = lastSyncedAt;
            }

            // Tentukan starting page (checkpoint resume untuk full sync yang terputus)
            let currentPage = 1;
            if (!isIncremental && savedCheckpoint) {
                const parsed = parseInt(savedCheckpoint, 10);
                if (!Number.isNaN(parsed) && parsed > 1) {
                    currentPage = parsed;
                }
            }

            let lastPage = currentPage;
            const perPage = CATALOG_SYNC_PER_PAGE;
            let totalSyncedThisSession = 0;

            this.updateProgress({
                isSyncing: true,
                stage: "products",
                isIncremental,
                page: currentPage,
                lastPage: Math.max(lastPage, currentPage),
                percent: 5,
                message: isIncremental
                    ? "Memeriksa pembaruan data produk terbaru..."
                    : "Sedang mengunduh katalog...",
            });

            // ─── 1. Sync Products via Pagination Loop ─────────────────────────────
            while (currentPage <= lastPage) {
                // Guard: jika store berganti atau dibatalkan, hentikan seketika!
                if (signal.aborted || useActiveStoreStore.getState().activeStoreUid !== targetStoreUid) {
                    console.log(`[CatalogSyncManager] Sync produk untuk store ${targetStoreUid} dihentikan karena perpindahan toko.`);
                    return false;
                }

                const params: PaginationParams & { updated_after?: string } = {
                    page: currentPage,
                    per_page: perPage,
                };
                if (lastProductUpdate) {
                    params.updated_after = lastProductUpdate;
                }

                const res = await apiGetList<Product>("/v1/products", params, reqConfig);

                if (signal.aborted || useActiveStoreStore.getState().activeStoreUid !== targetStoreUid) {
                    return false;
                }

                if (res.data && res.data.length > 0) {
                    await targetDb.products.bulkPut(res.data);
                    totalSyncedThisSession += res.data.length;
                }

                lastPage = res.meta?.last_page || 1;
                const totalItems = res.meta?.total || (lastPage * perPage);
                const progressPercent = Math.min(
                    90,
                    Math.round((currentPage / lastPage) * 85) + 5
                );

                this.updateProgress({
                    page: currentPage,
                    lastPage,
                    percent: progressPercent,
                    syncedItemsCount: totalSyncedThisSession,
                    totalEstimate: totalItems,
                    message: isIncremental
                        ? `Memperbarui ${totalSyncedThisSession} item produk...`
                        : `Sedang mengunduh katalog...`,
                });

                // Simpan checkpoint jika full sync (agar bisa resume jika koneksi terputus/pindah toko)
                if (!isIncremental && currentPage < lastPage) {
                    localStorage.setItem(checkpointPageKey, String(currentPage + 1));
                }

                currentPage++;
            }

            if (signal.aborted || useActiveStoreStore.getState().activeStoreUid !== targetStoreUid) {
                return false;
            }

            // ─── 2. Sync Members via Delta Sync & Pagination (/v1/members) ───────
            this.updateProgress({
                stage: "members",
                percent: 92,
                message: isIncremental
                    ? "Memeriksa pembaruan data member..."
                    : "Mengunduh data member pelanggan...",
            });

            try {
                const localMembersCount = await targetDb.members.count();
                const isMemberIncremental = isIncremental && localMembersCount > 0;

                // Cari pembayaran hutang offline yang belum sync agar tidak tertimpa
                const pendingDebts = await targetDb.offlineDebtPayments
                    .where("status")
                    .equals("pending")
                    .toArray();

                const pendingDeductions: Record<string, number> = {};
                for (const p of pendingDebts) {
                    pendingDeductions[p.member_uid] = (pendingDeductions[p.member_uid] || 0) + (p.amount || 0);
                }

                let memberPage = 1;
                let memberLastPage = 1;
                const memberPerPage = CATALOG_SYNC_PER_PAGE;
                let isFirstMemberBatch = true;

                while (memberPage <= memberLastPage) {
                    if (signal.aborted || useActiveStoreStore.getState().activeStoreUid !== targetStoreUid) {
                        break;
                    }

                    const memberParams: PaginationParams & { updated_after?: string } = {
                        page: memberPage,
                        per_page: memberPerPage,
                    };
                    if (isMemberIncremental && lastSyncedAt) {
                        memberParams.updated_after = lastSyncedAt;
                    }

                    const res = await apiGetList<Member>("/v1/members", memberParams, reqConfig);

                    if (signal.aborted || useActiveStoreStore.getState().activeStoreUid !== targetStoreUid) {
                        break;
                    }

                    if (res.data && res.data.length > 0) {
                        const adjustedMembers = res.data.map((m) => {
                            const deduction = pendingDeductions[m.uid] || 0;
                            if (deduction > 0) {
                                return {
                                    ...m,
                                    hutang: Math.max(0, (m.hutang || 0) - deduction),
                                };
                            }
                            return m;
                        });

                        // Hanya clear DB jika bukan delta sync
                        if (!isMemberIncremental && isFirstMemberBatch) {
                            await targetDb.members.clear();
                        }
                        isFirstMemberBatch = false;

                        // Upsert member ke target DB
                        await targetDb.members.bulkPut(adjustedMembers);

                        const currentSelected = useCheckoutStore.getState().selectedMember;
                        if (currentSelected) {
                            const match = adjustedMembers.find((m) => m.uid === currentSelected.uid);
                            if (match) {
                                useCheckoutStore.getState().setSelectedMember(match);
                            }
                        }
                    }

                    memberLastPage = res.meta?.last_page || 1;
                    memberPage++;
                }
            } catch (err) {
                console.warn("Gagal sinkronisasi data member:", err);
            }

            if (signal.aborted || useActiveStoreStore.getState().activeStoreUid !== targetStoreUid) {
                return false;
            }

            // Selesai sukses: Simpan timestamp dan hapus checkpoint
            const nowIso = new Date().toISOString();
            localStorage.setItem(lastSyncedKey, nowIso);
            localStorage.setItem("catalog_last_synced_at", nowIso);
            localStorage.removeItem(checkpointPageKey);

            this.updateProgress({
                isSyncing: false,
                stage: "completed",
                percent: 100,
                message: "Katalog produk dan data member berhasil diperbarui!",
            });

            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("pos_catalog_synced"));
            }

            return true;
        } catch (err) {
            if (signal.aborted) {
                return false;
            }
            console.error("Gagal sinkronisasi katalog:", err);
            this.updateProgress({
                isSyncing: false,
                stage: "error",
                message: "Gagal memperbarui katalog.",
            });
            return false;
        } finally {
            if (this.abortController?.signal === signal) {
                this.abortController = null;
            }
        }
    }

    /**
     * Membatalkan proses sinkronisasi katalog yang sedang berjalan.
     */
    public cancelSync() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.activeSyncPromise = null;
        this.syncingStoreUid = null;
        this.updateProgress({
            isSyncing: false,
            stage: "idle",
            percent: 0,
            message: "Sinkronisasi dibatalkan.",
        });
    }
}

export const catalogSyncManager = CatalogSyncManager.getInstance();
