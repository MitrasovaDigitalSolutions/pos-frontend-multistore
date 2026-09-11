"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { IconX, IconArrowRight, IconArrowLeft, IconCheck, IconSparkles } from "@tabler/icons-react";

export interface CompactTutorialTooltipProps extends TooltipRenderProps {
    onStop?: () => void;
}

export function CompactTutorialTooltip({
    continuous,
    index,
    isLastStep,
    size,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    onStop,
}: CompactTutorialTooltipProps) {
    const progressPercent = Math.round(((index + 1) / size) * 100);

    const handleClose = (e: React.MouseEvent<HTMLElement>) => {
        closeProps.onClick(e);
        onStop?.();
    };

    const handleSkip = (e: React.MouseEvent<HTMLElement>) => {
        skipProps.onClick(e);
        onStop?.();
    };

    const handlePrimary = (e: React.MouseEvent<HTMLElement>) => {
        primaryProps.onClick(e);
        if (isLastStep) {
            onStop?.();
        }
    };

    return (
        <div className="w-[300px] sm:w-[330px] max-w-[88vw] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden font-sans text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Slim 4px top progress bar */}
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Header: step count badge & close button */}
            <div className="px-3.5 pt-3 pb-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                        <IconSparkles size={11} className="text-emerald-600 animate-pulse" />
                        <span>
                            Langkah {index + 1} / {size}
                        </span>
                    </div>

                    <button
                        {...closeProps}
                        onClick={handleClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Tutup Panduan"
                        aria-label="Tutup"
                    >
                        <IconX size={15} />
                    </button>
                </div>

                {/* Title */}
                {step.title && (
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        {step.title}
                    </h3>
                )}
            </div>

            {/* Content Body */}
            <div className="px-3.5 py-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.content}
            </div>

            {/* Footer Navigation */}
            <div className="px-3.5 py-2 mt-1 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                    {!isLastStep && (
                        <button
                            {...skipProps}
                            onClick={handleSkip}
                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer px-1 py-0.5"
                        >
                            Lewati
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {index > 0 && (
                        <button
                            {...backProps}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        >
                            <IconArrowLeft size={13} />
                            <span>Kembali</span>
                        </button>
                    )}

                    {continuous && (
                        <button
                            {...primaryProps}
                            onClick={handlePrimary}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                            {isLastStep ? (
                                <>
                                    <span>Selesai</span>
                                    <IconCheck size={13} />
                                </>
                            ) : (
                                <>
                                    <span>Lanjut</span>
                                    <IconArrowRight size={13} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
