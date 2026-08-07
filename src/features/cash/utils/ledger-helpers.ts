import {
    IconArrowsExchange,
    IconInbox,
    IconPackage,
    IconReceipt,
    IconRefresh,
    IconShoppingCart,
    IconTruckDelivery,
    IconUserCheck,
    IconWallet,
} from "@tabler/icons-react";
import type { CashLedger } from "../api/cash-api";

export type MovementDirection = "debit" | "credit";

/** Determine whether a ledger item is Debit (Inflow / positive) or Credit (Outflow / negative) */
export function getMovementDirection(movement: CashLedger): MovementDirection {
    const tipe = (movement.tipe || "").toLowerCase();
    if (tipe === "debit" || tipe === "inflow") return "debit";
    if (tipe === "credit" || tipe === "outflow") return "credit";
    return movement.amount >= 0 ? "debit" : "credit";
}

export interface CategoryMeta {
    label: string;
    subLabel?: string;
    icon: typeof IconReceipt;
    colorClass: string;
    iconClass: string;
}

/** Format visual category badge icon, label, and colors */
export function getCategoryMeta(movement: CashLedger): CategoryMeta {
    const kat = (movement.kategori || "").toLowerCase();
    const expense = movement.expense;
    const sale = movement.sale;
    const supplierPayment = movement.supplierPayment || movement.supplier_payment;
    const purchaseReturn = movement.purchaseReturnSettlement || movement.purchase_return_settlement;
    const drawer = movement.cashDrawerMovement || movement.cash_drawer_movement || movement.cashDrawerSession || movement.cash_drawer_session;
    const stock = movement.stockReceiving || movement.stock_receiving;
    const member = movement.memberPayment || movement.member_payment;

    if (expense || kat.includes("expense") || kat.includes("pengeluaran")) {
        return {
            label: "Pengeluaran",
            subLabel: expense?.category?.nama ? `Kat: ${expense.category.nama}` : undefined,
            icon: IconReceipt,
            colorClass: "bg-rose-50 text-rose-700 border-rose-200/80",
            iconClass: "text-rose-600 bg-rose-100",
        };
    }
    if (sale || kat.includes("sale") || kat.includes("penjualan")) {
        return {
            label: "Penjualan POS",
            subLabel: undefined,
            icon: IconShoppingCart,
            colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
            iconClass: "text-emerald-600 bg-emerald-100",
        };
    }
    if (supplierPayment || kat.includes("supplier")) {
        return {
            label: "Bayar Supplier",
            subLabel: supplierPayment?.supplier?.nama ? `Supplier: ${supplierPayment.supplier.nama}` : undefined,
            icon: IconTruckDelivery,
            colorClass: "bg-amber-50 text-amber-700 border-amber-200/80",
            iconClass: "text-amber-600 bg-amber-100",
        };
    }
    if (purchaseReturn || kat.includes("return") || kat.includes("retur")) {
        return {
            label: "Retur Pembelian",
            subLabel: undefined,
            icon: IconRefresh,
            colorClass: "bg-teal-50 text-teal-700 border-teal-200/80",
            iconClass: "text-teal-600 bg-teal-100",
        };
    }
    if (drawer || kat.includes("drawer") || kat.includes("laci")) {
        return {
            label: "Mutasi Laci",
            subLabel: undefined,
            icon: IconInbox,
            colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
            iconClass: "text-indigo-600 bg-indigo-100",
        };
    }
    if (stock || kat.includes("stock") || kat.includes("penerimaan")) {
        return {
            label: "Penerimaan Stok",
            subLabel: undefined,
            icon: IconPackage,
            colorClass: "bg-blue-50 text-blue-700 border-blue-200/80",
            iconClass: "text-blue-600 bg-blue-100",
        };
    }
    if (member || kat.includes("member")) {
        return {
            label: "Bayar Member",
            subLabel: member?.member?.nama ? `Member: ${member.member.nama}` : undefined,
            icon: IconUserCheck,
            colorClass: "bg-purple-50 text-purple-700 border-purple-200/80",
            iconClass: "text-purple-600 bg-purple-100",
        };
    }
    if (movement.tipe === "transfer" || kat.includes("transfer")) {
        return {
            label: "Transfer Kas",
            subLabel: undefined,
            icon: IconArrowsExchange,
            colorClass: "bg-sky-50 text-sky-700 border-sky-200/80",
            iconClass: "text-sky-600 bg-sky-100",
        };
    }

    return {
        label: movement.kategori ? movement.kategori.replace(/_/g, " ").toUpperCase() : "MUTASI KAS",
        subLabel: undefined,
        icon: IconWallet,
        colorClass: "bg-slate-50 text-slate-700 border-slate-200/80",
        iconClass: "text-slate-600 bg-slate-100",
    };
}
