"use client";

import { useWatch } from "react-hook-form";
import { FormSelect } from "@/components/forms/form-select";
import type { CommandOption } from "@/components/ui/command-select";
import type { CoaMapping } from "@/features/accounting/api/coa-mapping-api";
import { AlertTriangle, PenTool } from "lucide-react";

interface CoaMappingRowProps {
    m: CoaMapping;
    coaOptions: CommandOption[];
    isDirty: boolean;
    isLoadingCoas: boolean;
}

const SLOT_LABELS: Record<string, string> = {
    // Penjualan
    sale_cash: "Kas Tunai — Penjualan",
    sale_card: "Bank / Kartu — Penjualan",
    sale_receivable: "Piutang Usaha — Penjualan Tempo",
    sale_revenue: "Pendapatan Penjualan",
    sale_residual: "Diskon & Selisih Pembayaran",
    sale_vat: "Hutang PPN (Pajak Keluaran)",
    sale_cogs: "Harga Pokok Penjualan (HPP)",
    sale_inventory: "Persediaan Keluar — Terjual",
    // Penerimaan Barang
    receiving_inventory: "Persediaan Masuk — Pembelian",
    receiving_ap: "Hutang Usaha — Pembelian Tempo",
    // Pembayaran Supplier
    payment_ap: "Hutang Usaha — Pelunasan Supplier",
    payment_cash: "Kas Tunai — Bayar Supplier",
    payment_bank: "Bank — Transfer ke Supplier",
    // Pengeluaran / Biaya
    expense_account: "Akun Beban Operasional",
    expense_cash: "Kas Tunai — Bayar Beban",
    expense_bank: "Bank — Transfer Bayar Beban",
    // Piutang Member
    memberpayment_receivable: "Piutang Member — Pelunasan",
    memberpayment_cash: "Kas Tunai — Terima Cicilan Member",
    memberpayment_bank: "Bank — Terima Cicilan Member",
    // Retur Pembelian
    return_ap: "Hutang Usaha — Retur ke Supplier",
    return_inventory: "Persediaan Keluar — Retur Supplier",
    // Kas & Bank Ledger
    cashledger_cash: "Kas Tunai — Mutasi Manual",
    cashledger_bank: "Bank — Mutasi / Transfer Dana",
    // Penyesuaian & Mutasi Stok
    movement_inventory: "Persediaan — Penyesuaian Stok",
    movement_surplus: "Selisih Lebih Stok (Surplus)",
    movement_loss: "Selisih Kurang Stok (Loss / Susut)",
    // Transfer Stok Antar Gudang
    transfer_inventory_out: "Persediaan Keluar — Gudang Pengirim",
    transfer_inventory_in: "Persediaan Masuk — Gudang Penerima",
    transfer_in_transit: "Barang Dalam Perjalanan (In-Transit)",
};

const SLOT_DESCRIPTIONS: Record<string, string> = {
    // Penjualan
    sale_cash: "Menampung penerimaan kas tunai dari transaksi penjualan di kasir.",
    sale_card: "Menampung penerimaan pembayaran via kartu debit, kartu kredit, atau QRIS.",
    sale_receivable: "Mencatat piutang pelanggan pada penjualan kredit/tempo yang belum dilunasi.",
    sale_revenue: "Mencatat nilai pendapatan kotor dari seluruh penjualan produk.",
    sale_residual: "Menampung selisih pembulatan, diskon penjualan, atau potongan harga pada transaksi.",
    sale_vat: "Mencatat kewajiban PPN (Pajak Pertambahan Nilai) yang dipungut dari pelanggan.",
    sale_cogs: "Mencatat Harga Pokok Penjualan (HPP), yaitu biaya perolehan barang yang sudah terjual.",
    sale_inventory: "Mencatat pengurangan persediaan barang dagang saat barang terjual ke pelanggan.",
    // Penerimaan Barang
    receiving_inventory: "Mencatat penambahan persediaan barang dagang saat barang diterima dari supplier.",
    receiving_ap: "Mencatat hutang usaha yang timbul akibat pembelian barang secara kredit/tempo dari supplier.",
    // Pembayaran Supplier
    payment_ap: "Mencatat pengurangan hutang usaha saat melakukan pelunasan pembayaran ke supplier.",
    payment_cash: "Mencatat pengurangan kas tunai untuk membayar hutang supplier secara langsung.",
    payment_bank: "Mencatat pengurangan saldo bank saat melakukan transfer pembayaran ke supplier.",
    // Pengeluaran / Biaya
    expense_account: "Mencatat beban operasional seperti listrik, air, gaji karyawan, sewa, dan biaya lainnya.",
    expense_cash: "Mencatat pengurangan kas tunai untuk membayar pengeluaran operasional.",
    expense_bank: "Mencatat pengurangan saldo bank untuk membayar beban operasional via transfer.",
    // Piutang Member
    memberpayment_receivable: "Mencatat pengurangan piutang member saat member mencicil atau melunasi tagihannya.",
    memberpayment_cash: "Mencatat penerimaan kas tunai dari pembayaran cicilan/pelunasan piutang member.",
    memberpayment_bank: "Mencatat penerimaan via bank dari pembayaran cicilan/pelunasan piutang member.",
    // Retur Pembelian
    return_ap: "Mencatat pengurangan hutang usaha akibat pengembalian barang yang diretur ke supplier.",
    return_inventory: "Mencatat pengurangan persediaan saat barang diretur dan dikirim kembali ke supplier.",
    // Kas & Bank Ledger
    cashledger_cash: "Akun kas tunai yang digunakan untuk mencatat mutasi kas manual (setoran, penarikan, transfer).",
    cashledger_bank: "Akun bank yang digunakan untuk mencatat mutasi dana manual atau pemindahbukuan antar rekening.",
    // Penyesuaian & Mutasi Stok
    movement_inventory: "Akun persediaan barang dagang yang disesuaikan saat dilakukan stock opname atau koreksi stok.",
    movement_surplus: "Mencatat keuntungan selisih lebih stok (barang lebih banyak dari catatan) saat stock opname.",
    movement_loss: "Mencatat kerugian selisih kurang stok (barang hilang, rusak, atau susut) saat stock opname.",
    // Transfer Stok Antar Gudang
    transfer_inventory_out: "Mencatat pengurangan persediaan di gudang pengirim saat stok ditransfer ke gudang lain.",
    transfer_inventory_in: "Mencatat penambahan persediaan di gudang penerima saat stok diterima dari gudang lain.",
    transfer_in_transit: "Akun perantara untuk stok yang sedang dalam perjalanan antar gudang (belum diterima).",
};

export function CoaMappingRow({
    m,
    coaOptions,
    isDirty,
    isLoadingCoas,
}: CoaMappingRowProps) {
    const fieldName = `${m.transaction_type}:${m.slot}`;
    
    // Watch current form value to check if it's unconfigured
    const currentValue = useWatch({ name: fieldName });
    const isUnconfigured = !currentValue;

    const label = SLOT_LABELS[m.slot] ?? m.slot;
    const description = SLOT_DESCRIPTIONS[m.slot] ?? "Pemetaan akun untuk transaksi terkait.";

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] items-center gap-4 py-4 px-2 rounded-xl transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-b border-slate-100 last:border-0 dark:border-slate-800/60">
            <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {label}
                    </span>
                    <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {m.slot}
                    </code>
                    
                    {/* Visual Status Badges */}
                    {isDirty && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-500/20 shadow-sm animate-pulse">
                            <PenTool className="h-3 w-3" />
                            Diubah
                        </span>
                    )}
                    {isUnconfigured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-200/50 dark:border-rose-500/20 shadow-sm">
                            <AlertTriangle className="h-3 w-3 animate-bounce" style={{ animationDuration: "2s" }} />
                            Belum Diatur
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {description}
                </p>
            </div>
            
            <div className="w-full">
                <FormSelect
                    name={fieldName}
                    options={coaOptions}
                    placeholder="Pilih Akun COA..."
                    searchPlaceholder="Cari berdasarkan kode atau nama..."
                    emptyMessage="Akun COA tidak ditemukan."
                    isLoading={isLoadingCoas}
                    wrapperClassName="w-full"
                    className="w-full dark:bg-slate-900"
                />
            </div>
        </div>
    );
}
