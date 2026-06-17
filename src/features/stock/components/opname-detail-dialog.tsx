"use client";

import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useOpnameDetail, useActivityLogs, useOpnameProgress } from "../api/stock-api";
import { IconFileDescription, IconClock } from "@tabler/icons-react";
import { PageLoader } from "@/components/feedback/page-loader";
import { OPNAME_STATUS_CLASSES, OPNAME_STATUS_LABELS } from "@/constants/stock";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface OpnameDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opnameId: number | null;
}

export function OpnameDetailDialog({
    open,
    onOpenChange,
    opnameId,
}: OpnameDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<"items" | "logs">("items");

    const { data: selectedOpname, isLoading: isDetailLoading } = useOpnameDetail(opnameId);

    // Fetch activity logs related to this opname number
    const { data: logsData, isLoading: isLogsLoading } = useActivityLogs({
        search: selectedOpname?.nomor_opname || undefined,
    });

    const logs = logsData?.data || [];

    const handleOpenChange = (val: boolean) => {
        onOpenChange(val);
        if (!val) {
            setActiveTab("items"); // Reset to items tab on close
        }
    };

    if (opnameId === null || !open) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={handleOpenChange}
            title={`Detail Stock Opname: ${selectedOpname?.nomor_opname || "Memuat..."}`}
            className="sm:max-w-3xl flex flex-col max-h-[90vh]"
        >
            {isDetailLoading || !selectedOpname ? (
                <div className="py-8 flex-1 flex items-center justify-center">
                    <PageLoader message="Memuat detail opname..." variant="compact" />
                </div>
            ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-1 min-h-0">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan</span>
                            <p className="font-semibold text-slate-800">{selectedOpname.catatan || "-"}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                            <div>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${OPNAME_STATUS_CLASSES[selectedOpname.status] || "bg-slate-50 text-slate-700 border-slate-100"
                                        }`}
                                >
                                    {OPNAME_STATUS_LABELS[selectedOpname.status] || selectedOpname.status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Dibuat</span>
                            <p className="font-semibold text-slate-700">
                                {new Date(selectedOpname.created_at).toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </p>
                        </div>
                    </div>

                    {selectedOpname.status === "processing" && (
                        <OpnameProgressCard id={selectedOpname.id} />
                    )}

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab("items")}
                            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${activeTab === "items"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <IconFileDescription size={16} />
                            Daftar Koreksi Barang ({selectedOpname.items?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab("logs")}
                            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${activeTab === "logs"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <IconClock size={16} />
                            Log Aktivitas ({logs.length})
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-48 max-h-72 overflow-y-auto">
                        {activeTab === "items" ? (
                            <Table className="w-full">
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-bold text-slate-500">
                                            Nama Produk
                                        </TableHead>
                                        <TableHead className="text-right text-[10px] font-bold text-slate-500">
                                            Stok Sistem
                                        </TableHead>
                                        <TableHead className="text-right text-[10px] font-bold text-slate-500">
                                            Stok Fisik
                                        </TableHead>
                                        <TableHead className="text-right text-[10px] font-bold text-slate-500">
                                            Selisih
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedOpname.items && selectedOpname.items.length > 0 ? (
                                        selectedOpname.items.map((it) => (
                                            <TableRow key={it.id}>
                                                <TableCell className="text-xs font-semibold text-slate-800">
                                                    {it.product?.nama || "Produk ID: " + it.product_id}
                                                </TableCell>
                                                <td className="text-right text-xs text-slate-500">
                                                    {it.stok_sistem} pcs
                                                </td>
                                                <td className="text-right text-xs text-slate-800 font-bold">
                                                    {it.stok_fisik} pcs
                                                </td>
                                                <td
                                                    className={`text-right text-xs font-bold ${it.selisih === 0
                                                        ? "text-slate-500"
                                                        : it.selisih > 0
                                                            ? "text-emerald-600"
                                                            : "text-rose-500"
                                                        }`}
                                                >
                                                    {it.selisih > 0 ? `+${it.selisih}` : it.selisih}
                                                </td>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-slate-400 text-xs">
                                                Tidak ada item tercatat.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        ) : isLogsLoading ? (
                            <PageLoader message="Memuat logs..." variant="compact" />
                        ) : (
                            <div className="space-y-4 pl-3 pr-1 py-1">
                                {logs.map((log) => (
                                    <div key={log.id} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4">
                                        {/* Dot */}
                                        <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                        <div className="space-y-0.5 text-xs">
                                            <p className="font-semibold text-slate-800">
                                                {log.description}
                                            </p>
                                            <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                                                <span>
                                                    {new Date(log.created_at).toLocaleString("id-ID")}
                                                </span>
                                                <span>•</span>
                                                <span>Oleh: {log.user?.name || "System"}</span>
                                                {log.ip_address && (
                                                    <>
                                                        <span>•</span>
                                                        <span>IP: {log.ip_address}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <p className="text-center py-8 text-slate-400 text-xs">
                                        Belum ada log aktivitas tercatat untuk opname ini.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </BaseDialog>
    );
}

function OpnameProgressCard({ id }: { id: number }) {
    const queryClient = useQueryClient();
    const { data: progressData } = useOpnameProgress(id);

    useEffect(() => {
        if (progressData?.status === "completed" || progressData?.status === "failed") {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(id),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.products.all,
            });
        }
    }, [progressData?.status, id, queryClient]);

    const percentage = progressData?.progress ?? 0;
    const processed = progressData?.processed_items ?? 0;
    const total = progressData?.total_items ?? 0;
    const errMessage = progressData?.error_message;

    return (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2 text-xs transition-all duration-300">
            <div className="flex justify-between items-center font-bold text-blue-800">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                    Memproses Koreksi Stok...
                </span>
                <span>{percentage}%</span>
            </div>
            
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            
            <div className="flex justify-between text-[10px] text-blue-600 font-medium">
                <span>Item diproses: {processed} dari {total}</span>
                {errMessage && (
                    <span className="text-rose-600 font-bold">Error: {errMessage}</span>
                )}
            </div>
        </div>
    );
}
