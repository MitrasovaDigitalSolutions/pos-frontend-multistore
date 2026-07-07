"use client";

import React from "react";
import type { Transaction } from "../../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useSettingsStore } from "@/stores/settings-store";

interface TransactionPrintReceiptProps {
    transaction: Transaction;
    formattedDate: string;
}

export function TransactionPrintReceipt({ transaction, formattedDate }: TransactionPrintReceiptProps) {
    const getSetting = useSettingsStore((state) => state.getSetting);
    const appName = getSetting("app_name", "Mitrasova POS");
    const appAddress = getSetting("app_address", "Indonesia");
    const appPhone = getSetting("app_phone", "(0266) 123456");

    return (
        <div className="hidden print:block w-[76mm] mx-auto text-black p-1 text-[11px] font-mono leading-tight bg-white">
            <div className="text-center space-y-1 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider">{appName}</h2>
                <p className="text-[9px] text-gray-600">{appAddress}</p>
                {appPhone && <p className="text-[9px] text-gray-600">Telp: {appPhone}</p>}
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
                        <tr key={item.uid} className="align-top">
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
                        {transaction.card_amount && transaction.card_amount > 0 ? (
                            <>
                                <div className="flex justify-between">
                                    <span>DP Tunai:</span>
                                    <span>{formatRupiah(transaction.cash_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>DP Transfer:</span>
                                    <span>{formatRupiah(transaction.card_amount)}</span>
                                </div>
                                <div className="flex justify-between text-[8px] pl-2 text-gray-700">
                                    <span>Kartu:</span>
                                    <span className="uppercase">{transaction.jenis_kartu || "Debit"}</span>
                                </div>
                                <div className="flex justify-between text-[8px] pl-2 text-gray-700">
                                    <span>No Kartu:</span>
                                    <span>**** {transaction.nomor_kartu_akhir || "0000"}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between">
                                <span>DP Tunai:</span>
                                <span>{formatRupiah(transaction.cash_received || 0)}</span>
                            </div>
                        )}
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
    );
}
