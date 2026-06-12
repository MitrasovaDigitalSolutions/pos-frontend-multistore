"use client";

import { useState } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
    IconArrowLeft,
    IconClock,
    IconFileDescription,
    IconTruckDelivery,
    IconCheck,
    IconCircleX,
    IconTrash,
    IconEdit,
    IconAlertCircle,
    IconArrowRight,
} from "@tabler/icons-react";
import {
    usePurchaseOrderDetail,
    useCancelPurchaseOrder,
    useDeletePurchaseOrder,
    useFinalizePurchaseOrder,
    usePurchaseOrderReceivings,
} from "../api/purchase-api";
import { useActivityLogs } from "@/features/stock/api/stock-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { hasPermission, hasRole } from "@/constants/roles";
import { useSession } from "next-auth/react";
import { POHeaderDialog } from "./po-header-dialog";

interface PODetailPageProps {
    poId: number;
}

export function PODetailPage({ poId }: PODetailPageProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const [activeTab, setActiveTab] = useState<"items" | "receivings" | "logs">("items");
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);

    const { data: order, isLoading: orderLoading, error } = usePurchaseOrderDetail(poId);
    
    // Fetch outstanding/related receivings for this PO
    const { data: receivingsData, isLoading: receivingsLoading } = usePurchaseOrderReceivings(
        order ? poId : null
    );
    const receivings = receivingsData?.data || [];

    // Fetch activity logs related to this PO number
    const { data: logsData, isLoading: logsLoading } = useActivityLogs({
        search: order?.nomor_po || undefined,
    });
    const logs = logsData?.data || [];

    const deleteOrder = useDeletePurchaseOrder();
    const finalizeOrder = useFinalizePurchaseOrder();
    const cancelOrder = useCancelPurchaseOrder();

    // Check if there are local unsaved items in Zustand store
    const store = getPurchaseItemsStore(poId, "po");
    const localItemsCount = store((state) => state.items.length);

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: React.ReactNode;
        confirmText: string;
        cancelText?: string;
        variant: "danger" | "warning" | "info" | "success";
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        confirmText: "",
        variant: "warning",
        onConfirm: () => {},
    });

    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManagePurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    if (orderLoading) {
        return <PageLoader message="Memuat detail Purchase Order..." />;
    }

    if (error || !order) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Purchase Order tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push("/admin/purchase/order")}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar PO
                </Button>
            </div>
        );
    }

    const handleFinalize = () => {
        setConfirmDialog({
            open: true,
            title: "Finalisasi Purchase Order",
            description: `Apakah Anda yakin ingin memfinalisasi Purchase Order '${order.nomor_po}'? Status akan berubah menjadi ordered dan Anda dapat memproses penerimaan barang.`,
            confirmText: "Ya, Finalisasi",
            cancelText: "Batal",
            variant: "success",
            onConfirm: () => {
                finalizeOrder.mutate(poId, {
                    onSuccess: () => {
                        toast.success("Purchase Order berhasil difinalisasi.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memfinalisasi PO.");
                    },
                });
            },
        });
    };

    const handleCancel = () => {
        setConfirmDialog({
            open: true,
            title: "Batalkan Purchase Order",
            description: `Apakah Anda yakin ingin membatalkan Purchase Order '${order.nomor_po}'? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: "Ya, Batalkan",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                cancelOrder.mutate(poId, {
                    onSuccess: () => {
                        toast.success("Purchase Order berhasil dibatalkan.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal membatalkan PO.");
                    },
                });
            },
        });
    };

    const handleDelete = () => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Purchase Order",
            description: "Apakah Anda yakin ingin menghapus draft Purchase Order ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteOrder.mutate(poId, {
                    onSuccess: () => {
                        toast.success("Draft Purchase Order berhasil dihapus.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                        router.push("/admin/purchase/order");
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menghapus draft PO.");
                    },
                });
            },
        });
    };

    // Status styling helpers
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "draft":
                return "Draft";
            case "ordered":
                return "Ordered";
            case "partially_received":
                return "Partially Received";
            case "received":
                return "Received";
            case "closed":
                return "Closed";
            case "cancelled":
                return "Cancelled";
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
            case "partially_received":
                return "bg-indigo-50 text-indigo-700 border-indigo-100";
            case "received":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "closed":
                return "bg-purple-50 text-purple-700 border-purple-100";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-100";
            default:
                return "bg-slate-50 text-slate-700 border-slate-100";
        }
    };

    const isDraft = order.status === "draft";
    const canCancel = order.status !== "received" && order.status !== "cancelled" && order.status !== "closed" && hasManagePurchase;

    return (
        <div className="space-y-6">
            {/* Breadcrumb / Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        onClick={() => router.push("/admin/purchase/order")}
                        variant="outline"
                        className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    >
                        <IconArrowLeft size={18} />
                    </Button>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Detail PO: {order.nomor_po}</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusClass(
                                    order.status
                                )}`}
                            >
                                {getStatusLabel(order.status)}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            Supplier: <span className="font-semibold text-slate-600">{order.supplier?.nama || order.supplier_name || "-"}</span> | Tanggal PO: {new Date(order.tanggal_po).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </p>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {isDraft && hasManagePurchase && (
                        <>
                            <Button
                                onClick={() => setIsEditHeaderOpen(true)}
                                variant="outline"
                                className="border-slate-200 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                            >
                                <IconEdit size={16} /> Edit Info PO
                            </Button>
                            <Button
                                onClick={() => router.push(`/admin/purchase/order/${poId}/items`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                            >
                                <IconEdit size={16} /> Edit Barang
                            </Button>
                            <Button
                                onClick={handleFinalize}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                            >
                                <IconCheck size={16} /> Finalisasi PO
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                className="border-rose-200 hover:border-rose-300 hover:bg-rose-50/30 text-rose-600 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
                            >
                                <IconTrash size={16} /> Hapus Draft
                            </Button>
                        </>
                    )}

                    {canCancel && (
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="border-rose-200 hover:border-rose-300 hover:bg-rose-50/30 text-rose-600 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
                        >
                            <IconCircleX size={16} /> Batalkan PO
                        </Button>
                    )}

                    {/* Link to create receiving from this PO */}
                    {(order.status === "ordered" || order.status === "partially_received") && hasManagePurchase && (
                        <Button
                            onClick={() => router.push(`/admin/purchase/receiving/new?po_id=${poId}`)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                        >
                            <IconTruckDelivery size={16} /> Proses Penerimaan Barang
                        </Button>
                    )}
                </div>
            </div>

            {/* Unsaved items local alert */}
            {localItemsCount > 0 && isDraft && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <IconAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-xs font-bold text-amber-900">Perubahan Lokal Belum Disubmit</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                                Anda memiliki {localItemsCount} item di browser local storage yang belum disubmit ke server.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push(`/admin/purchase/order/${poId}/items`)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-8 px-4 rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                        Lanjutkan Input Barang <IconArrowRight size={14} />
                    </Button>
                </div>
            )}

            {/* Content Section: Information Card & Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Details Box */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-50">
                            Ringkasan Dokumen
                        </h3>

                        <div className="grid grid-cols-2 gap-4 text-xs">
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
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Estimasi Total PO</span>
                                <p className="font-bold text-slate-900 text-sm text-emerald-600 font-mono">
                                    {formatRupiah(order.nilai_estimasi)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Diterima</span>
                                <p className="font-bold text-slate-900 font-mono">
                                    {formatRupiah(order.total_diterima || 0)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Status PO</span>
                                <div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Penerimaan</span>
                                <p className="font-semibold text-slate-700">{order.receivings_count || 0} kali</p>
                            </div>
                            <div className="space-y-1 col-span-2 pt-2 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan / Keterangan</span>
                                <p className="text-slate-600 font-medium">{order.catatan || "-"}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Tabs & Tab Content */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-100 bg-slate-50/30 px-4 pt-2 shrink-0">
                        <button
                            onClick={() => setActiveTab("items")}
                            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                                activeTab === "items"
                                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                                    : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <IconFileDescription size={16} />
                            Daftar Barang ({order.items?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab("receivings")}
                            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                                activeTab === "receivings"
                                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                                    : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <IconTruckDelivery size={16} />
                            Penerimaan Terkait ({receivings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("logs")}
                            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                                activeTab === "logs"
                                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                                    : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <IconClock size={16} />
                            Log Aktivitas ({logs.length})
                        </button>
                    </div>

                    {/* Tab content area */}
                    <div className="p-5 overflow-x-auto">
                        {activeTab === "items" && (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="p-3">Nama Produk</th>
                                        <th className="p-3 text-right">Harga Estimasi</th>
                                        <th className="p-3 text-right">Qty PO</th>
                                        <th className="p-3 text-right">Qty Diterima</th>
                                        <th className="p-3 text-right">Subtotal</th>
                                        <th className="p-3 text-center">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {order.items?.map((item) => {
                                        const subtotal = (item.harga_estimasi || 0) * (item.kuantitas || 0);
                                        const progressPercent = Math.min(
                                            100,
                                            Math.max(0, (item.kuantitas_diterima / item.kuantitas) * 100)
                                        );
                                        
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="p-3">
                                                    <p className="font-semibold text-slate-900">
                                                        {item.product?.nama || "Produk dihapus"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                        {item.product?.barcode || "-"}
                                                    </p>
                                                </td>
                                                <td className="p-3 text-right text-slate-700 font-mono">
                                                    {formatRupiah(item.harga_estimasi)}
                                                </td>
                                                <td className="p-3 text-right text-slate-700 font-mono">
                                                    {item.kuantitas} pcs
                                                </td>
                                                <td className="p-3 text-right font-mono">
                                                    <span className={item.kuantitas_diterima > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                                        {item.kuantitas_diterima} pcs
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right text-slate-900 font-bold font-mono">
                                                    {formatRupiah(subtotal)}
                                                </td>
                                                <td className="p-3 text-center whitespace-nowrap">
                                                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden inline-block mr-1.5 align-middle">
                                                        <div
                                                            className={`h-full ${
                                                                progressPercent === 100 ? "bg-emerald-500" : progressPercent > 0 ? "bg-amber-500" : "bg-slate-200"
                                                            }`}
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-bold font-mono">
                                                        {progressPercent.toFixed(0)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!order.items || order.items.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-slate-400">
                                                Tidak ada item barang tercatat untuk Purchase Order ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "receivings" && (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="p-3">No. Penerimaan</th>
                                        <th className="p-3">Tanggal Terima</th>
                                        <th className="p-3 text-right">Nilai Faktur</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Pembayaran</th>
                                        <th className="p-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {receivings.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50/50">
                                            <td className="p-3 font-semibold text-slate-900">
                                                {rec.nomor_penerimaan}
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {new Date(rec.created_at).toLocaleString("id-ID", {
                                                    dateStyle: "medium",
                                                })}
                                            </td>
                                            <td className="p-3 text-right text-slate-700 font-mono">
                                                {rec.nilai_faktur ? formatRupiah(rec.nilai_faktur) : "-"}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                                        rec.status === "completed"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                            : "bg-amber-50 text-amber-700 border-amber-100"
                                                    }`}
                                                >
                                                    {rec.status === "completed" ? "Selesai" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                                        rec.status_pembayaran === "paid"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                            : "bg-amber-50 text-amber-700 border-amber-100"
                                                    }`}
                                                >
                                                    {rec.status_pembayaran === "paid" ? "Lunas" : "Belum Lunas"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    onClick={() => router.push(`/admin/purchase/receiving/${rec.id}`)}
                                                    variant="outline"
                                                    className="h-7 px-2.5 text-[10px] border-slate-200 text-slate-600 rounded-lg hover:text-slate-900 bg-white"
                                                >
                                                    Lihat Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {receivings.length === 0 && !receivingsLoading && (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-slate-400">
                                                Belum ada dokumen penerimaan barang yang mereferensikan PO ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "logs" && (
                            <div className="space-y-4 pl-3 py-1">
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && !logsLoading && (
                                    <p className="text-center py-8 text-slate-400 text-xs">
                                        Belum ada log aktivitas tercatat untuk Purchase Order ini.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Header Dialog */}
            <POHeaderDialog
                open={isEditHeaderOpen}
                onOpenChange={setIsEditHeaderOpen}
                order={order}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                variant={confirmDialog.variant}
                onConfirm={confirmDialog.onConfirm}
                isLoading={deleteOrder.isPending || finalizeOrder.isPending || cancelOrder.isPending}
            />
        </div>
    );
}
