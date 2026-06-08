"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useOpnameDetail, useActivityLogs } from "../api/stock-api";
import { IconFileDescription, IconClock } from "@tabler/icons-react";
import { PageLoader } from "@/components/feedback/page-loader";

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
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-xl bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-sm font-bold text-slate-900">
                        Detail Stock Opname: {selectedOpname?.nomor_opname || "Memuat..."}
                    </DialogTitle>
                </DialogHeader>

                {isDetailLoading || !selectedOpname ? (
                    <div className="py-8 flex-1 flex items-center justify-center">
                        <PageLoader message="Memuat detail opname..." />
                    </div>
                ) : (
                    <div className="space-y-4 pt-4 flex-1 overflow-y-auto pr-1 min-h-0">
                        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan</span>
                                <p className="font-semibold text-slate-800">{selectedOpname.catatan || "-"}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                                <div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            selectedOpname.status === "completed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-amber-50 text-amber-700 border-amber-100"
                                        }`}
                                    >
                                        {selectedOpname.status === "completed" ? "Selesai" : "Draft"}
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

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab("items")}
                                className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                                    activeTab === "items"
                                        ? "border-emerald-600 text-emerald-600"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <IconFileDescription size={16} />
                                Daftar Koreksi Barang ({selectedOpname.items?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab("logs")}
                                className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                                    activeTab === "logs"
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
                                                        className={`text-right text-xs font-bold ${
                                                            it.selisih === 0
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
                                <PageLoader message="Memuat logs..." />
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
            </DialogContent>
        </Dialog>
    );
}
