"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { IconX, IconArrowRight, IconArrowLeft, IconCheck, IconSparkles } from "@tabler/icons-react";
import { useTutorialStore } from "@/stores/tutorial-store";

export function TutorialTooltip({
    continuous,
    index,
    isLastStep,
    size,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
}: TooltipRenderProps) {
    const progressPercent = Math.round(((index + 1) / size) * 100);
    const stopTutorial = useTutorialStore((state) => state.stopTutorial);

    return (
        <div className="w-[340px] sm:w-[380px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden font-sans text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Top progress bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Header */}
            <div className="p-4 sm:p-5 pb-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold tracking-wider uppercase">
                        <IconSparkles size={13} className="animate-pulse" />
                        <span>
                            Langkah {index + 1} / {size}
                        </span>
                    </div>

                    <button
                        {...closeProps}
                        onClick={(e) => {
                            closeProps.onClick(e);
                            stopTutorial();
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Tutup Panduan"
                        aria-label="Tutup"
                    >
                        <IconX size={17} />
                    </button>
                </div>

                {/* Title */}
                {step.title && (
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {step.title}
                    </h3>
                )}
            </div>

            {/* Content Body */}
            <div className="px-4 sm:px-5 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.content}
            </div>

            {/* Footer Navigation */}
            <div className="p-4 sm:p-5 pt-3 mt-2 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                    {!isLastStep && (
                        <button
                            {...skipProps}
                            onClick={(e) => {
                                skipProps.onClick(e);
                                stopTutorial();
                            }}
                            className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline transition-colors px-1 py-1 cursor-pointer"
                        >
                            Lewati
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {index > 0 && (
                        <button
                            {...backProps}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                        >
                            <IconArrowLeft size={14} />
                            <span>Kembali</span>
                        </button>
                    )}

                    {continuous && (
                        <button
                            {...primaryProps}
                            onClick={(e) => {
                                primaryProps.onClick(e);
                                if (isLastStep) {
                                    stopTutorial();
                                }
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                            {isLastStep ? (
                                <>
                                    <span>Selesai</span>
                                    <IconCheck size={14} />
                                </>
                            ) : (
                                <>
                                    <span>Lanjut</span>
                                    <IconArrowRight size={14} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
