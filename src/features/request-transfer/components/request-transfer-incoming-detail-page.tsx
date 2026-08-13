"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/use-app-router";
import { toast } from "sonner";



import {
    IconArrowLeft,
    IconCheck,
    IconSend,
    IconX,
    IconBuildingStore,
    IconPackage,
    IconTruckDelivery,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import {
    useRejectRequestTransfer,
    useRequestTransferDetail,
    useSendRequestTransfer,
} from "../api/request-transfer-api";
import { RequestTransferIncomingTable } from "./detail/request-transfer-incoming-table";

export function RequestTransferIncomingDetailPage() {
    const router = useAppRouter();

    const searchParams = useSearchParams();
    const summaryUid = searchParams.get("summary_uid") || "";

    const { data: detail, isLoading, isFetching } = useRequestTransferDetail(summaryUid);

    const reject = useRejectRequestTransfer();
    const send = useSendRequestTransfer();

    const [confirmAction, setConfirmAction] = useState<"reject" | "send" | null>(null);

    if (!summaryUid) {
        return (
            <div className="p-8 text-center text-sm text-slate-500">
                Summary ID tidak ditemukan di URL.
            </div>
        );
    }

    const allSufficient = (detail?.items || []).every((i) => i.cukup);
    const isPendingAction = reject.isPending || send.isPending;

    const uniqueStores = Array.from(new Set((detail?.requests || []).map((r) => r.store_nama || "Cabang")));
    const totalQtySum = (detail?.items || []).reduce((acc, curr) => acc + Number(curr.kuantitas || 0), 0);

    const handleActionTrigger = (action: "reject" | "send") => {
        setConfirmAction(action);
    };

    const handleConfirm = () => {
        if (!detail) return;

        if (confirmAction === "reject") {
            reject.mutate(
                { summaryUid },
                {
                    onSuccess: () => {
                        toast.success("Semua request pada summary ditolak.");
                        setConfirmAction(null);
                        router.push(ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING);
                    },
                    onError: (err) => toast.error(err.message || "Gagal menolak request."),
                },
            );
        } else if (confirmAction === "send") {
            send.mutate(
                { summaryUid },
                {
                    onSuccess: () => {
                        toast.success("Transfer stok draft berhasil dibuat per cabang.");
                        setConfirmAction(null);
                        router.push(ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING);
                    },
                    onError: (err) => toast.error(err.message || "Gagal membuat transfer."),
                },
            );
        }
    };

    const confirmMeta =
        confirmAction === "reject"
            ? { title: "Tolak Semua Request", desc: "Semua request pending dalam summary ini akan berstatus ditolak.", confirmText: "Ya, Tolak" }
            : { title: "Kirim Transfer Stok", desc: "Transfer stok draft akan dibuat per cabang peminta. Stok keluar saat finalized.", confirmText: "Ya, Kirim Transfer" };

    const handleCreatePO = () => {
        if (!detail) return;

        const prefilledData = {
            supplier_uid: detail.supplier_uid || null,
            items: (detail.items || []).map((item) => ({
                product_uid: item.product_uid,
                barcode: null,
                nama: item.nama || item.product_uid,
                kuantitas: Number(item.kuantitas || 0),
            })),
        };
        sessionStorage.setItem(`po-prefill-${summaryUid}`, JSON.stringify(prefilledData));
        router.push(`${ROUTES.ADMIN_PURCHASE_ORDER_CREATE}?summary_uid=${summaryUid}`);
    };

    return (
        <div className="space-y-6">
            {/* Stock Transfer Style Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING)}
                        variant="outline"
                        className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer shadow-xs"
                    >
                        <IconArrowLeft size={18} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">Kelola Request Masuk</h2>
                            <Badge
                                variant="outline"
                                className="text-xs px-2.5 py-0.5 font-bold border border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                                INCOMING REQUEST
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Permintaan stok barang yang masuk dari toko cabang
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons */}
                {detail && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={() => handleActionTrigger("reject")}
                            disabled={isPendingAction}
                            variant="outline"
                            className="border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 text-rose-600 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
                        >
                            <IconX size={16} /> Tolak Request
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCreatePO}
                            disabled={isPendingAction}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-xs"
                        >
                            <IconCheck size={16} /> Buat PO
                        </Button>

                        <Button
                            type="button"
                            onClick={() => handleActionTrigger("send")}
                            disabled={isPendingAction || !allSufficient}
                            title={!allSufficient ? "Tidak dapat dikirim karena terdapat barang yang stok sumbernya kurang" : undefined}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IconSend size={16} /> Kirim Transfer Stok
                        </Button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            )}

            {detail && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Dynamic Matrix Table */}
                    <div className="lg:col-span-8 space-y-6">
                        <RequestTransferIncomingTable
                            requests={detail.requests}
                            groupedItems={detail.items}
                        />
                    </div>

                    {/* Right Column: Info Cards (Rute Toko, Supplier, Summary) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Store Route Card */}
                        <Card className="border-slate-100 shadow-xs rounded-2xl bg-white">
                            <CardHeader className="border-b border-slate-50">
                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconBuildingStore size={16} className="text-emerald-600" />
                                    <span>Rute Toko</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Toko Sumber (Tujuan Request)
                                    </span>
                                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                                        {detail.request_to_nama || "Toko Pusat"}
                                    </span>
                                </div>

                                <div className="border-t border-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Toko Peminta ({uniqueStores.length} Cabang)
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {uniqueStores.map((name) => (
                                            <span
                                                key={name}
                                                className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold px-2 py-0.5 rounded-md text-[11px]"
                                            >
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Supplier & Catalog Card */}
                        <Card className="border-slate-100 shadow-xs rounded-2xl bg-white">
                            <CardHeader className="border-b border-slate-50">
                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconPackage size={16} className="text-blue-600" />
                                    <span>Supplier & Katalog</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Supplier Target PO
                                    </span>
                                    <span className="font-bold text-slate-900 text-xs block mt-0.5">
                                        {detail.supplier_nama || "Tanpa Supplier"}
                                    </span>
                                </div>

                                {detail.supplier_sales_nama && (
                                    <div className="border-t border-slate-50 pt-2.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                            Katalog Sales
                                        </span>
                                        <span className="font-semibold text-slate-700 text-xs block mt-0.5">
                                            {detail.supplier_sales_nama}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Totals & Stock Availability Card */}
                        <Card className="border-slate-100 shadow-xs rounded-2xl bg-white">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconTruckDelivery size={16} className="text-purple-600" />
                                    <span>Ringkasan Stok</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Barang Diminta:</span>
                                    <span className="font-bold text-slate-900 text-xs">
                                        {totalQtySum.toLocaleString("id-ID")} Items
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Jumlah Dokumen:</span>
                                    <span className="font-bold text-slate-900 text-xs">
                                        {detail.requests.length} Dokumen
                                    </span>
                                </div>
                                <div className="border-t border-slate-50 pt-2.5 flex justify-between items-center">
                                    <span>Status Stock:</span>
                                    <span
                                        className={`font-bold text-xs ${allSufficient ? "text-emerald-700" : "text-amber-700"
                                            }`}
                                    >
                                        {allSufficient ? "Stok Cukup ✅" : "Perlu Order PO ⚠️"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!isLoading && !detail && !isFetching && (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                    Summary request masuk tidak ditemukan.
                </div>
            )}

            <ConfirmDialog
                open={!!confirmAction}
                onOpenChange={(open) => {
                    if (!open) setConfirmAction(null);
                }}
                title={confirmMeta.title}
                description={confirmMeta.desc}
                confirmText={confirmMeta.confirmText}
                cancelText="Batal"
                onConfirm={handleConfirm}
                isLoading={isPendingAction}
                variant={confirmAction === "reject" ? "danger" : "warning"}
            />
        </div>
    );
}
