"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { IconScan, IconHome, IconLogout, IconWifi, IconCash } from "@tabler/icons-react";

interface CheckoutTopBarProps {
    transactionId: number | null;
    activeDrawerSession: { id: number } | null | undefined;
    hasAccessAdmin: boolean;
    onInfoSesiClick: () => void;
    onLogout: () => void;
    onDashboardClick: () => void;
}

export function CheckoutTopBar({
    transactionId,
    activeDrawerSession,
    hasAccessAdmin,
    onInfoSesiClick,
    onLogout,
    onDashboardClick,
}: CheckoutTopBarProps) {
    return (
        <div className="bg-slate-900 text-white h-12 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
                <IconScan size={20} className="text-emerald-400" />
                <span className="font-bold text-[13px] tracking-wide">
                    MSG POS — Cashier Terminal
                </span>
                {transactionId && (
                    <span className="bg-emerald-700 text-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                        TRX #{transactionId}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={onInfoSesiClick}
                    disabled={!activeDrawerSession}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-350 hover:bg-emerald-950/20 h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-transparent border-none disabled:opacity-40"
                >
                    <IconCash size={15} />
                    <span>Info Laci Kasir</span>
                </Button>
                <div className="w-px h-4 bg-slate-800" />
                
                {hasAccessAdmin && (
                    <>
                        <Button
                            variant="ghost"
                            onClick={onDashboardClick}
                            className="text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                        >
                            <IconHome size={15} />
                            <span>Dashboard Admin</span>
                        </Button>
                        <div className="w-px h-4 bg-slate-800" />
                    </>
                )}
                
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                >
                    <IconLogout size={15} />
                    <span>Logout</span>
                </Button>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <IconWifi size={16} />
                    <span>Sistem Online</span>
                </div>
                <div>Terminal: POS-01</div>
            </div>
        </div>
    );
}
