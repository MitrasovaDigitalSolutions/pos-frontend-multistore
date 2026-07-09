"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useManualJournalDetail } from "../../api/manual-journal-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface JournalDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    journalId: number | null;
}

export function JournalDetailDialog({
    open,
    onOpenChange,
    journalId,
}: JournalDetailDialogProps) {
    const { data: journal, isLoading, error } = useManualJournalDetail(
        journalId ? String(journalId) : null
    );

    const statusBadgeStyles: Record<string, string> = {
        draft: "bg-slate-100 text-slate-700 border-slate-200",
        posted: "bg-emerald-50 text-emerald-700 border-emerald-200",
        voided: "bg-rose-50 text-rose-700 border-rose-200",
    };

    const statusLabelMap: Record<string, string> = {
        draft: "Draft",
        posted: "Posted",
        voided: "Voided (Batal)",
    };

    // Calculate totals
    const totalDebit = journal?.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
    const totalCredit = journal?.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                isLoading
                    ? "Memuat Detail Jurnal..."
                    : `Detail Jurnal Manual: ${journal?.reference_number || ""}`
            }
            className="w-full max-w-4xl"
            scrollable={true}
        >
            {isLoading ? (
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-16 bg-slate-100" />
                                <Skeleton className="h-5 w-28 bg-slate-100" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-28 w-full bg-slate-100 rounded-xl" />
                </div>
            ) : error ? (
                <div className="p-6 text-center text-rose-500 font-bold text-xs">
                    Gagal memuat detail jurnal manual. Silakan coba lagi.
                </div>
            ) : journal ? (
                <div className="space-y-6 py-2">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                No. Referensi
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-800">
                                {journal.reference_number}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Tanggal Transaksi
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                                {format(new Date(journal.transaction_date), "dd MMMM yyyy", {
                                    locale: localeId,
                                })}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Pembuat
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                                {journal.creator?.name || journal.creator?.username || "-"}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Status
                            </span>
                            <Badge
                                className={`${
                                    statusBadgeStyles[journal.status]
                                } px-2 py-0.5 border text-[10px] font-semibold`}
                                variant="outline"
                            >
                                {statusLabelMap[journal.status]}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-1 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Keterangan Utama
                        </span>
                        <p className="text-xs text-slate-700 bg-slate-50/20 border border-slate-100/50 p-3 rounded-lg leading-relaxed">
                            {journal.description || "-"}
                        </p>
                    </div>

                    {/* Lines Table */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
                            Rincian Transaksi Jurnal (Entri Ledger)
                        </span>
                        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4 w-1/4">Akun</th>
                                        <th className="py-3 px-4 w-5/12">Keterangan Baris</th>
                                        <th className="py-3 px-4 w-2/12 text-right">Debit</th>
                                        <th className="py-3 px-4 w-2/12 text-right">Kredit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {journal.lines?.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-[11px] font-bold text-slate-800">
                                                        [{line.account?.kode || "-"}]
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                        {line.account?.nama || "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-slate-700 leading-normal">
                                                {line.description}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono font-bold text-xs tabular-nums text-emerald-600">
                                                {line.debit > 0 ? formatRupiah(line.debit) : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono font-bold text-xs tabular-nums text-rose-600">
                                                {line.credit > 0 ? formatRupiah(line.credit) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 font-bold border-t border-slate-100">
                                        <td colSpan={2} className="py-3.5 px-4 text-xs font-bold text-slate-700 text-right">
                                            TOTAL
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums text-emerald-600">
                                            {formatRupiah(totalDebit)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums text-rose-600">
                                            {formatRupiah(totalCredit)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-50">
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs h-9 rounded-xl px-4 cursor-pointer"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            ) : null}
        </BaseDialog>
    );
}
