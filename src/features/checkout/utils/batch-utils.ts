import type { ProductBatchInfo } from "@/features/master/products/types";
import { EXPIRATION_THRESHOLDS } from "@/features/pharmacy/constants/pharmacy-constants";
import { formatDate, parseToDate } from "@/lib/date-utils";

export interface FefoBatchAllocation {
    batchUid: string;
    batchNumber: string;
    shortBatchNumber: string;
    allocatedQty: number;
    availableStock: number;
    expiredDate: string | null;
    tanggalTerima: string | null;
}

export interface FefoAllocationResult {
    allocations: FefoBatchAllocation[];
    unallocatedQty: number;
}

export interface BatchExpiryMeta {
    status: "expired" | "danger" | "warning" | "safe" | "none";
    diffDays: number | null;
    formattedDate: string | null;
    shortDate: string | null;
    statusLabel: string;
}

export function getBatchUid(batch: ProductBatchInfo): string {
    return batch.batch_uid || batch.id_batch || batch.uid || batch.batch_number;
}

export function getBatchStock(batch: ProductBatchInfo): number {
    const raw = batch.current_stock ?? batch.qty_batch ?? 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function getBatchExpiredDate(batch: ProductBatchInfo): string | null {
    return batch.expired_date || batch.tanggal_kedaluarsa || null;
}

/**
 * Meringkas kode batch panjang (mis. "BTH-20261201-94BF" -> "#94BF")
 * agar tampilan badge di tabel/kartu kasir tetap ringkas dan mudah dibaca.
 */
export function formatShortBatchNumber(batchNumber?: string | null): string {
    if (!batchNumber) return "-";
    const clean = batchNumber.trim();

    // Pola standar auto-generated: BTH-YYYYMMDD-XXXX -> #XXXX
    const stdMatch = /^BTH-\d{6,8}-([A-Za-z0-9]+)$/i.exec(clean);
    if (stdMatch?.[1]) {
        return `#${stdMatch[1]}`;
    }

    // Jika terlalu panjang (> 10 karakter) dan memiliki pemisah '-', ambil segmen terakhir
    if (clean.length > 10 && clean.includes("-")) {
        const parts = clean.split("-").filter(Boolean);
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length >= 3) {
            return `#${lastPart}`;
        }
    }

    return clean.startsWith("#") ? clean : `#${clean}`;
}

/**
 * Mengurutkan daftar batch aktif (stok > 0) berdasarkan prinsip FEFO
 * (First Expired, First Out — tanggal kedaluarsa terdekat diutamakan).
 */
export function getSortedFefoBatches(batches?: ProductBatchInfo[] | null): ProductBatchInfo[] {
    if (!batches || !Array.isArray(batches) || batches.length === 0) {
        return [];
    }

    return batches
        .filter((b) => getBatchStock(b) > 0)
        .slice()
        .sort((a, b) => {
            const expA = getBatchExpiredDate(a);
            const expB = getBatchExpiredDate(b);

            if (expA && expB) {
                const dateA = parseToDate(expA)?.getTime() ?? Number.MAX_SAFE_INTEGER;
                const dateB = parseToDate(expB)?.getTime() ?? Number.MAX_SAFE_INTEGER;
                if (dateA !== dateB) {
                    return dateA - dateB;
                }
            } else if (expA && !expB) {
                return -1;
            } else if (!expA && expB) {
                return 1;
            }

            const recA = a.tanggal_terima ? (parseToDate(a.tanggal_terima)?.getTime() ?? 0) : 0;
            const recB = b.tanggal_terima ? (parseToDate(b.tanggal_terima)?.getTime() ?? 0) : 0;
            return recA - recB;
        });
}

/**
 * Mengambil batch utama yang akan keluar lebih dulu (FEFO prioritas #1).
 */
export function getPrimaryFefoBatch(batches?: ProductBatchInfo[] | null): ProductBatchInfo | null {
    const sorted = getSortedFefoBatches(batches);
    return sorted[0] ?? null;
}

/**
 * Menghitung alokasi pengambilan stok per batch secara FEFO untuk kuantitas tertentu.
 */
export function allocateFefoBatches(
    batches: ProductBatchInfo[] | null | undefined,
    requestedQty: number
): FefoAllocationResult {
    const sorted = getSortedFefoBatches(batches);
    let remaining = Math.max(0, Number(requestedQty) || 0);
    const allocations: FefoBatchAllocation[] = [];

    for (const batch of sorted) {
        if (remaining <= 0) break;
        const available = getBatchStock(batch);
        if (available <= 0) continue;

        const allocated = Number(Math.min(remaining, available).toFixed(4));
        if (allocated > 0) {
            allocations.push({
                batchUid: getBatchUid(batch),
                batchNumber: batch.batch_number,
                shortBatchNumber: formatShortBatchNumber(batch.batch_number),
                allocatedQty: allocated,
                availableStock: available,
                expiredDate: getBatchExpiredDate(batch),
                tanggalTerima: batch.tanggal_terima ?? null,
            });
            remaining = Number(Math.max(0, remaining - allocated).toFixed(4));
        }
    }

    return {
        allocations,
        unallocatedQty: remaining,
    };
}

/**
 * Mengurangi stok batch lokal secara FEFO (digunakan saat checkout sukses / mode offline
 * agar data batches di IndexedDB tetap sinkron sebelum delta sync berikutnya).
 */
export function deductBatchesFefo(
    batches: ProductBatchInfo[] | null | undefined,
    deductQty: number
): ProductBatchInfo[] | undefined {
    if (!batches || !Array.isArray(batches) || batches.length === 0) {
        return batches ?? undefined;
    }

    const { allocations } = allocateFefoBatches(batches, deductQty);
    if (allocations.length === 0) {
        return batches;
    }

    const deductionMap = new Map<string, number>();
    for (const alloc of allocations) {
        deductionMap.set(
            alloc.batchUid,
            (deductionMap.get(alloc.batchUid) ?? 0) + alloc.allocatedQty
        );
    }

    return batches
        .map((batch) => {
            const uid = getBatchUid(batch);
            const deducted = deductionMap.get(uid) ?? 0;
            if (deducted <= 0) return batch;

            const current = getBatchStock(batch);
            const nextStock = Number(Math.max(0, current - deducted).toFixed(4));
            return {
                ...batch,
                current_stock: nextStock,
                qty_batch: nextStock,
            };
        })
        .filter((batch) => getBatchStock(batch) > 0);
}

/**
 * Menghitung status kedaluarsa batch untuk pewarnaan badge UI dan label ringkas.
 */
export function getBatchExpiryMeta(expiredDate?: string | null): BatchExpiryMeta {
    if (!expiredDate) {
        return {
            status: "none",
            diffDays: null,
            formattedDate: null,
            shortDate: null,
            statusLabel: "Tanpa ED",
        };
    }

    const parsedDate = parseToDate(expiredDate);
    if (!parsedDate) {
        return {
            status: "none",
            diffDays: null,
            formattedDate: expiredDate,
            shortDate: expiredDate,
            statusLabel: expiredDate,
        };
    }

    const formattedDate = formatDate(parsedDate, "dd MMM yyyy") || expiredDate;
    const shortDate = formatDate(parsedDate, "dd MMM yy") || formattedDate;
    const expTime = parsedDate.getTime();
    const nowTime = Date.now();
    const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return {
            status: "expired",
            diffDays,
            formattedDate,
            shortDate,
            statusLabel: "Kedaluarsa",
        };
    }
    if (diffDays <= EXPIRATION_THRESHOLDS.DANGER_DAYS) {
        return {
            status: "danger",
            diffDays,
            formattedDate,
            shortDate,
            statusLabel: `${diffDays} hari lagi`,
        };
    }
    if (diffDays <= EXPIRATION_THRESHOLDS.WARNING_DAYS) {
        return {
            status: "warning",
            diffDays,
            formattedDate,
            shortDate,
            statusLabel: `${diffDays} hari lagi`,
        };
    }
    return {
        status: "safe",
        diffDays,
        formattedDate,
        shortDate,
        statusLabel: "Aman",
    };
}
