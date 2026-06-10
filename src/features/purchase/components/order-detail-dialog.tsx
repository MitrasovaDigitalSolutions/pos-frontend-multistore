"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IconClipboardList, IconClock, IconFileDescription } from "@tabler/icons-react";
import { usePurchaseOrderDetail } from "../api/purchase-api";
import { useActivityLogs } from "@/features/stock/api/stock-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { Scrollable } from "@/components/ui/scrollable";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: number | null;
}

export function OrderDetailDialog({
    open,
    onOpenChange,
    orderId,
}: OrderDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<"items" | "logs">("items");

    const { data: order, isLoading: isDetailLoading } = usePurchaseOrderDetail(orderId);

    // Fetch activity logs related to this PO number
    const { data: logsData, isLoading: isLogsLoading } = useActivityLogs({
        search: order?.nomor_po || undefined,
    });

    const logs = logsData?.data || [];

    const handleOpenChange = (val: boolean) => {
        onOpenChange(val);
        if (!val) {
            setActiveTab("items"); // Reset to items tab on close
        }
    };

    if (orderId === null || !open) return null;

    // Helper to translate PO status to Indonesian label
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "draft":
                return "Draft";
            case "ordered":
                return "Dipesan (Ordered)";
            case "received":
                return "Diterima (Received)";
            case "cancelled":
                return "Dibatalkan";
            default:
                return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-amber-50 text-amber-700 border-amber-100";
            case "ordered":
                return "bg-blue-50 text-blue-700 border-blue-100";
            case "received":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-100";
            default:
                return "bg-slate-50 text-slate-700 border-slate-100";
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-3xl bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 flex-shrink-0">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconClipboardList size={20} className="text-emerald-500" />
                        <span>Detail Purchase Order</span>
                    </DialogTitle>
                </DialogHeader>

                {isDetailLoading || !order ? (
                    <div className="space-y-5 pt-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* Header Details Skeleton */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 shrink-0">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                            <div className="space-y-2 col-span-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>

                        {/* Tabs Skeleton */}
                        <div className="flex border-b border-slate-100 shrink-0 gap-4 pb-2">
                            <Skeleton className="h-8 w-28 rounded-lg" />
                            <Skeleton className="h-8 w-28 rounded-lg" />
                        </div>

                        {/* Items Table Skeleton */}
                        <div className="border border-slate-100 rounded-xl overflow-hidden mt-1 flex-1 min-h-0 flex flex-col">
                            <div className="bg-slate-50 p-3 flex justify-between border-b border-slate-100 shrink-0">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="p-3 space-y-4 overflow-y-auto flex-1">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-4 w-10" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 pt-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* PO Header Details */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs shrink-0">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">No. PO</span>
                                <p className="font-bold text-slate-900">{order.nomor_po}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal PO</span>
                                <p className="font-semibold text-slate-700">
                                    {new Date(order.tanggal_po).toLocaleString("id-ID", {
                                        dateStyle: "medium",
                                    })}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Supplier</span>
                                <p className="font-semibold text-slate-800">
                                    {order.supplier ? order.supplier.nama : order.supplier_name || "-"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Dibuat Oleh</span>
                                <p className="font-semibold text-slate-700">{order.user?.name || "-"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Estimasi Total Nilai</span>
                                <p className="font-bold text-slate-900">
                                    {formatRupiah(order.nilai_estimasi)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Status PO</span>
                                <div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan / Keterangan</span>
                                <p className="text-slate-600 font-medium">{order.catatan || "-"}</p>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-slate-100 shrink-0">
                            <button
                                onClick={() => setActiveTab("items")}
                                className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                                    activeTab === "items"
                                        ? "border-emerald-600 text-emerald-600"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <IconFileDescription size={16} />
                                Daftar Barang Dipesan ({order.items?.length || 0})
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
                        <Scrollable className="flex-1 min-h-0 max-h-[450px] pr-1">
                            {activeTab === "items" ? (
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                <th className="p-3">Nama Produk</th>
                                                <th className="p-3 text-right">Harga Estimasi</th>
                                                <th className="p-3 text-right">Qty Pesan</th>
                                                <th className="p-3 text-right">Qty Diterima</th>
                                                <th className="p-3 text-right">Subtotal Estimasi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 font-medium">
                                            {order.items?.map((item) => {
                                                const subtotal = (item.harga_estimasi || 0) * (item.kuantitas || 0);
                                                return (
                                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                                        <td className="p-3 font-semibold text-slate-900">
                                                            {item.product?.nama || "Produk dihapus"}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-700 font-mono">
                                                            {formatRupiah(item.harga_estimasi)}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-700 font-mono">
                                                            {item.kuantitas} pcs
                                                        </td>
                                                        <td className="p-3 text-right text-slate-700 font-mono">
                                                            <span className={item.kuantitas_diterima > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                                                {item.kuantitas_diterima} pcs
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right text-slate-900 font-bold font-mono">
                                                            {formatRupiah(subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {(!order.items || order.items.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-slate-400">
                                                        Tidak ada item barang tercatat.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : isLogsLoading ? (
                                <div className="space-y-4 pl-3 pr-1 py-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4 animate-pulse">
                                            <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-slate-200 rounded-full border-2 border-white shadow-sm" />
                                            <div className="space-y-2 w-full">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4 pl-3 pr-1 py-1">
                                    {logs.map((log) => (
                                        <div key={log.id} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4">
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
                                            Belum ada log aktivitas tercatat untuk Purchase Order ini.
                                        </p>
                                    )}
                                </div>
                            )}
                        </Scrollable>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
