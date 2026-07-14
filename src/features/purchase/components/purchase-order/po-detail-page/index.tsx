"use client";

import { useState } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "../../../api/purchase-api";
import { formatDate } from "@/lib/date-utils";
import { useActivityLogs } from "@/features/stock/api/stock-api";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { hasPermission, hasRole } from "@/constants/roles";
import { useSession } from "next-auth/react";
import { POHeaderDialog } from "../po-header-dialog";
import { ReceivingDetailDialog } from "../../receiving/receiving-detail-dialog";
import {
    PO_STATUS,
    PO_STATUS_LABELS,
    PO_STATUS_CLASSES,
    type POStatus,
} from "@/constants/purchase";
import { POSummaryCard } from "./po-summary-card";
import { POItemsTab } from "./po-items-tab";
import { POReceivingsTab } from "./po-receivings-tab";
import { POLogsTab } from "./po-logs-tab";

interface PODetailPageProps {
    poId: string;
}

function PODetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-72" />
                        <Skeleton className="h-3.5 w-44" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (Col-8) */}
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-6">
                    {/* Tabs Skeleton */}
                    <div className="flex gap-4 border-b pb-3 border-slate-100 dark:border-slate-800">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    {/* Table skeleton */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/10 space-y-4">
                        <div className="flex justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="flex justify-between pt-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column PO Summary (Col-4) */}
                <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                    <Skeleton className="h-4 w-32 border-b border-slate-50 dark:border-slate-800 pb-2" />
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4.5 w-44" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4.5 w-32" />
                        </div>
                        <div className="border-t pt-3 border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-3.5 w-20" />
                                <Skeleton className="h-3.5 w-24" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-3.5 w-24" />
                                <Skeleton className="h-3.5 w-28" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PODetailPage({ poId }: PODetailPageProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const [activeTab, setActiveTab] = useState<"items" | "receivings" | "logs">("items");
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [selectedReceivingId, setSelectedReceivingId] = useState<string | null>(null);
    const [isReceivingDetailOpen, setIsReceivingDetailOpen] = useState(false);

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
        onConfirm: () => { },
    });

    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManagePurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    if (orderLoading) {
        return <PODetailSkeleton />;
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
        return PO_STATUS_LABELS[status as POStatus] || status;
    };

    const getStatusClass = (status: string) => {
        return PO_STATUS_CLASSES[status as POStatus] || "bg-slate-50 text-slate-700 border-slate-100";
    };

    const isDraft = order.status === PO_STATUS.DRAFT;
    const canCancel = order.status !== PO_STATUS.RECEIVED && order.status !== PO_STATUS.CANCELLED && order.status !== PO_STATUS.CLOSED && hasManagePurchase;

    const handleViewReceivingDetail = (uid: string) => {
        setSelectedReceivingId(uid);
        setIsReceivingDetailOpen(true);
    };

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
                            Supplier: <span className="font-semibold text-slate-600">{order.supplier?.nama || order.supplier_name || "-"}</span> | Tanggal PO: {formatDate(order.tanggal_po, "dd MMM yyyy")}
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
                    {(order.status === PO_STATUS.ORDERED || order.status === PO_STATUS.PARTIALLY_RECEIVED) && hasManagePurchase && (
                        <Button
                            onClick={() => router.push(`/admin/purchase/receiving/new?po_uid=${poId}`)}
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
                    <POSummaryCard
                        order={order}
                        getStatusClass={getStatusClass}
                        getStatusLabel={getStatusLabel}
                    />
                </div>

                {/* Tabs & Tab Content */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-100 bg-slate-50/30 px-4 pt-2 shrink-0">
                        <button
                            onClick={() => setActiveTab("items")}
                            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${activeTab === "items"
                                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                                    : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <IconFileDescription size={16} />
                            Daftar Barang ({order.items?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab("receivings")}
                            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${activeTab === "receivings"
                                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                                    : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <IconTruckDelivery size={16} />
                            Penerimaan Terkait ({receivings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("logs")}
                            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${activeTab === "logs"
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
                            <POItemsTab items={order.items} />
                        )}

                        {activeTab === "receivings" && (
                            <POReceivingsTab
                                receivings={receivings}
                                receivingsLoading={receivingsLoading}
                                onViewDetail={handleViewReceivingDetail}
                            />
                        )}

                        {activeTab === "logs" && (
                            <POLogsTab logs={logs} logsLoading={logsLoading} />
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

            {/* Receiving Detail Dialog */}
            <ReceivingDetailDialog
                open={isReceivingDetailOpen}
                onOpenChange={setIsReceivingDetailOpen}
                receivingId={selectedReceivingId}
            />
        </div>
    );
}
export default PODetailPage;
