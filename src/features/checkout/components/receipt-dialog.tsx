"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { IconCircleCheck, IconPrinter } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Receipt } from "../types";
import { Scrollable } from "@/components/ui/scrollable";
import { useSettingsStore } from "@/stores/settings-store";
import { formatDate } from "@/lib/date-utils";

interface ReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: Receipt | null;
    cashierName: string;
    onNewTransaction: () => void;
    onReprint?: (uid?: string) => void;
}

export function ReceiptDialog({
    open,
    onOpenChange,
    receipt,
    cashierName,
    onNewTransaction,
    onReprint,
}: ReceiptDialogProps) {
    const getSetting = useSettingsStore((state) => state.getSetting);
    const appName = getSetting("app_name", "Mitrasova POS");
    const appAddress = getSetting("app_address", "Indonesia");
    const appPhone = getSetting("app_phone", "");

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                        <IconCircleCheck size={14} />
                    </div>
                    <span>Pembayaran Sukses!</span>
                </div>
            }
            className="max-w-md flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            showCloseButton={false}
        >

            {/* Scrollable Receipt Area (Middle) */}
            <Scrollable className="flex-1 min-h-0 py-2 my-3 border-y border-slate-50">
                <div className="flex flex-col items-center pr-1 w-full">
                    {/* Thermal Receipt */}
                    <div className="w-full max-w-[320px] bg-slate-50/50 border border-slate-200/60 p-5 rounded-xl shadow-inner font-mono text-[10px] text-slate-700 relative">
                        <div className="text-center space-y-0.5 mb-3">
                            <h4 className="font-extrabold text-[11px] text-slate-800 tracking-wider uppercase">
                                {appName}
                            </h4>
                            <p className="text-[9px] text-slate-400">
                                {appAddress}
                            </p>
                            {appPhone && (
                                <p className="text-[8px] text-slate-400 font-bold">
                                    TELP: {appPhone}
                                </p>
                            )}
                        </div>
                        <div className="border-t border-dashed border-slate-300 my-2"></div>

                        <div className="space-y-0.5 text-[9px] text-slate-400">
                            <div className="flex justify-between">
                                <span>Kasir: {cashierName}</span>
                                <span>POS-01</span>
                            </div>
                            <div className="flex justify-between">
                                <span>TRX #{receipt?.uid}</span>
                                <span>
                                    {formatDate(new Date(), "dd/MM/yyyy")}
                                </span>
                            </div>
                            {receipt?.member && (
                                <div className="flex justify-between font-bold text-slate-600">
                                    <span>Member:</span>
                                    <span>{receipt.member.nama} ({receipt.member.kode})</span>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-dashed border-slate-300 my-2"></div>

                        {/* Scrollable Items List inside receipt */}
                        <Scrollable className="max-h-[140px] pr-1">
                            <div className="space-y-1.5 pb-1">
                                {(receipt?.items || []).map((item) => (
                                    <div
                                        key={item.uid}
                                        className="flex justify-between text-[10px] text-slate-600"
                                    >
                                        <span className="truncate max-w-[170px]" title={item.nama_produk}>
                                            {Number(item.kuantitas)}x {item.nama_produk}
                                        </span>
                                        <span className="tabular-nums font-semibold shrink-0">
                                            {formatRupiah(item.harga_satuan * item.kuantitas)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Scrollable>

                        <div className="border-t border-dashed border-slate-300 my-2"></div>

                        <div className="space-y-1 text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="tabular-nums font-semibold">{formatRupiah(receipt?.subtotal ?? 0)}</span>
                            </div>
                            {receipt?.diskon !== undefined && receipt.diskon > 0 && (
                                <div className="flex justify-between text-rose-500 font-medium">
                                    <span>Diskon:</span>
                                    <span className="tabular-nums">-{formatRupiah(receipt.diskon)}</span>
                                </div>
                            )}
                            {receipt?.pajak !== undefined && receipt.pajak > 0 && (
                                <div className="flex justify-between text-slate-650">
                                    <span>Pajak:</span>
                                    <span className="tabular-nums">{formatRupiah(receipt.pajak)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-extrabold text-[11px] text-slate-900 pt-0.5">
                                <span>TOTAL:</span>
                                <span className="tabular-nums">{formatRupiah(receipt?.total ?? 0)}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 my-2"></div>

                        <div className="space-y-1 text-[9px] text-slate-400">
                            {receipt?.metode_pembayaran === "cash" ? (
                                <>
                                    <div className="flex justify-between text-slate-500 font-semibold">
                                        <span>Tunai:</span>
                                        <span className="tabular-nums">{formatRupiah(receipt?.nominal_bayar ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Kembali:</span>
                                        <span className="tabular-nums">{formatRupiah(receipt?.kembalian ?? 0)}</span>
                                    </div>
                                </>
                            ) : receipt?.metode_pembayaran === "debt" ? (
                                <>
                                    {receipt?.card_amount && receipt.card_amount > 0 ? (
                                        <>
                                            <div className="flex justify-between text-slate-500 font-semibold">
                                                <span>DP Tunai:</span>
                                                <span className="tabular-nums">{formatRupiah(receipt?.cash_amount ?? 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500 font-semibold">
                                                <span>DP Transfer:</span>
                                                <span className="tabular-nums">{formatRupiah(receipt.card_amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-[8px] text-slate-400 pl-2">
                                                <span>Kartu: {receipt.jenis_kartu || "Debit"}</span>
                                                <span>**** {receipt.nomor_kartu_akhir || "0000"}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-slate-500 font-semibold">
                                            <span>DP Tunai:</span>
                                            <span className="tabular-nums">{formatRupiah(receipt?.cash_received ?? 0)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-rose-600 font-bold">
                                        <span>Hutang Baru:</span>
                                        <span className="tabular-nums">{formatRupiah(receipt?.debt_amount ?? 0)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between capitalize text-slate-500 font-semibold">
                                    <span>Kartu {receipt?.jenis_kartu}:</span>
                                    <span>**** {receipt?.nomor_kartu_akhir}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-dashed border-slate-300 my-2"></div>
                        <div className="text-center text-[9px] text-slate-400 mt-2.5">
                            <p>Terima Kasih Atas Kunjungan Anda</p>
                        </div>
                    </div>
                </div>
            </Scrollable>

            {/* Action Buttons (Fixed Footer) */}
            <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-slate-100 shrink-0">
                <Button
                    onClick={onNewTransaction}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-lg shadow-emerald-600/10 active:scale-[0.99] transition-all"
                >
                    Transaksi Baru
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        if (receipt?.uid) {
                            if (onReprint) {
                                onReprint(String(receipt.uid));
                            } else {
                                const isOfflineTx = String(receipt.uid).startsWith("OFFLINE-");
                                if (isOfflineTx) {
                                    window.print();
                                } else {
                                    window.open(`/api/proxy/v1/transactions-print/${receipt.uid}`, "_blank");
                                }
                            }
                        }
                    }}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    <IconPrinter size={16} /> Print Struk
                </Button>
            </div>
        </BaseDialog>
    );
}

