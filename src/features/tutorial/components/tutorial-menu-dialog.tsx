"use client";

import React from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { useTutorialStore } from "@/stores/tutorial-store";
import { TUTORIAL_LIST } from "../constants/tutorial-constants";
import type { TutorialId } from "../types/tutorial";
import {
    IconHelp,
    IconCashRegister,
    IconShoppingCart,
    IconCreditCard,
    IconPlayerPause,
    IconWifiOff,
    IconReceipt,
    IconArrowRight,
    IconSparkles,
} from "@tabler/icons-react";

const TUTORIAL_ICONS: Record<TutorialId, React.ComponentType<{ size?: number; className?: string }>> = {
    sesi_kasir: IconCashRegister,
    transaksi_kasir: IconShoppingCart,
    hutang_member: IconCreditCard,
    hold_recall_void: IconPlayerPause,
    transaksi_offline: IconWifiOff,
    cetak_ulang_struk: IconReceipt,
};

export function TutorialMenuDialog() {
    const isMenuOpen = useTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = (id: TutorialId) => {
        startTutorial(id);
    };

    return (
        <BaseDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                        <IconHelp size={18} />
                    </div>
                    <div>
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                            Pusat Panduan & Tutorial Kasir
                        </span>
                        <p className="text-xs font-normal text-slate-500">
                            Pilih modul tutorial interaktif untuk melihat simulasi alur kerja secara langsung
                        </p>
                    </div>
                </div>
            }
            className="sm:max-w-3xl"
        >
            <div className="py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {TUTORIAL_LIST.map((item) => {
                        const IconComponent = TUTORIAL_ICONS[item.id] || IconHelp;
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleSelectTutorial(item.id)}
                                className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 cursor-pointer text-left"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleSelectTutorial(item.id);
                                    }
                                }}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2.5">
                                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/80 text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                            <IconComponent size={20} />
                                        </div>

                                        {item.badge ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                                                <IconSparkles size={11} />
                                                {item.badge}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                                        {item.title}
                                    </h4>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                                    <span>{item.stepCount} Langkah Praktis</span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                                        Mulai Demo
                                        <IconArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <p>
                        💡 <strong>Info:</strong> Tutorial ini berjalan dalam mode simulasi interaktif tanpa mengubah data transaksi nyata di toko Anda.
                    </p>
                </div>
            </div>
        </BaseDialog>
    );
}
