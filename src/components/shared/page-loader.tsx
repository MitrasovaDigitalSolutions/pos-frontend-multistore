"use client";

import { usePageLoadingStore } from "@/stores/page-loading-store";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageLoader() {
    const isLoading = usePageLoadingStore((state) => state.isLoading);
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    // Compute dynamic text hints based on progress
    let loadingHint = "Memulai...";
    if (progress < 25) {
        loadingHint = "Menghubungkan ke server...";
    } else if (progress < 55) {
        loadingHint = "Memuat data...";
    } else if (progress < 75) {
        loadingHint = "Menyiapkan antarmuka...";
    } else if (progress < 95) {
        loadingHint = "Menyinkronkan status...";
    } else {
        loadingHint = "Hampir selesai...";
    }

    // Handle progress simulation with optimized interval
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isLoading) {
            const startTimer = setTimeout(() => {
                setVisible(true);
                setProgress(0);
            }, 0);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(interval);
                        return 95;
                    }
                    const remaining = 95 - prev;
                    const increment = Math.max(0.8, remaining * 0.1);
                    const next = prev + increment;
                    return next >= 95 ? 95 : next;
                });
            }, 100);

            return () => {
                clearTimeout(startTimer);
                clearInterval(interval);
            };
        } else {
            // Fast forward progress to 100% when loading completes
            const finishTimer = setTimeout(() => {
                setProgress(100);
            }, 0);

            timer = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);

            return () => {
                clearTimeout(finishTimer);
                clearTimeout(timer);
            };
        }

    }, [isLoading]);

    if (!visible && !isLoading) return null;

    const progressInt = Math.round(progress);

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-[9999] pointer-events-auto">
                    {/* Top Progress Bar Line */}
                    <div className="fixed top-0 left-0 right-0 z-[10000] h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Lightweight Screen Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-0 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-[2px]"
                    >
                        {/* High-Performance Center Loader Card */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl dark:shadow-2xl/60 w-[240px] text-center"
                        >
                            {/* Hardware-Accelerated Dual-Ring Spinner */}
                            <div className="relative w-16 h-16 flex items-center justify-center my-1">
                                {/* Outer Ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/15 dark:border-emerald-500/20" />
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin" />

                                {/* Inner Ring (Reverse spin) */}
                                <div className="absolute inset-2 rounded-full border-2 border-teal-500/15 dark:border-teal-500/20" />
                                <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-teal-400 animate-[spin_1.5s_linear_infinite_reverse]" />

                                {/* Center Progress Percentage */}
                                <span className="text-xs font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono select-none">
                                    {progressInt}%
                                </span>
                            </div>

                            {/* Label & Status Hint */}
                            <div className="space-y-0.5 mt-3">
                                <h4 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200 tracking-wider uppercase">
                                    Memuat Halaman
                                </h4>
                                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide min-h-[14px] transition-all duration-200">
                                    {loadingHint}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

