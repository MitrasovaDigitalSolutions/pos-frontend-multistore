"use client";

import React from "react";
import { useTutorialStore } from "@/stores/tutorial-store";

export function AnimatedCursor() {
    const cursor = useTutorialStore((state) => state.cursor);
    const isRunning = useTutorialStore((state) => state.isRunning);

    if (!isRunning || !cursor.visible) return null;

    return (
        <div
            className="fixed pointer-events-none z-[999999] transition-transform duration-500 ease-out"
            style={{
                top: 0,
                left: 0,
                transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
            }}
        >
            <div className="relative">
                {/* Click ripple wave */}
                {cursor.clicking && (
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500/40 animate-ping" />
                )}

                {/* Mouse Pointer SVG */}
                <div
                    className={`relative transition-transform duration-150 ${
                        cursor.clicking ? "scale-75 translate-y-0.5" : "scale-100"
                    }`}
                >
                    <svg
                        className="w-7 h-7 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] fill-slate-900 stroke-white"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
                    </svg>

                    {/* Small inner indicator dot */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                {/* Optional floating action badge / label */}
                {cursor.label && (
                    <div className="absolute left-6 -top-1 px-2.5 py-0.5 bg-slate-900/90 backdrop-blur-md text-white border border-slate-700/60 rounded-full text-[11px] font-semibold tracking-wide shadow-xl whitespace-nowrap animate-in fade-in zoom-in duration-200">
                        {cursor.label}
                    </div>
                )}
            </div>
        </div>
    );
}
