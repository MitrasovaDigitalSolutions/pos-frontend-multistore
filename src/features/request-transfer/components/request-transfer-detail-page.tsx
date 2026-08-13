"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconArrowLeft, IconPackage, IconCheck, IconX, IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import {
    useOrderRequestTransfer,
    useRejectRequestTransfer,
    useRequestTransferDetail,
    useSendRequestTransfer,
} from "../api/request-transfer-api";

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
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer"
                    >
                        <IconArrowLeft size={14} /> Kembali
                    </Button>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            {detail?.supplier_nama || "Detail Summary"}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {detail?.supplier_sales_nama
                                ? `Katalog: ${detail.supplier_sales_nama}`
                                : "Tanpa katalog"}
                        </p>
                    </div>
                </div>

                {detail && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmAction("reject")}
                            disabled={isPendingAction}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                        >
                            <IconX size={14} /> Reject
                        </Button>
                        <Button
                            onClick={() => setConfirmAction("order")}
                            disabled={isPendingAction}
                            className="flex items-center gap-1.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                        >
                            <IconCheck size={14} /> Order
                        </Button>
                        <Button
                            onClick={() => setConfirmAction("send")}
                            disabled={isPendingAction || !anySufficient}
                            title={!anySufficient ? "Tidak ada item dengan stok pusat cukup" : undefined}
                            className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                            <IconSend size={14} /> Kirim
                        </Button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            )}

            {detail && (
                <>
                    {/* Item gabungan + stok pusat */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                                <IconPackage size={15} />
                            </div>
                            <span>Item Gabungan ({detail.items.length})</span>
                        </h3>

                        {detail.items.length > 0 ? (
                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-slate-600">
                                        <tr>
                                            <th className="px-3.5 py-2.5">Produk</th>
                                            <th className="px-3.5 py-2.5 text-right w-24">Qty Request</th>
                                            <th className="px-3.5 py-2.5 text-right w-24">Stok Pusat</th>
                                            <th className="px-3 py-2.5 text-center w-24">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {detail.items.map((item) => (
                                            <tr key={item.product_uid} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-3.5 py-2.5">
                                                    <span className="font-bold text-slate-900 text-xs">
                                                        {item.nama || item.product_uid}
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right font-semibold text-slate-700">
                                                    {Number(item.kuantitas).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right text-slate-600">
                                                    {Number(item.stok_pusat).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                            item.cukup
                                                                ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                                                                : "text-rose-700 bg-rose-50 border-rose-200/60"
                                                        }`}
                                                    >
                                                        {item.cukup ? "Cukup" : "Kurang"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-4 text-center">
                                Tidak ada item pada summary ini.
                            </p>
                        )}
                    </div>

                    {/* Rincian per request */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Rincian Request ({detail.requests.length})
                        </h3>

                        {detail.requests.map((r) => (
                            <div
                                key={r.uid}
                                className="border border-slate-100 rounded-xl p-4 space-y-2"
                            >
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-slate-900 text-xs">{r.nomor_request}</span>
                                        <span className="text-[10px] text-slate-400">
                                            {r.store_nama ? `Toko: ${r.store_nama}` : ""}
                                            {r.user ? ` · ${r.user}` : ""}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {r.tanggal_request || ""}
                                    </span>
                                </div>
                                <table className="w-full text-xs text-left">
                                    <tbody className="divide-y divide-slate-50">
                                        {r.items.map((i) => (
                                            <tr key={i.product_uid}>
                                                <td className="py-1.5 text-slate-700">{i.nama || i.product_uid}</td>
                                                <td className="py-1.5 text-right font-semibold text-slate-700">
                                                    {Number(i.kuantitas).toLocaleString("id-ID")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
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
