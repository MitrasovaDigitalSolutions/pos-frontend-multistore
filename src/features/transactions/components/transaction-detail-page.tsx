"use client";

import { useAppRouter } from "@/hooks/use-app-router";
import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { DataTable } from "@/components/ui/data-table";
import {
    IconArrowLeft,
    IconReceipt,
    IconPrinter,
    IconCash,
    IconCreditCard,
    IconCalendar,
    IconUser,
    IconClock,
    IconAlertTriangle,
    IconReceiptTax,
    IconTag,
    IconChevronRight,
    IconPackage,
    IconNotebook
} from "@tabler/icons-react";
import { useTransactionDetail } from "../api/transactions-api";
import type { ColumnDef } from "@tanstack/react-table";
import type { TransactionItem } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface TransactionDetailPageProps {
    transactionId: string;
}

export function TransactionDetailPage({ transactionId }: TransactionDetailPageProps) {
    const router = useAppRouter();
    const { data: transaction, isLoading, error } = useTransactionDetail(transactionId);

    if (isLoading) {
        return <PageLoader message="Memuat detail transaksi..." />;
    }

    if (error || !transaction) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                    <IconAlertTriangle size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Transaksi tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push("/admin/transactions")}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Transaksi
                </Button>
            </div>
        );
    }

    // Format transaction date
    const date = new Date(transaction.created_at);
    const formattedDate = format(date, "dd MMMM yyyy, HH:mm", { locale: id });

    // Status Styling
    const statusLabels: Record<string, string> = {
        completed: "Selesai",
        canceled: "Void / Dibatalkan",
        draft: "Draft",
    };
    const statusClasses: Record<string, string> = {
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        canceled: "bg-rose-50 text-rose-700 border-rose-200",
        draft: "bg-amber-50 text-amber-700 border-amber-200",
    };

    const currentStatus = transaction.status?.toLowerCase() || "completed";
    const statusLabel = statusLabels[currentStatus] || transaction.status;
    const statusClass = statusClasses[currentStatus] || "bg-slate-50 text-slate-700 border-slate-200";

    // Columns configuration for DataTable
    const columns: ColumnDef<TransactionItem>[] = [
        {
            accessorKey: "nama_produk",
            header: "Nama Produk",
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                        <IconPackage size={14} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">
                                {row.original.nama_produk}
                            </span>
                            {row.original.product?.is_jasa && (
                                <span className="text-[8px] border-none bg-blue-50 text-blue-700 px-1 py-px rounded font-semibold shrink-0">
                                    Jasa
                                </span>
                            )}
                        </div>
                        {row.original.barcode && (
                            <span className="text-[9px] font-mono text-slate-400">
                                {row.original.barcode}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "harga_satuan",
            header: "Harga Satuan",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-medium tabular-nums text-slate-600",
            },
            cell: ({ row }) => formatRupiah(row.original.harga_satuan),
        },
        {
            accessorKey: "kuantitas",
            header: "Jumlah (Qty)",
            meta: {
                headerClassName: "text-center",
                cellClassName: "text-center font-bold tabular-nums text-slate-700",
            },
            cell: ({ row }) => `${row.original.kuantitas} pcs`,
        },
        {
            accessorKey: "subtotal",
            header: "Subtotal",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-bold text-slate-900 tabular-nums",
            },
            cell: ({ row }) => formatRupiah(row.original.subtotal),
        },
    ];

    const handlePrint = () => {
        if (transaction?.id) {
            const toastId = toast.success("Mencetak struk...");
            window.open(`/api/proxy/v1/transactions-print/${transaction.id}`, "_blank");
            setTimeout(() => {
                toast.dismiss(toastId);
            }, 3000);
        } else {
            toast.error("Gagal mencetak struk: ID transaksi tidak ditemukan.");
        }
    };

    return (
        <>
            {/* ─── PRINT-ONLY SECTION (Hidden in Web View) ─── */}
            <div className="hidden print:block w-[76mm] mx-auto text-black p-1 text-[11px] font-mono leading-tight bg-white">
                <div className="text-center space-y-1 mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider">MITRA BUANA MOTOR</h2>
                    <p className="text-[9px] text-gray-600">Jl. Raya Sukabumi No. 123</p>
                    <p className="text-[9px] text-gray-600">Telp: (0266) 123456</p>
                    <div className="border-t border-dashed border-gray-400 my-2" />
                </div>

                <div className="space-y-1 mb-4 text-[9px]">
                    <div className="flex justify-between">
                        <span>No. Transaksi:</span>
                        <span className="font-bold">{transaction.nomor_transaksi}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kasir:</span>
                        <span>{transaction.user?.name || "Kasir"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="uppercase font-bold">{transaction.status}</span>
                    </div>
                    {transaction.member && (
                        <div className="flex justify-between font-bold">
                            <span>Member:</span>
                            <span>{transaction.member.nama} ({transaction.member.kode})</span>
                        </div>
                    )}
                    <div className="border-t border-dashed border-gray-400 my-2" />
                </div>

                {/* Print Items */}
                <table className="w-full text-[9px] border-collapse mb-4">
                    <thead>
                        <tr className="border-b border-dashed border-gray-400">
                            <th className="text-left pb-1">Item</th>
                            <th className="text-center pb-1">Qty</th>
                            <th className="text-right pb-1">Harga</th>
                            <th className="text-right pb-1">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaction.items.map((item) => (
                            <tr key={item.id} className="align-top">
                                <td className="py-1 pr-2 truncate max-w-[120px]">{item.nama_produk}</td>
                                <td className="py-1 text-center">{item.kuantitas}</td>
                                <td className="py-1 text-right">{formatRupiah(item.harga_satuan)}</td>
                                <td className="py-1 text-right">{formatRupiah(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* Print Totals */}
                <div className="space-y-1 text-[9px] font-semibold">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatRupiah(transaction.subtotal)}</span>
                    </div>
                    {transaction.diskon > 0 && (
                        <div className="flex justify-between text-gray-700">
                            <span>Diskon:</span>
                            <span>-{formatRupiah(transaction.diskon)}</span>
                        </div>
                    )}
                    {transaction.pajak > 0 && (
                        <div className="flex justify-between text-gray-700">
                            <span>Pajak:</span>
                            <span>{formatRupiah(transaction.pajak)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs font-bold pt-1 border-t border-dashed border-gray-300">
                        <span>TOTAL:</span>
                        <span>{formatRupiah(transaction.total)}</span>
                    </div>

                    <div className="border-t border-dashed border-gray-400 my-2" />

                    {/* Print Method Specifics */}
                    <div className="flex justify-between">
                        <span>Metode:</span>
                        <span className="uppercase">{transaction.metode_pembayaran}</span>
                    </div>
                    {transaction.metode_pembayaran === "cash" && (
                        <>
                            <div className="flex justify-between">
                                <span>Bayar:</span>
                                <span>{formatRupiah(transaction.nominal_bayar || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kembali:</span>
                                <span>{formatRupiah(transaction.kembalian || 0)}</span>
                            </div>
                        </>
                    )}
                    {transaction.metode_pembayaran === "debt" && (
                        <>
                            <div className="flex justify-between">
                                <span>DP Tunai:</span>
                                <span>{formatRupiah(transaction.cash_received || 0)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Hutang:</span>
                                <span>{formatRupiah(transaction.debt_amount || 0)}</span>
                            </div>
                        </>
                    )}
                    {transaction.metode_pembayaran === "card" && (
                        <>
                            <div className="flex justify-between">
                                <span>Kartu:</span>
                                <span className="uppercase">{transaction.jenis_kartu || "Debit"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>No Kartu:</span>
                                <span>**** {transaction.nomor_kartu_akhir || "0000"}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="text-center mt-6 space-y-1">
                    <p className="text-[10px] font-bold">Terima Kasih</p>
                    <p className="text-[8px] text-gray-600">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
                </div>
            </div>

            {/* ─── WEB-VIEW DISPLAY SECTION (Hidden when printing) ─── */}
            <div className="space-y-6 print:hidden">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/transactions")}
                            variant="outline"
                            className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Daftar Transaksi</span>
                                <IconChevronRight size={10} className="stroke-[3]" />
                                <span>Detail Transaksi</span>
                            </div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                                <span>Detail Transaksi: {transaction.nomor_transaksi}</span>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${statusClass}`}
                                >
                                    {statusLabel}
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handlePrint}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-sm shadow-indigo-100 hover:shadow-md transition-all"
                        >
                            <IconPrinter size={16} /> Cetak Struk
                        </Button>
                    </div>
                </div>

                {/* main body grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left side: Cart Items table */}
                    <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
                                <IconReceipt size={16} className="stroke-[2.5]" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-800">Daftar Item</h3>
                                <p className="text-[10px] text-slate-400">Daftar suku cadang atau layanan yang dibeli.</p>
                            </div>
                        </div>

                        <DataTable
                            columns={columns}
                            data={transaction.items}
                            emptyMessage="Tidak ada item dalam transaksi ini."
                            virtualize={false}
                        />
                    </div>

                    {/* Right side: Payment details & Summary cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Cost Breakdown */}
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rincian Biaya</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold tabular-nums">{formatRupiah(transaction.subtotal)}</span>
                                </div>

                                {transaction.diskon > 0 && (
                                    <div className="flex justify-between items-center text-rose-600">
                                        <span className="flex items-center gap-1">
                                            <IconTag size={12} /> Diskon
                                        </span>
                                        <span className="font-bold tabular-nums">-{formatRupiah(transaction.diskon)}</span>
                                    </div>
                                )}

                                {transaction.pajak > 0 && (
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <IconReceiptTax size={12} /> Pajak
                                        </span>
                                        <span className="font-semibold tabular-nums">{formatRupiah(transaction.pajak)}</span>
                                    </div>
                                )}

                                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                                    <span className="font-extrabold text-slate-800 text-sm">Total Akhir</span>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 font-black text-indigo-700 text-sm tabular-nums">
                                        {formatRupiah(transaction.total)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Informasi Pembayaran</h3>

                            <div className="flex items-center gap-2 bg-slate-50/55 p-3 rounded-xl border border-slate-100">
                                {transaction.metode_pembayaran?.toLowerCase() === "cash" ? (
                                    <>
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <IconCash size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-700 uppercase">Tunai (Cash)</div>
                                            <div className="text-[9px] text-slate-400">Dibayar tunai oleh pelanggan</div>
                                        </div>
                                    </>
                                ) : transaction.metode_pembayaran?.toLowerCase() === "card" ? (
                                    <>
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <IconCreditCard size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-700 uppercase">Non-Tunai (Card)</div>
                                            <div className="text-[9px] text-slate-400">Menggunakan Mesin EDC</div>
                                        </div>
                                    </>
                                ) : transaction.metode_pembayaran?.toLowerCase() === "debt" ? (
                                    <>
                                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                            <IconNotebook size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-700 uppercase">Hutang Member</div>
                                            <div className="text-[9px] text-slate-400">Pembayaran Hutang oleh Member</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                            <IconCreditCard size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-700 uppercase">Split Payment</div>
                                            <div className="text-[9px] text-slate-400">Gabungan Tunai &amp; EDC</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-2.5 pt-1 text-xs">
                                {transaction.metode_pembayaran?.toLowerCase() === "cash" && (
                                    <>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Uang Diterima</span>
                                            <span className="font-semibold tabular-nums">{formatRupiah(transaction.nominal_bayar || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Kembalian</span>
                                            <span className="font-bold text-emerald-600 tabular-nums">{formatRupiah(transaction.kembalian || 0)}</span>
                                        </div>
                                    </>
                                )}

                                {transaction.metode_pembayaran?.toLowerCase() === "debt" && (
                                    <>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Uang Muka / DP</span>
                                            <span className="font-semibold tabular-nums">{formatRupiah(transaction.cash_received || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Jumlah Hutang Baru</span>
                                            <span className="font-bold text-rose-600 tabular-nums">{formatRupiah(transaction.debt_amount || 0)}</span>
                                        </div>
                                    </>
                                )}

                                {transaction.metode_pembayaran?.toLowerCase() === "card" && (
                                    <>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Jenis Kartu</span>
                                            <span className="font-bold uppercase text-slate-800">{transaction.jenis_kartu || "-"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Nomor Kartu</span>
                                            <span className="font-semibold tabular-nums text-slate-700">
                                                {transaction.nomor_kartu_akhir ? `**** **** **** ${transaction.nomor_kartu_akhir}` : "-"}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {transaction.metode_pembayaran?.toLowerCase() === "split" && (
                                    // Let's check cash_amount, card_amount if they exist (rendered on backend/DB)
                                    <>
                                        {/* Since split details might not be flat on BaseSale model, let's render what is available */}
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Tunai (Cash Portion)</span>
                                            <span className="font-semibold tabular-nums">
                                                {/* Fallback to calculating cash portion */}
                                                {formatRupiah(transaction.nominal_bayar && transaction.kembalian ? transaction.nominal_bayar - transaction.kembalian - (transaction.total - (transaction.nominal_bayar - transaction.kembalian)) : 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Debit/Kredit (Card Portion)</span>
                                            <span className="font-semibold tabular-nums">
                                                {/* Fallback calculation */}
                                                {formatRupiah(transaction.total - (transaction.nominal_bayar && transaction.kembalian ? transaction.nominal_bayar - transaction.kembalian : 0))}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-slate-600">
                                            <span>Jenis Kartu</span>
                                            <span className="font-bold uppercase text-slate-800">{transaction.jenis_kartu || "-"}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Metadata/Store info */}
                        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border-0 space-y-4 relative overflow-hidden">
                            {/* Glow decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Metadata</h3>

                            <div className="space-y-3.5 text-xs relative z-10">
                                <div className="flex items-start gap-3">
                                    <IconUser size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operator (Kasir)</div>
                                        <div className="font-bold text-slate-100">{transaction.user?.name || "Kasir Utama"}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <IconCalendar size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Waktu Transaksi</div>
                                        <div className="font-semibold text-slate-100">{formattedDate}</div>
                                    </div>
                                </div>

                                {transaction.member && (
                                    <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                                        <IconUser size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Member / Pelanggan</div>
                                            <div className="font-bold text-slate-100">{transaction.member.nama} ({transaction.member.kode})</div>
                                        </div>
                                    </div>
                                )}

                                {transaction.status?.toLowerCase() === "canceled" && (
                                    <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                                        <IconClock size={16} className="text-rose-400 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Di-Void Oleh</div>
                                            <div className="font-bold text-rose-300">
                                                {transaction.voidBy?.name || transaction.void_by?.name || "Admin / Void Operator"}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TransactionDetailPage;
