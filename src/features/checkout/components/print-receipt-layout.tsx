"use client";

import React from "react";
import type { Receipt } from "../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface PrintReceiptLayoutProps {
    receipt: Receipt | null;
    cashierName: string;
}

export function PrintReceiptLayout({ receipt, cashierName }: PrintReceiptLayoutProps) {
    if (!receipt) return null;

    const items = receipt.items || [];
    const isOffline = String(receipt.uid).startsWith("OFFLINE-")

    return (
        <div id="print-receipt-area" className="hidden print:block print:w-[58mm] print:font-mono print:text-[9px] print:leading-tight print:text-black print:bg-white print:p-1 print:m-0">
            <style>{`
                @media print {
                    body {
                        visibility: hidden !important;
                        background: white !important;
                    }
                    #print-receipt-area, #print-receipt-area * {
                        visibility: visible !important;
                    }
                    #print-receipt-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 58mm !important;
                        margin: 0 !important;
                        padding: 2px !important;
                    }
                }
            `}</style>
            {/* Header */}
            <div className="text-center space-y-0.5 mb-2">
                <h4 className="font-extrabold text-[10px] tracking-wider uppercase">
                    MITRA BUANA MOTOR
                </h4>
                <p className="text-[8px]">
                    Jl. Raya Contoh No. 1, Jakarta
                </p>
                <p className="text-[8px] font-bold">
                    TELP: 021-12345678
                </p>
            </div>

            <div className="border-t border-dashed border-black my-1.5" />

            {/* Offline Draft Warning Banner */}
            {isOffline && (
                <div className="text-center font-bold border border-black p-1 mb-2 text-[8px] uppercase">
                    *** OFFLINE DRAFT ***
                    <br />
                    BELUM DISINKRONISASI
                </div>
            )}

            {/* Metadata */}
            <div className="space-y-0.5 text-[8px]">
                <div className="flex justify-between">
                    <span>Kasir: {cashierName}</span>
                    <span>POS-01</span>
                </div>
                <div className="flex justify-between">
                    <span>TRX #{receipt.uid}</span>
                    <span>
                        {new Date().toLocaleDateString("id-ID")} {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
                {receipt.member && (
                    <div className="flex justify-between font-bold">
                        <span>Member:</span>
                        <span>{receipt.member.nama} ({receipt.member.kode})</span>
                    </div>
                )}
            </div>

            <div className="border-t border-dashed border-black my-1.5" />

            {/* Items List */}
            <div className="space-y-1">
                {items.map((item) => (
                    <div key={item.uid} className="space-y-0.5">
                        <div className="flex justify-between">
                            <span>{item.nama_produk}</span>
                        </div>
                        <div className="flex justify-between pl-2">
                            <span>{item.kuantitas} x {formatRupiah(item.harga_satuan)}</span>
                            <span className="tabular-nums font-semibold">
                                {formatRupiah(item.harga_satuan * item.kuantitas)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-dashed border-black my-1.5" />

            {/* Totals */}
            <div className="space-y-0.5">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="tabular-nums">{formatRupiah(receipt.subtotal ?? 0)}</span>
                </div>
                {receipt.diskon !== undefined && receipt.diskon > 0 && (
                    <div className="flex justify-between">
                        <span>Diskon:</span>
                        <span className="tabular-nums">-{formatRupiah(receipt.diskon)}</span>
                    </div>
                )}
                <div className="flex justify-between font-extrabold text-[10px] pt-0.5 border-t border-dotted border-black">
                    <span>TOTAL:</span>
                    <span className="tabular-nums">{formatRupiah(receipt.total ?? 0)}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-black my-1.5" />

            {/* Payment Details */}
            <div className="space-y-0.5 text-[8px]">
                {receipt.metode_pembayaran === "cash" ? (
                    <>
                        <div className="flex justify-between font-semibold">
                            <span>Tunai:</span>
                            <span className="tabular-nums">{formatRupiah(receipt.nominal_bayar ?? 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Kembali:</span>
                            <span className="tabular-nums">{formatRupiah(receipt.kembalian ?? 0)}</span>
                        </div>
                    </>
                ) : receipt.metode_pembayaran === "debt" ? (
                    <>
                        <div className="flex justify-between font-semibold">
                            <span>DP Tunai:</span>
                            <span className="tabular-nums">{formatRupiah(receipt.cash_received ?? 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Hutang Baru:</span>
                            <span className="tabular-nums">{formatRupiah(receipt.debt_amount ?? 0)}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-between capitalize font-semibold">
                        <span>Kartu {receipt.jenis_kartu}:</span>
                        <span>**** {receipt.nomor_kartu_akhir}</span>
                    </div>
                )}
            </div>

            <div className="border-t border-dashed border-black my-1.5" />

            {/* Footer */}
            <div className="text-center text-[8px] mt-2 space-y-0.5">
                <p>Terima Kasih Atas Kunjungan Anda</p>
                <p>Barang yang sudah dibeli</p>
                <p>tidak dapat ditukar/dikembalikan</p>
            </div>
        </div>
    );
}
