"use client";

import { usePageLoadingStore } from "@/stores/page-loading-store";
import { useEffect, useState } from "react";

export function PageLoader() {
    const isLoading = usePageLoadingStore((state) => state.isLoading);
    const [visible, setVisible] = useState(false);

    // Synchronize local state with store state to allow smooth transition before unmounting
    useEffect(() => {
        if (isLoading) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVisible(true);
        } else {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 300); // Matches the duration of the transition
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!visible && !isLoading) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/15 dark:bg-black/35 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
                isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div
                className={`relative flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-zinc-900/80 border border-emerald-500/10 dark:border-emerald-500/25 rounded-2xl shadow-[0_20px_50px_rgba(5,150,105,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-center transition-all duration-300 transform ease-in-out backdrop-blur-xl ${
                    isLoading ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
                }`}
            >
                {/* Visual Loader Wrapper */}
                <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                    {/* Glowing ambient blob */}
                    <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-xl animate-pulse" />

                    {/* Outer Dashed Ring (slow rotation) */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 dark:border-emerald-400/20 animate-[spin_8s_linear_infinite]" />

                    {/* Main Spinner */}
                    <div className="absolute w-16 h-16 rounded-full border-2 border-transparent border-t-emerald-600 dark:border-t-emerald-400 border-r-emerald-600/40 dark:border-r-emerald-400/40 animate-spin" />

                    {/* Inner Reverse Spinner */}
                    <div className="absolute w-10 h-10 rounded-full border border-transparent border-b-emerald-500 dark:border-b-emerald-300 border-l-emerald-500/30 dark:border-l-emerald-300/30 animate-[spin_0.8s_linear_infinite] [animation-direction:reverse]" />

                    {/* Center Glow Dot */}
                    <div className="w-3.5 h-3.5 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
                </div>

                {/* Status Text Group */}
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 tracking-wide">
                        Memuat Halaman
                    </h4>
                    <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wide animate-pulse">
                        Mohon tunggu sebentar...
                    </p>
                </div>

                {/* Top decorative glow */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 blur-xl rounded-full pointer-events-none" />
            </div>
        </div>
    );
}
