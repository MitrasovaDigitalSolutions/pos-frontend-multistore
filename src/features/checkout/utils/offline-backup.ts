import { db } from "@/lib/db";
import type { OfflineTransactionRecord, OfflineTransaction } from "@/lib/db";
import { toast } from "sonner";
import { todayStr } from "@/lib/date-utils";

/**
 * Exports all offline transactions and queue items from IndexedDB into a JSON file download.
 */
export async function exportOfflineBackup(): Promise<boolean> {
    try {
        const txs = await db.offlineTransactions.toArray();
        const queue = await db.offlineQueue.toArray();

        if (txs.length === 0 && queue.length === 0) {
            toast.warning("Tidak ada data transaksi offline untuk di-backup.");
            return false;
        }

        const data = {
            version: 1,
            exportedAt: new Date().toISOString(),
            offlineTransactions: txs,
            offlineQueue: queue,
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        const dateStr = todayStr();
        link.href = url;
        link.download = `pos_offline_backup_${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Berhasil mengekspor file backup.");
        return true;
    } catch (err) {
        console.error("Gagal mengekspor data backup:", err);
        toast.error("Gagal mengekspor file backup.");
        return false;
    }
}

/**
 * Reads a backup JSON file, validates, deduplicates, and restores the records back into IndexedDB.
 */
export async function importOfflineBackup(
    file: File,
    onImported: (txsInserted: number, queueInserted: number) => Promise<void>
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const data = JSON.parse(text);

                if (
                    !data ||
                    typeof data !== "object" ||
                    !Array.isArray(data.offlineTransactions) ||
                    !Array.isArray(data.offlineQueue)
                ) {
                    toast.error("File backup tidak valid. Struktur data tidak cocok.");
                    resolve(false);
                    return;
                }

                const importedTxs = data.offlineTransactions as OfflineTransactionRecord[];
                const importedQueue = data.offlineQueue as OfflineTransaction[];

                const currentTxs = await db.offlineTransactions.toArray();
                const currentQueue = await db.offlineQueue.toArray();

                const currentTxUids = new Set(currentTxs.map((t) => t.uid));
                const currentQueueUids = new Set(currentQueue.map((q) => q.uid));

                const txsToInsert = importedTxs.filter((t) => !currentTxUids.has(t.uid));
                const queueToInsert = importedQueue
                    .filter((q) => !currentQueueUids.has(q.uid))
                    .map((q) => {
                        const rest = { ...q };
                        delete rest.id;
                        return rest;
                    });

                if (txsToInsert.length === 0 && queueToInsert.length === 0) {
                    toast.info("Semua transaksi dalam backup sudah ada di database lokal.");
                    resolve(false);
                    return;
                }

                if (txsToInsert.length > 0) {
                    await db.offlineTransactions.bulkPut(txsToInsert);
                }
                if (queueToInsert.length > 0) {
                    await db.offlineQueue.bulkAdd(queueToInsert);
                }

                toast.success(
                    `Berhasil memulihkan ${txsToInsert.length} riwayat transaksi dan ${queueToInsert.length} antrean transaksi.`
                );

                await onImported(txsToInsert.length, queueToInsert.length);
                resolve(true);
            } catch (err) {
                console.error("Gagal mengurai file backup:", err);
                toast.error("Gagal membaca atau memulihkan data dari file backup.");
                reject(err);
            }
        };

        reader.onerror = () => {
            toast.error("Gagal membaca file backup.");
            resolve(false);
        };

        reader.readAsText(file);
    });
}
