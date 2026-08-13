"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import {
    useOrderRequestTransfer,
    useRejectRequestTransfer,
    useRequestTransferDetail,
    useSendRequestTransfer,
} from "../api/request-transfer-api";
import { RequestTransferDetailHeader } from "./detail/request-transfer-detail-header";
import { RequestTransferGroupedItems } from "./detail/request-transfer-grouped-items";
import { RequestTransferRequestsBreakdown } from "./detail/request-transfer-requests-breakdown";

export function RequestTransferDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supplierUid = searchParams.get("supplier_uid") || "";
    const supplierSalesUid = searchParams.get("supplier_sales_uid");

    const { data: detail, isLoading, isFetching } = useRequestTransferDetail(supplierUid, supplierSalesUid);

    const reject = useRejectRequestTransfer();
    const order = useOrderRequestTransfer();
    const send = useSendRequestTransfer();

    const [confirmAction, setConfirmAction] = useState<"reject" | "order" | "send" | null>(null);

    if (!supplierUid) {
        return (
            <div className="p-8 text-center text-sm text-slate-500">
                Supplier tidak ditemukan di URL.
            </div>
        );
    }

    const anySufficient = (detail?.items || []).some((i) => i.cukup);
    const isPendingAction = reject.isPending || order.isPending || send.isPending;

    const handleConfirm = () => {
        if (!detail) return;
        const vars = { supplierUid: detail.supplier_uid, supplierSalesUid: detail.supplier_sales_uid };

        if (confirmAction === "reject") {
            reject.mutate(vars, {
                onSuccess: () => {
                    toast.success("Semua request pada summary ditolak.");
                    setConfirmAction(null);
                    router.push(ROUTES.ADMIN_REQUEST_TRANSFERS);
                },
                onError: (err) => toast.error(err.message || "Gagal menolak request."),
            });
        } else if (confirmAction === "order") {
            order.mutate(vars, {
                onSuccess: () => {
                    toast.success("Purchase Order berhasil dibuat.");
                    setConfirmAction(null);
                    router.push(ROUTES.ADMIN_REQUEST_TRANSFERS);
                },
                onError: (err) => toast.error(err.message || "Gagal membuat PO."),
            });
        } else if (confirmAction === "send") {
            send.mutate(vars, {
                onSuccess: () => {
                    toast.success("Transfer stok draft berhasil dibuat per cabang.");
                    setConfirmAction(null);
                    router.push(ROUTES.ADMIN_REQUEST_TRANSFERS);
                },
                onError: (err) => toast.error(err.message || "Gagal membuat transfer."),
            });
        }
    };

    const confirmMeta =
        confirmAction === "reject"
            ? { title: "Tolak Semua Request", desc: "Semua request pending dalam summary ini akan berstatus ditolak.", confirmText: "Ya, Tolak" }
            : confirmAction === "order"
              ? { title: "Buat Purchase Order", desc: "1 PO qty gabungan akan dibuat untuk supplier ini. Semua request menjadi ordered.", confirmText: "Ya, Order" }
              : { title: "Kirim Transfer Stok", desc: "Transfer stok draft akan dibuat per cabang asal (stok pusat keluar saat finalize di modul stock transfer).", confirmText: "Ya, Kirim" };

    return (
        <div className="space-y-5">
            <RequestTransferDetailHeader
                detail={detail}
                isPendingAction={isPendingAction}
                anySufficient={anySufficient}
                onSetConfirmAction={setConfirmAction}
            />

            {isLoading && (
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            )}

            {detail && (
                <>
                    <RequestTransferGroupedItems items={detail.items} />
                    <RequestTransferRequestsBreakdown requests={detail.requests} />
                </>
            )}

            {!isLoading && !detail && !isFetching && (
                <div className="p-8 text-center text-sm text-slate-500">
                    Summary tidak ditemukan.
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
