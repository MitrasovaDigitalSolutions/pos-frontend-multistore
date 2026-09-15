"use client";

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { TooltipRenderProps } from "react-joyride";
import {
    IconX,
    IconArrowRight,
    IconArrowLeft,
    IconCheck,
    IconSparkles,
    IconCompass,
} from "@tabler/icons-react";

export interface CompactTutorialTooltipProps extends TooltipRenderProps {
    onStop?: () => void;
    overlayNav?: boolean;
    variant?: "tooltip" | "overlay_nav" | "banner";
}

const emptySubscribe = () => () => {};

/**
 * Hook to safely determine client-side mounting without synchronous setState in useEffect
 */
function useIsClient() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
}

/**
 * Standard Compact Tooltip (Floating box near target element)
 */
function StandardTooltipView({
    continuous,
    index,
    isLastStep,
    size,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    handleBack,
    handleClose,
    handlePrimary,
    handleSkip,
    progressPercent,
    tooltipProps,
}: CompactTutorialTooltipProps & {
    handleBack: (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => void;
    handleClose: (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => void;
    handlePrimary: (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => void;
    handleSkip: (e?: React.MouseEvent<HTMLElement>) => void;
    progressPercent: number;
}) {
    return (
        <div
            {...tooltipProps}
            className="w-[300px] sm:w-[330px] max-w-[88vw] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden font-sans text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        >
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
                        title="Tutup Panduan (Esc)"
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
                <div className="flex items-center gap-2">
                    {!isLastStep && (
                        <button
                            {...skipProps}
                            onClick={handleSkip}
                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer px-1 py-0.5"
                        >
                            Lewati
                        </button>
                    )}
                    <span className="hidden sm:inline-block font-mono text-[9px] bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-500">
                        ← / →
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    {index > 0 && (
                        <button
                            {...backProps}
                            onClick={handleBack}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                            title="Kembali ke langkah sebelumnya (Panah Kiri)"
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
                            title={isLastStep ? "Selesaikan panduan (Panah Kanan)" : "Lanjut ke langkah berikutnya (Panah Kanan)"}
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

/**
 * Overlay Navigation View:
 * 1. Note Card floating centered above the highlighted component/dialog
 * 2. "Sebelumnya" (Back) button fixed on the left screen margin
 * 3. "Selanjutnya" (Next) button fixed on the right screen margin
 * Rendered through a React Portal to document.body to bypass Popper / Joyride clipping traps.
 */
function OverlayNavView({
    continuous,
    index,
    isLastStep,
    size,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    handleBack,
    handleClose,
    handlePrimary,
    handleSkip,
    progressPercent,
    tooltipProps,
}: CompactTutorialTooltipProps & {
    handleBack: (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => void;
    handleClose: (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => void;
    handlePrimary: (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => void;
    handleSkip: (e?: React.MouseEvent<HTMLElement>) => void;
    progressPercent: number;
}) {
    const isClient = useIsClient();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Measure and track highlighted element position
    useEffect(() => {
        if (!isClient) return;

        const measure = () => {
            if (!step.target || step.target === "body") {
                setTargetRect(null);
                return;
            }

            const selector = typeof step.target === "string" ? step.target : null;
            if (!selector) {
                setTargetRect(null);
                return;
            }

            try {
                const elements = document.querySelectorAll(selector);
                let visibleEl: HTMLElement | null = null;
                for (const el of Array.from(elements)) {
                    const htmlEl = el as HTMLElement;
                    const r = htmlEl.getBoundingClientRect();
                    if (r.width > 0 && r.height > 0) {
                        visibleEl = htmlEl;
                        break;
                    }
                }
                if (visibleEl) {
                    setTargetRect(visibleEl.getBoundingClientRect());
                } else {
                    setTargetRect(null);
                }
            } catch {
                setTargetRect(null);
            }
        };

        const rafId = requestAnimationFrame(measure);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, true);
        const interval = setInterval(measure, 250);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", measure, true);
            clearInterval(interval);
        };
    }, [isClient, step.target]);

    // Determine Note Card positioning: centered above highlighted component
    const cardPosition = useMemo(() => {
        if (!isClient || typeof window === "undefined") {
            return {
                top: "20px",
                bottom: undefined,
                left: "50%",
                transform: "translateX(-50%)",
                isAbove: false,
            };
        }

        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        let leftPos = "50%";
        let transformStr = "translateX(-50%)";

        // Desktop horizontal positioning centered on highlighted component
        if (targetRect && winWidth >= 640) {
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const halfCardWidth = 230; // 460px / 2
            const minX = halfCardWidth + 24;
            const maxX = winWidth - halfCardWidth - 24;
            const clampedX = Math.max(minX, Math.min(maxX, targetCenterX));
            leftPos = `${clampedX}px`;
            transformStr = "translateX(-50%)";
        }

        // Vertical positioning: above the target when there is room, otherwise below
        // it so the card never covers the highlight (ponytail: ~220px estimated card height)
        if (targetRect) {
            const spaceAbove = targetRect.top;
            const spaceBelow = winHeight - targetRect.bottom;
            if (spaceAbove >= 170) {
                return {
                    top: undefined,
                    bottom: `${winHeight - targetRect.top + 16}px`,
                    left: leftPos,
                    transform: transformStr,
                    isAbove: true,
                };
            }

            if (spaceBelow >= 240) {
                return {
                    top: `${targetRect.bottom + 16}px`,
                    bottom: undefined,
                    left: leftPos,
                    transform: transformStr,
                    isAbove: false,
                };
            }

            // Neither side fits: pin to safe top margin as last resort
            return {
                top: "16px",
                bottom: undefined,
                left: leftPos,
                transform: transformStr,
                isAbove: false,
            };
        }

        // Default top center
        return {
            top: "20px",
            bottom: undefined,
            left: "50%",
            transform: "translateX(-50%)",
            isAbove: false,
        };
    }, [isClient, targetRect]);

    if (!isClient) return null;

    return (
        <>
            {/* Joyride anchor element in Popper tree */}
            <div {...tooltipProps} className="sr-only" aria-hidden="true" />

            {/* Viewport Root Portal */}
            {createPortal(
                <div
                    className="fixed inset-0 pointer-events-none z-[100005]"
                    data-tutorial-mode="overlay-nav"
                >
                    {/* 1. Note Tutorial Card (Ditengah Di Atas Komponen Yang Dihighlight) */}
                    <div
                        className="pointer-events-auto w-[92vw] sm:w-[460px] bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 backdrop-blur-md overflow-hidden font-sans text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-3 duration-200"
                        style={{
                            position: "fixed",
                            top: cardPosition.top,
                            bottom: cardPosition.bottom,
                            left: cardPosition.left,
                            transform: cardPosition.transform,
                            zIndex: 100005,
                        }}
                    >
                        {/* Slim 4px top progress bar */}
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Card Header: step badge, lewati & close */}
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                <IconSparkles size={12} className="text-emerald-600 animate-pulse" />
                                <span>
                                    Langkah {index + 1} / {size}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {!isLastStep && (
                                    <button
                                        {...skipProps}
                                        onClick={handleSkip}
                                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer px-1.5 py-0.5"
                                    >
                                        Lewati
                                    </button>
                                )}
                                <button
                                    {...closeProps}
                                    onClick={handleClose}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Tutup Panduan (Esc)"
                                    aria-label="Tutup"
                                >
                                    <IconX size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        {step.title && (
                            <div className="px-4 pt-1">
                                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                                    {step.title}
                                </h3>
                            </div>
                        )}

                        {/* Content Body */}
                        <div className="px-4 py-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step.content}
                        </div>

                        {/* Micro-footer indicator */}
                        <div className="px-4 py-1.5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                                <IconCompass size={12} className="text-emerald-500" />
                                <span>Gunakan tombol di tepi layar untuk berpindah langkah</span>
                            </span>
                            <span className="hidden sm:inline-block font-mono text-[9px] bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                                ← / → Keyboard
                            </span>
                        </div>

                        {/* Downward indicator arrow pointing at target if card is above */}
                        {cardPosition.isAbove && (
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200/90 dark:border-slate-800 rotate-45 transform pointer-events-none" />
                        )}
                    </div>

                    {/* 2. Tombol Navigasi Sebelumnya (Sisi Kiri Layar) */}
                    {index > 0 && (
                        <button
                            {...backProps}
                            onClick={handleBack}
                            className="fixed left-2.5 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-[100005] pointer-events-auto group flex items-center gap-2.5 p-2 sm:px-4 sm:py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-2xl shadow-slate-900/25 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[44px] min-w-[44px]"
                            title="Kembali ke langkah sebelumnya (Panah Kiri)"
                            aria-label="Kembali ke langkah sebelumnya"
                        >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
                                <IconArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none">
                                    Langkah {index}
                                </div>
                                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                                    Sebelumnya
                                </div>
                            </div>
                        </button>
                    )}

                    {/* 3. Tombol Navigasi Selanjutnya / Selesai (Sisi Kanan Layar) */}
                    {continuous && (
                        <button
                            {...primaryProps}
                            onClick={handlePrimary}
                            className="fixed right-2.5 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-[100005] pointer-events-auto group flex items-center gap-2.5 p-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-2xl shadow-emerald-600/40 hover:shadow-emerald-600/60 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[44px] min-w-[44px]"
                            title={isLastStep ? "Selesaikan panduan (Panah Kanan)" : "Lanjut ke langkah berikutnya (Panah Kanan)"}
                            aria-label={isLastStep ? "Selesai" : "Selanjutnya"}
                        >
                            {/* Pulsing glow indicator */}
                            <span className="absolute -inset-1 rounded-2xl bg-emerald-500/30 animate-pulse pointer-events-none" />

                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 leading-none">
                                    {isLastStep ? "Tuntaskan" : `Langkah ${index + 2}`}
                                </div>
                                <div className="text-xs font-extrabold text-white mt-0.5">
                                    {isLastStep ? "Selesai" : "Selanjutnya"}
                                </div>
                            </div>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                {isLastStep ? (
                                    <IconCheck className="w-5 h-5 text-white" />
                                ) : (
                                    <IconArrowRight className="w-5 h-5 text-white" />
                                )}
                            </div>
                        </button>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}

/**
 * Universal Feature Tutorial Tooltip
 * Supports both Standard Tooltip mode and Overlay Navigation mode (Center Note Card + Screen Edge Buttons).
 * Automatically provides Left/Right arrow and Escape key shortcuts across ALL tooltip modes.
 */
export function CompactTutorialTooltip(props: CompactTutorialTooltipProps) {
    const {
        index,
        isLastStep,
        size,
        step,
        closeProps,
        primaryProps,
        skipProps,
        backProps,
        onStop,
        overlayNav,
        variant,
    } = props;

    // Detect whether overlay navigation mode should be activated
    const isOverlayNav = Boolean(
        overlayNav ||
        variant === "overlay_nav" ||
        step.data?.overlayNav ||
        step.data?.variant === "overlay_nav" ||
        (step as unknown as { overlayNav?: boolean }).overlayNav ||
        (step as unknown as { variant?: string }).variant === "overlay_nav"
    );

    const progressPercent = Math.round(((index + 1) / size) * 100);

    const handleClose = useCallback(
        (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => {
            closeProps.onClick(e as unknown as React.MouseEvent<HTMLElement>);
            onStop?.();
        },
        [closeProps, onStop]
    );

    const handleSkip = useCallback(
        (e?: React.MouseEvent<HTMLElement>) => {
            skipProps.onClick(e as unknown as React.MouseEvent<HTMLElement>);
            onStop?.();
        },
        [skipProps, onStop]
    );

    const handlePrimary = useCallback(
        (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => {
            primaryProps.onClick(e as unknown as React.MouseEvent<HTMLElement>);
            if (isLastStep) {
                onStop?.();
            }
        },
        [primaryProps, isLastStep, onStop]
    );

    const handleBack = useCallback(
        (e?: React.MouseEvent<HTMLElement> | KeyboardEvent) => {
            backProps.onClick(e as unknown as React.MouseEvent<HTMLElement>);
        },
        [backProps]
    );

    // Universal Keyboard Navigation across ALL tutorial steps (ArrowRight = Next, ArrowLeft = Back, Escape = Close)
    // ponytail: capture phase so dialog focus-traps (Radix) that stopPropagation can't swallow arrows
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip only where arrows have irreplaceable native meaning (multiline/select).
            // Single-line inputs stay navigable: tutorial uses auto-fill so manual caret
            // moves are rare, while focus almost always sits inside dialog inputs.
            const el = e.target as HTMLElement | null;
            if (el) {
                if (el.tagName === "TEXTAREA" || el.isContentEditable) return;
                if (el instanceof HTMLSelectElement) return;
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                handlePrimary(e);
            } else if (e.key === "ArrowLeft" && index > 0) {
                e.preventDefault();
                handleBack(e);
            } else if (e.key === "Escape") {
                e.preventDefault();
                handleClose(e);
            }
        };

        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [handlePrimary, handleBack, handleClose, index]);

    const sharedProps = {
        ...props,
        handleBack,
        handleClose,
        handlePrimary,
        handleSkip,
        progressPercent,
    };

    if (isOverlayNav) {
        return <OverlayNavView {...sharedProps} />;
    }

    return <StandardTooltipView {...sharedProps} />;
}
