"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconCircleCheck, IconPrinter } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Receipt } from "../types";

interface ReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: Receipt | null;
    cashierName: string;
    onNewTransaction: () => void;
}

export function ReceiptDialog({
    open,
    onOpenChange,
    receipt,
    cashierName,
    onNewTransaction,
}: ReceiptDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-95 bg-white rounded-2xl border-slate-100 p-6 flex flex-col items-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 animate-bounce">
                    <IconCircleCheck size={28} />
                </div>
                <DialogTitle className="text-base font-bold text-slate-900">
                    Pembayaran Sukses!
                </DialogTitle>
                <p className="text-[11px] text-slate-400 mt-0.5 text-center">
                    Transaksi tercatat dan stok telah diperbarui.
                </p>

                {/* Thermal Receipt */}
                <div className="w-full max-w-[320px] bg-white border border-slate-200 p-5 mt-4 rounded shadow-inner font-mono text-[11px] text-slate-800 relative">
                    <div className="text-center space-y-0.5 mb-4">
                        <h4 className="font-extrabold text-[12px]">
                            GROCERYMART
                        </h4>
                        <p className="text-[10px]">
                            Jl. Raya Contoh No. 1, Jakarta
                        </p>
                    </div>
                    <div className="border-t border-dashed border-slate-300 my-2"></div>
                    <div className="space-y-0.5 text-[9px] text-slate-500">
                        <div className="flex justify-between">
                            <span>Kasir: {cashierName}</span>
                            <span>POS-01</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TRX #{receipt?.id}</span>
                            <span>
                                {new Date().toLocaleDateString("id-ID")}
                            </span>
                        </div>
                    </div>
                    <div className="border-t border-dashed border-slate-300 my-2"></div>
                    <div className="space-y-1.5">
                        {(receipt?.items || []).map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between text-[10px]"
                            >
                                <span>
                                    {item.kuantitas}x{" "}
                                    {String(item.nama_produk).substring(0, 16)}
                                </span>
                                <span>
                                    {formatRupiah(
                                        item.harga_satuan * item.kuantitas,
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-dashed border-slate-300 my-2"></div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatRupiah(receipt?.subtotal ?? 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>PPN (11%):</span>
                            <span>{formatRupiah(receipt?.pajak ?? 0)}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-[12px] text-slate-900">
                            <span>TOTAL:</span>
                            <span>{formatRupiah(receipt?.total ?? 0)}</span>
                        </div>
                    </div>
                    <div className="border-t border-dashed border-slate-300 my-2"></div>
                    <div className="space-y-1 text-[10px]">
                        {receipt?.metode_pembayaran === "cash" ? (
                            <>
                                <div className="flex justify-between">
                                    <span>Tunai:</span>
                                    <span>
                                        {formatRupiah(
                                            receipt?.nominal_bayar ?? 0,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kembali:</span>
                                    <span>
                                        {formatRupiah(receipt?.kembalian ?? 0)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between capitalize">
                                <span>Kartu {receipt?.jenis_kartu}:</span>
                                <span>**** {receipt?.nomor_kartu_akhir}</span>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-dashed border-slate-300 my-2"></div>
                    <div className="text-center text-[9px] text-slate-400 mt-3">
                        <p>Terima Kasih Atas Kunjungan Anda</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                    <Button
                        onClick={onNewTransaction}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl flex gap-1.5 cursor-pointer border-none"
                    >
                        Transaksi Baru
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="border-slate-200 text-slate-700 font-bold text-xs h-10 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPrinter size={16} /> Print Ulang
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
