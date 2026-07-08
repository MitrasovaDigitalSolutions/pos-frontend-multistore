"use client";

import { usePageLoadingStore } from "@/stores/page-loading-store";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageLoader() {
    const isLoading = usePageLoadingStore((state) => state.isLoading);
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    // Compute dynamic text hints that change depending on progress during render
    let loadingHint = "Memulai...";
    if (progress < 25) {
        loadingHint = "Menghubungkan ke server...";
    } else if (progress < 55) {
        loadingHint = "Memuat data transaksi...";
    } else if (progress < 75) {
        loadingHint = "Menyiapkan antarmuka...";
    } else if (progress < 95) {
        loadingHint = "Menyinkronkan status...";
    } else if (progress >= 95) {
        loadingHint = "Hampir selesai...";
    }

    // Handle progress simulation
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isLoading) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVisible(true);
            setProgress(0);

            const runSimulation = () => {
                setProgress((prev) => {
                    if (prev >= 98) return 98; // Hold at 98% until loading finishes

                    // Asymptotic behavior: increment slower as it gets closer to 98%
                    const remaining = 98 - prev;
                    const increment = Math.max(0.2, remaining * 0.07 + Math.random() * 0.8);
                    const next = prev + increment;

                    return next >= 98 ? 98 : next;
                });

                // Random interval for a natural fluid pacing feel (80ms - 200ms)
                const nextDelay = 80 + Math.random() * 120;
                timer = setTimeout(runSimulation, nextDelay);
            };

            timer = setTimeout(runSimulation, 50);
        } else {
            // When isLoading becomes false, fast forward to 100%
            const completeProgress = () => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        // Keep 100% visible briefly so the user sees the complete fluid fill
                        setTimeout(() => {
                            setVisible(false);
                        }, 400);
                        return 100;
                    }

                    // Increment quickly to 100
                    const next = prev + Math.max(12, (100 - prev) * 0.5);
                    timer = setTimeout(completeProgress, 30);
                    return next >= 100 ? 100 : next;
                });
            };

            timer = setTimeout(completeProgress, 20);
        }

        return () => clearTimeout(timer);
    }, [isLoading]);

    if (!visible && !isLoading) return null;

    // Format progress integer for clean display
    const progressInt = Math.round(progress);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/10 dark:bg-black/35 backdrop-blur-md"
                >
                    {/* SVG filter for gooey/liquid effect */}
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="absolute w-0 h-0 invisible">
                        <defs>
                            <filter id="gooey-liquid">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                            </filter>
                        </defs>
                    </svg>

                    {/* Loader Card Layout (Frosted Glass Card) */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 220 }}
                        className="flex flex-col items-center justify-center p-8 bg-white/40 dark:bg-zinc-950/40 border border-white/20 dark:border-zinc-800/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl w-[280px]"
                    >
                        {/* Gooey Liquid Container */}
                        <div className="relative w-24 h-24 flex items-center justify-center overflow-visible">

                            {/* Liquid gooey blobs (Rendered inside filtered layer) */}
                            <div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                style={{ filter: "url(#gooey-liquid)" }}
                            >
                                {/* Center Main Blob */}
                                <motion.div
                                    className="absolute rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500"
                                    style={{ width: 84, height: 84 }}
                                    animate={{
                                        scale: [1, 1.05, 0.95, 1],
                                        rotate: [0, 360],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />

                                {/* Orbiting Blob 1 */}
                                <motion.div
                                    className="absolute rounded-full bg-emerald-400 dark:bg-emerald-500"
                                    style={{ width: 24, height: 24 }}
                                    animate={{
                                        x: [0, -55, 0, 55, 0],
                                        y: [0, 20, 0, -20, 0],
                                        scale: [1, 0.9, 1.1, 0.8, 1],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />

                                {/* Orbiting Blob 2 */}
                                <motion.div
                                    className="absolute rounded-full bg-teal-400 dark:bg-teal-500"
                                    style={{ width: 18, height: 18 }}
                                    animate={{
                                        x: [0, 40, 0, -40, 0],
                                        y: [0, -50, 0, 50, 0],
                                        scale: [1, 1.1, 0.8, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />

                                {/* Orbiting Blob 3 */}
                                <motion.div
                                    className="absolute rounded-full bg-cyan-400 dark:bg-cyan-500"
                                    style={{ width: 14, height: 14 }}
                                    animate={{
                                        x: [0, -35, -60, -35, 0],
                                        y: [0, -45, -15, 35, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            </div>

                            {/* Crisp Text Overlay (Bypasses gooey filter to prevent blur) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <span className="text-2xl font-black tracking-tight text-white select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                    {progressInt}%
                                </span>
                            </div>
                        </div>

                        {/* Status Label and Hint Text */}
                        <div className="space-y-1 text-center mt-4">
                            <h4 className="text-xs font-black text-neutral-800 dark:text-neutral-100 tracking-wider uppercase">
                                Memuat Halaman
                            </h4>
                            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wide min-h-[16px] transition-all duration-200">
                                {loadingHint}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
