"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { OfflineTransactionRecord } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSyncEngine } from "@/features/checkout/hooks/use-sync-engine";
import { toast } from "sonner";
import {
    IconCloudUpload,
    IconRefresh,
    IconWifi,
    IconWifiOff,
    IconDownload,
    IconUpload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { cn } from "@/lib/utils";
import { exportOfflineBackup, importOfflineBackup } from "@/features/checkout/utils/offline-backup";
import { OfflineTransactionsTable } from "./offline-transactions-table";

interface OfflineTransactionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OfflineTransactionsDialog({ open, onOpenChange }: OfflineTransactionsDialogProps) {
    const isOnline = useNetworkStatus();
    const { triggerSelectedSync, isSyncing, updatePendingCount } = useSyncEngine();

    const [records, setRecords] = useState<OfflineTransactionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());

    const loadRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const all = await db.offlineTransactions.orderBy("timestamp").reverse().toArray();
            setRecords(all);
        } catch (err) {
            console.error("Gagal memuat riwayat transaksi offline:", err);
            toast.error("Gagal memuat riwayat transaksi offline.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load records when dialog is opened
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadRecords();
            setSelectedUids(new Set());
        }
    }, [open, loadRecords]);

    // Unsynced/Failed records are checkable
    const syncableRecords = records.filter((r) => r.status === "pending" || r.status === "failed");
    const isAllSelected = syncableRecords.length > 0 && selectedUids.size === syncableRecords.length;

    const handleSelectAllToggle = () => {
        if (isAllSelected) {
            setSelectedUids(new Set());
        } else {
            const next = new Set<string>();
            syncableRecords.forEach((r) => next.add(r.uid));
            setSelectedUids(next);
        }
    };

    const handleRowSelectToggle = (uid: string) => {
        setSelectedUids((prev) => {
            const next = new Set(prev);
            if (next.has(uid)) {
                next.delete(uid);
            } else {
                next.add(uid);
            }
            return next;
        });
    };

    const handleSyncSelected = async () => {
        if (!isOnline) {
            toast.error("Tidak dapat mengirim: koneksi offline.");
            return;
        }

        const toSync = Array.from(selectedUids);
        if (toSync.length === 0) return;

        try {
            await triggerSelectedSync(toSync);
            await loadRecords();
            await updatePendingCount();
            setSelectedUids(new Set());
        } catch (err) {
            console.error("Gagal sinkronisasi terpilih:", err);
        }
    };

    const handleExportBackup = async () => {
        await exportOfflineBackup();
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await importOfflineBackup(file, async () => {
            await loadRecords();
            await updatePendingCount();
        });

        // Reset input value so it can trigger onChange again for the same file if needed
        e.target.value = "";
    };

    const pendingCount = records.filter((r) => r.status === "pending").length;
    const syncedCount = records.filter((r) => r.status === "synced").length;
    const failedCount = records.filter((r) => r.status === "failed").length;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconCloudUpload size={20} className="text-emerald-500" />
                    <span>Daftar Transaksi Offline</span>
                </div>
            }
            className="sm:max-w-4xl w-full flex flex-col max-h-[90vh]"
        >
            <div className="space-y-4 pt-3 flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Network Status Banner */}
                <div className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold shrink-0",
                    isOnline
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                )}>
                    {isOnline ? <IconWifi size={15} /> : <IconWifiOff size={15} />}
                    {isOnline
                        ? "Koneksi tersedia — Centang transaksi dan kirimkan ke server."
                        : "Koneksi offline — Transaksi tidak dapat dikirim saat ini."}
                </div>

                {/* Summary Row & Header Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex gap-4 text-xs font-semibold text-slate-500">
                        <div>
                            Belum dikirim: <span className="text-amber-600 font-extrabold">{pendingCount}</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200 self-center" />
                        <div>
                            Gagal: <span className="text-rose-600 font-extrabold">{failedCount}</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200 self-center" />
                        <div>
                            Terkirim: <span className="text-emerald-600 font-extrabold">{syncedCount}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExportBackup}
                            disabled={isLoading || records.length === 0}
                            className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            <IconDownload size={13} />
                            Ekspor Backup
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => document.getElementById("import-offline-backup")?.click()}
                            disabled={isLoading}
                            className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            <IconUpload size={13} />
                            Impor Backup
                        </Button>
                        <input
                            type="file"
                            id="import-offline-backup"
                            accept=".json"
                            onChange={handleImportBackup}
                            className="hidden"
                        />
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <Button
                            variant="outline"
                            onClick={loadRecords}
                            disabled={isLoading}
                            className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            <IconRefresh size={13} className={cn(isLoading && "animate-spin")} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleSyncSelected}
                            disabled={!isOnline || isSyncing || selectedUids.size === 0}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer border-none disabled:opacity-50"
                        >
                            <IconCloudUpload size={13} />
                            Kirim Terpilih ({selectedUids.size})
                        </Button>
                    </div>
                </div>

                {/* Table Container */}
                <OfflineTransactionsTable
                    records={records}
                    isLoading={isLoading}
                    selectedUids={selectedUids}
                    syncableRecords={syncableRecords}
                    isAllSelected={isAllSelected}
                    onSelectAllToggle={handleSelectAllToggle}
                    onRowSelectToggle={handleRowSelectToggle}
                />

                {/* Footer notes */}
                <div className="text-[11px] text-slate-400 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100 shrink-0">
                    * Transaksi offline yang belum dikirim harus disinkronisasi sebelum menutup shift laci kasir terminal ini.
                </div>
            </div>
        </BaseDialog>
    );
}
