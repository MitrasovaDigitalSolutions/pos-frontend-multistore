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
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 ease-in-out ${isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div
                className={`relative flex flex-col items-center justify-center p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(5,150,105,0.15)] text-center transition-all duration-300 transform ease-in-out ${isLoading ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
                    }`}
            >
                {/* Double Ring Spinning Animation */}
                <div className="relative w-16 h-16 flex items-center justify-center mb-5">
                    {/* Outer Ring */}
                    <div className="absolute w-16 h-16 rounded-full border-2 border-emerald-500 border-t-transparent border-r-transparent animate-spin" />

                    {/* Inner Ring (rotating in opposite direction) */}
                    <div className="absolute w-11 h-11 rounded-full border-2 border-teal-400 border-b-transparent border-l-transparent animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />

                    {/* Center Glow Dot */}
                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_12px_#34d399] animate-pulse" />
                </div>

                {/* Animated Status Text */}
                <h4 className="text-sm font-bold text-white tracking-wide animate-pulse">
                    Memuat Halaman...
                </h4>

                {/* Top decorative glow */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-10 bg-emerald-500/10 blur-xl rounded-full pointer-events-none" />
            </div>
        </div>
    );
}
