"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft, IconClipboardList, IconClock, IconFileDescription, IconCoins, IconUser, IconCalendar, IconBuildingBank, IconActivity } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { usePaymentDetail, useReceivingDetail, useCashAccounts, usePaymentSummary } from "../api/purchase-api";
import { useActivityLogs } from "@/features/stock/api/stock-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface PaymentDetailPageProps {
    paymentId: number;
}

export function PaymentDetailPage({ paymentId }: PaymentDetailPageProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"details" | "logs">("details");

    const { data: payment, isLoading: isDetailLoading } = usePaymentDetail(paymentId);
    const { data: cashAccounts = [] } = useCashAccounts();

    // Fetch the receiving invoice details associated with this payment
    const { data: receiving, isLoading: isReceivingLoading } = useReceivingDetail(
        payment ? payment.referensi_id : null
    );

    // Fetch payment summary (for overall debt info and payments history)
    const { data: summary, isLoading: isSummaryLoading } = usePaymentSummary(
        payment ? payment.referensi_id : null
    );

    // Fetch activity logs related to this payment transaction number
    const { data: logsData, isLoading: isLogsLoading } = useActivityLogs({
        search: payment?.nomor_transaksi || undefined,
    });

    const logs = logsData?.data || [];
    const matchedCashAccount = cashAccounts.find(acc => acc.id === payment?.cash_account_id);

    const isLoading = isDetailLoading || isReceivingLoading;

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48 rounded" />
                        <Skeleton className="h-4 w-64 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[250px] w-full rounded-2xl" />
                        <Skeleton className="h-[200px] w-full rounded-2xl" />
                    </div>
                    <div>
                        <Skeleton className="h-[300px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="max-w-md mx-auto text-center py-20 space-y-4">
                <p className="text-sm font-semibold text-slate-500">Data pembayaran tidak ditemukan.</p>
                <Button onClick={() => router.push("/admin/purchase/payment")} variant="outline">
                    Kembali ke Daftar Pembayaran
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/purchase/payment")}
                    variant="outline"
                    className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
                >
                    <IconArrowLeft size={18} />
                </Button>
                <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Detail Pembayaran Supplier</span>
                        <span className="text-xs font-mono font-normal text-slate-400">
                            ({payment.nomor_transaksi})
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                        Detail riwayat transaksi pembayaran hutang atas penerimaan barang dari supplier.
                    </p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Details Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Transaction Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100/30">
                                    <IconClipboardList size={22} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Transaksi</span>
                                    <h3 className="text-sm font-extrabold text-slate-900">{payment.nomor_transaksi}</h3>
                                </div>
                            </div>
                            <div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                                        payment.status === "completed"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}
                                >
                                    {payment.status === "completed" ? "Selesai" : "Batal (Void)"}
                                </span>
                            </div>
                        </div>

                        {/* Info Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 text-xs">
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <IconCalendar size={13} className="text-slate-400" />
                                    Tanggal Bayar
                                </span>
                                <p className="font-semibold text-slate-700">
                                    {new Date(payment.created_at).toLocaleString("id-ID", {
                                        dateStyle: "medium",
                                    })}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <IconBuildingBank size={13} className="text-slate-400" />
                                    Akun Kas / Rekening
                                </span>
                                <p className="font-semibold text-slate-700">
                                    {matchedCashAccount ? matchedCashAccount.nama : `Akun ID: ${payment.cash_account_id}`}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <IconCoins size={13} className="text-slate-400" />
                                    Metode Pembayaran
                                </span>
                                <p className="font-semibold text-slate-700">{payment.metode_pembayaran}</p>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <IconCoins size={13} className="text-slate-400" />
                                    Nominal Pembayaran
                                </span>
                                <p className="font-extrabold text-emerald-600 text-sm font-mono">
                                    {formatRupiah(payment.total)}
                                </p>
                            </div>

                            {payment.nomor_referensi && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                        <IconFileDescription size={13} className="text-slate-400" />
                                        Nomor Referensi
                                    </span>
                                    <p className="font-semibold text-slate-700">{payment.nomor_referensi}</p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <IconUser size={13} className="text-slate-400" />
                                    Dibuat Oleh
                                </span>
                                <p className="font-semibold text-slate-700">{payment.user?.name || "-"}</p>
                            </div>
                        </div>

                        {/* Void Details */}
                        {payment.status === "void" && (
                            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl text-xs space-y-2.5">
                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                    Rincian Pembatalan (Void)
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-slate-450 block">Dibatalkan Oleh ID:</span>
                                        <span className="font-bold text-rose-800">{payment.void_by || "System"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-450 block">Tanggal Batal:</span>
                                        <span className="font-bold text-rose-800">
                                            {payment.voided_at
                                                ? new Date(payment.voided_at).toLocaleString("id-ID")
                                                : "-"}
                                        </span>
                                    </div>
                                    <div className="col-span-2 space-y-1 pt-1.5 border-t border-rose-100/30">
                                        <span className="text-slate-450 block">Alasan Pembatalan:</span>
                                        <p className="font-semibold text-rose-700 italic">
                                            "{payment.catatan_void || "Tidak ada alasan tertulis."}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabbed Info Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                        <div className="flex border-b border-slate-100 shrink-0">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                                    activeTab === "details"
                                        ? "border-emerald-600 text-emerald-600"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <IconFileDescription size={16} />
                                Rincian / Catatan
                            </button>
                            <button
                                onClick={() => setActiveTab("logs")}
                                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
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
                        <div className="pt-1">
                            {activeTab === "details" ? (
                                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-xs space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan Tambahan</span>
                                    <p className="text-slate-700 font-semibold whitespace-pre-wrap leading-relaxed">
                                        {payment.catatan || payment.catatan_void || "Tidak ada catatan tambahan."}
                                    </p>
                                </div>
                            ) : isLogsLoading ? (
                                <div className="space-y-4 py-2">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4 animate-pulse">
                                            <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-slate-200 rounded-full border-2 border-white" />
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
                                        <div key={log.id} className="relative flex gap-4 pb-5 last:pb-0 border-l border-slate-100 pl-5">
                                            <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                                            <div className="space-y-1 text-xs">
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
                                    {logs.length === 0 && (
                                        <div className="text-center py-10 space-y-2">
                                            <IconActivity className="text-slate-300 w-8 h-8 mx-auto" />
                                            <p className="text-slate-400 text-xs">
                                                Belum ada log aktivitas tercatat untuk transaksi pembayaran ini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Debt Summary & Other Payments */}
                <div className="space-y-6">
                    {/* Invoice/Receiving Info Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                            <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg border border-amber-100/30">
                                <IconCoins size={16} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">Faktur Penerimaan Barang</h4>
                        </div>

                        {receiving ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">No. Penerimaan:</span>
                                        <span className="font-semibold text-slate-800">{receiving.nomor_penerimaan}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Supplier:</span>
                                        <span className="font-semibold text-slate-800">
                                            {receiving.supplier_relationship?.nama || receiving.supplier || "Tanpa Supplier"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">No. Faktur:</span>
                                        <span className="font-semibold text-slate-800">{receiving.nomor_faktur || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Total Faktur:</span>
                                        <span className="font-bold text-slate-900">{formatRupiah(receiving.nilai_faktur || 0)}</span>
                                    </div>
                                </div>

                                {isSummaryLoading ? (
                                    <div className="space-y-2 border-t border-slate-50 pt-3">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ) : summary ? (
                                    <div className="space-y-2.5 border-t border-slate-50 pt-3 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Total Dibayar:</span>
                                            <span className="font-bold text-emerald-600">{formatRupiah(summary.total_dibayar)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Sisa Hutang:</span>
                                            <span className="font-bold text-rose-600">{formatRupiah(summary.sisa_hutang)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1.5">
                                            <span className="text-slate-400">Status Pembayaran:</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                summary.status_pembayaran === "paid"
                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100/30"
                                                    : summary.status_pembayaran === "partially_paid"
                                                    ? "bg-amber-50 text-amber-600 border border-amber-100/30"
                                                    : "bg-slate-100 text-slate-600 border border-slate-200/30"
                                            }`}>
                                                {summary.status_pembayaran === "paid"
                                                    ? "LUNAS"
                                                    : summary.status_pembayaran === "partially_paid"
                                                    ? "SEBAGIAN"
                                                    : "TEMPO"}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-center py-6 text-slate-400 text-xs">
                                Gagal memuat info penerimaan barang.
                            </p>
                        )}
                    </div>

                    {/* History of Other Payments */}
                    {summary && summary.payments && summary.payments.length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Riwayat Pembayaran Faktur</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {summary.payments.map((p) => {
                                    const isCurrentPayment = p.id === paymentId;
                                    return (
                                        <div
                                            key={p.id}
                                            className={`py-2 text-[11px] flex justify-between items-center ${
                                                isCurrentPayment ? "bg-emerald-50/50 px-2.5 rounded-lg -mx-2.5" : ""
                                            }`}
                                        >
                                            <div className="space-y-0.5">
                                                <div className="font-semibold text-slate-700 flex items-center gap-1">
                                                    <span>{p.metode}</span>
                                                    {isCurrentPayment && (
                                                        <span className="text-[9px] font-bold text-emerald-600 px-1 py-0.2 bg-emerald-100 rounded">
                                                            Pembayaran Ini
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-slate-400 text-[9px]">
                                                    {p.tanggal.split(" ")[0] || p.tanggal.split("T")[0]}
                                                </div>
                                            </div>
                                            <span className="font-bold text-slate-800">
                                                {formatRupiah(p.jumlah)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
