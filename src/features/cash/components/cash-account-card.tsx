"use client";

import React from "react";
import {
    IconMinus,
    IconPlus,
    IconWallet,
    IconBuildingBank,
    IconReceipt,
    IconCreditCard
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CashAccount } from "../api/cash-api";

interface CashAccountCardProps {
    account: CashAccount;
    isSelected: boolean;
    onClick: () => void;
    onAction: (account: CashAccount, type: "debit" | "credit") => void;
    canManage: boolean;
}

export const getAccountTypeConfig = (tipe: string, nama: string) => {
    const tipeLower = (tipe || "").toLowerCase();
    const namaLower = (nama || "").toLowerCase();

    if (tipeLower === "bank" || namaLower.includes("bank") || namaLower.includes("rekening")) {
        return {
            type: "bank" as const,
            label: "Bank",
            icon: IconBuildingBank,
            bgClass: "bg-blue-50/40 hover:bg-blue-50/80",
            borderClass: "border-blue-100 hover:border-blue-300/80",
            activeBorderClass: "border-blue-500 ring-blue-500/20",
            badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
            iconContainerClass: "bg-blue-50 text-blue-600 border border-blue-100/50",
            accentBarClass: "bg-blue-500",
            glowShadowClass: "shadow-sm shadow-blue-500/5",
            activeGlowClass: "shadow-md shadow-blue-500/10",
            themeColor: "blue",
        };
    }
    
    if (tipeLower === "register" || namaLower.includes("kasir") || namaLower.includes("laci")) {
        return {
            type: "register" as const,
            label: "Kasir",
            icon: IconReceipt,
            bgClass: "bg-amber-50/40 hover:bg-amber-50/80",
            borderClass: "border-amber-100 hover:border-amber-300/80",
            activeBorderClass: "border-amber-500 ring-amber-500/20",
            badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
            iconContainerClass: "bg-amber-50 text-amber-600 border border-amber-100/50",
            accentBarClass: "bg-amber-500",
            glowShadowClass: "shadow-sm shadow-amber-500/5",
            activeGlowClass: "shadow-md shadow-amber-500/10",
            themeColor: "amber",
        };
    }

    if (tipeLower === "edc" || namaLower.includes("edc") || namaLower.includes("qris") || namaLower.includes("digital") || namaLower.includes("linkaja") || namaLower.includes("gopay") || namaLower.includes("ovo") || namaLower.includes("shopee")) {
        return {
            type: "edc" as const,
            label: "EDC/QRIS",
            icon: IconCreditCard,
            bgClass: "bg-purple-50/40 hover:bg-purple-50/80",
            borderClass: "border-purple-100 hover:border-purple-300/80",
            activeBorderClass: "border-purple-500 ring-purple-500/20",
            badgeClass: "bg-purple-50 text-purple-700 border-purple-100",
            iconContainerClass: "bg-purple-50 text-purple-600 border border-purple-100/50",
            accentBarClass: "bg-purple-500",
            glowShadowClass: "shadow-sm shadow-purple-500/5",
            activeGlowClass: "shadow-md shadow-purple-500/10",
            themeColor: "purple",
        };
    }

    // Default/Fallback is Cash (Kas Utama/Brankas)
    return {
        type: "cash" as const,
        label: "Kas Utama",
        icon: IconWallet,
        bgClass: "bg-emerald-50/40 hover:bg-emerald-50/80",
        borderClass: "border-emerald-100 hover:border-emerald-300/80",
        activeBorderClass: "border-emerald-500 ring-emerald-500/20",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
        iconContainerClass: "bg-emerald-50 text-emerald-600 border border-emerald-100/50",
        accentBarClass: "bg-emerald-500",
        glowShadowClass: "shadow-sm shadow-emerald-500/5",
        activeGlowClass: "shadow-md shadow-emerald-500/10",
        themeColor: "emerald",
    };
};

export function CashAccountCard({
    account,
    isSelected,
    onClick,
    onAction,
    canManage
}: CashAccountCardProps) {
    const config = getAccountTypeConfig(account.tipe, account.nama);
    const CardIcon = config.icon;

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col p-4 gap-3.5 select-none ${
                isSelected
                    ? `${config.activeBorderClass} ${config.activeGlowClass} ring-2 scale-[1.01] z-10 shadow-sm`
                    : `${config.borderClass} ${config.glowShadowClass} hover:shadow-md hover:-translate-y-0.5`
            }`}
        >
            {/* Decorative accent bar */}
            <div className={`w-1 h-full absolute left-0 top-0 ${config.accentBarClass}`} />

            {/* Upper Section: Account details */}
            <div className="flex items-center justify-between gap-2 pl-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 shadow-inner ${config.iconContainerClass}`}>
                        <CardIcon size={16} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 leading-tight">
                        <h4 className="font-extrabold text-slate-800 text-xs truncate" title={account.nama}>
                            {account.nama}
                        </h4>
                        {account.nomor_rekening ? (
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded border border-slate-200/40 inline-block mt-0.5" title={account.nomor_rekening}>
                                {account.nomor_rekening}
                            </span>
                        ) : (
                            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                                {config.type === "register" ? "Laci Kasir Aktif" : "Kas Utama Toko"}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Badge */}
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border shrink-0 ${config.badgeClass}`}>
                    {config.label}
                </span>
            </div>

            {/* Lower Section: Saldo & Buttons */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 pl-1.5">
                <div className="leading-tight">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                        Saldo
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 tracking-tight block">
                        {formatRupiah(account.saldo)}
                    </span>
                </div>

                {canManage && (
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction(account, "debit");
                            }}
                            className="h-7 text-[9px] font-extrabold text-emerald-700 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer flex items-center justify-center gap-1 rounded-lg transition-all duration-200 active:scale-95 px-2.5"
                        >
                            <IconPlus size={10} strokeWidth={3} />
                            In
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction(account, "credit");
                            }}
                            className="h-7 text-[9px] font-extrabold text-rose-700 border-rose-100 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-200 cursor-pointer flex items-center justify-center gap-1 rounded-lg transition-all duration-200 active:scale-95 px-2.5"
                        >
                            <IconMinus size={10} strokeWidth={3} />
                            Out
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
