"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    ticks?: number[]; // If provided, slider moves smoothly and snaps to closest tick on release
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    showTicks?: boolean;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    (
        {
            className,
            value,
            defaultValue,
            onValueChange,
            ticks,
            min = 0,
            max = 100,
            step = 1,
            disabled = false,
            showTicks = true,
            ...props
        },
        ref
    ) => {
        const trackRef = React.useRef<HTMLDivElement>(null);
        const fillRef = React.useRef<HTMLDivElement>(null);
        const thumbRef = React.useRef<HTMLDivElement>(null);

        const isDraggingRef = React.useRef(false);
        const currentPercentRef = React.useRef(0);
        const rafRef = React.useRef<number | null>(null);
        const [isDraggingState, setIsDraggingState] = React.useState(false);

        // Sort and sanitize ticks if provided
        const safeTicks = React.useMemo(() => {
            if (!ticks || ticks.length === 0) return null;
            return Array.from(new Set(ticks)).sort((a, b) => a - b);
        }, [ticks]);

        const hasTicks = Boolean(safeTicks && safeTicks.length > 0);

        // Current committed value
        const committedValue = value ?? defaultValue ?? (hasTicks && safeTicks ? safeTicks[safeTicks.length - 1] : min);

        // Calculate active percentage based on committed value
        const committedPercent = React.useMemo(() => {
            if (hasTicks && safeTicks) {
                if (safeTicks.length <= 1) return 100;
                let idx = safeTicks.indexOf(committedValue);
                if (idx === -1) {
                    let closestIdx = 0;
                    let minDiff = Math.abs(safeTicks[0] - committedValue);
                    for (let i = 1; i < safeTicks.length; i++) {
                        const diff = Math.abs(safeTicks[i] - committedValue);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestIdx = i;
                        }
                    }
                    idx = closestIdx;
                }
                return (idx / (safeTicks.length - 1)) * 100;
            }
            const range = Math.max(1, max - min);
            return Math.max(0, Math.min(100, ((committedValue - min) / range) * 100));
        }, [hasTicks, safeTicks, committedValue, min, max]);

        // Keep currentPercentRef in sync when not dragging
        React.useEffect(() => {
            if (!isDraggingRef.current) {
                currentPercentRef.current = committedPercent;
                if (fillRef.current) {
                    fillRef.current.style.width = `${committedPercent}%`;
                }
                if (thumbRef.current) {
                    thumbRef.current.style.left = `${committedPercent}%`;
                }
            }
        }, [committedPercent]);

        // Clean up RAF on unmount
        React.useEffect(() => {
            return () => {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
            };
        }, []);

        const getPercentFromPointer = React.useCallback(
            (clientX: number) => {
                if (!trackRef.current) return 0;
                const rect = trackRef.current.getBoundingClientRect();
                if (rect.width <= 0) return 0;
                const raw = (clientX - rect.left) / rect.width;
                return Math.max(0, Math.min(1, raw)) * 100;
            },
            []
        );

        const getNearestValueFromPercent = React.useCallback(
            (percent: number) => {
                if (hasTicks && safeTicks) {
                    if (safeTicks.length <= 1) return safeTicks[0];
                    const fraction = percent / 100;
                    const nearestIdx = Math.round(fraction * (safeTicks.length - 1));
                    const clampedIdx = Math.max(0, Math.min(safeTicks.length - 1, nearestIdx));
                    return safeTicks[clampedIdx];
                }
                const range = max - min;
                const rawValue = min + (percent / 100) * range;
                const steppedValue = Math.round(rawValue / step) * step;
                return Math.max(min, Math.min(max, steppedValue));
            },
            [hasTicks, safeTicks, min, max, step]
        );

        // Hardware-accelerated direct DOM update for 120fps dragging without triggering React re-renders
        const updateDomDirectly = (percent: number) => {
            if (fillRef.current) {
                fillRef.current.style.width = `${percent}%`;
            }
            if (thumbRef.current) {
                thumbRef.current.style.left = `${percent}%`;
            }
        };

        const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();

            const track = trackRef.current;
            if (!track) return;
            track.setPointerCapture(e.pointerId);

            isDraggingRef.current = true;
            setIsDraggingState(true);

            const p = getPercentFromPointer(e.clientX);
            currentPercentRef.current = p;
            updateDomDirectly(p);
        };

        const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current || disabled) return;
            e.preventDefault();
            e.stopPropagation();

            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const p = getPercentFromPointer(e.clientX);
                currentPercentRef.current = p;
                updateDomDirectly(p);
            });
        };

        const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current || disabled) return;
            e.preventDefault();
            e.stopPropagation();

            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            const track = trackRef.current;
            if (track && track.hasPointerCapture(e.pointerId)) {
                track.releasePointerCapture(e.pointerId);
            }

            const p = getPercentFromPointer(e.clientX);
            const finalValue = getNearestValueFromPercent(p);

            isDraggingRef.current = false;
            setIsDraggingState(false);

            onValueChange?.(finalValue);
        };

        const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current) return;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            const track = trackRef.current;
            if (track && track.hasPointerCapture(e.pointerId)) {
                track.releasePointerCapture(e.pointerId);
            }

            isDraggingRef.current = false;
            setIsDraggingState(false);
            updateDomDirectly(committedPercent);
        };

        // Keyboard navigation
        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return;
            if (hasTicks && safeTicks && safeTicks.length > 1) {
                let currentIdx = safeTicks.indexOf(committedValue);
                if (currentIdx === -1) currentIdx = safeTicks.length - 1;

                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const prevIdx = Math.max(0, currentIdx - 1);
                    onValueChange?.(safeTicks[prevIdx]);
                } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const nextIdx = Math.min(safeTicks.length - 1, currentIdx + 1);
                    onValueChange?.(safeTicks[nextIdx]);
                } else if (e.key === "Home") {
                    e.preventDefault();
                    onValueChange?.(safeTicks[0]);
                } else if (e.key === "End") {
                    e.preventDefault();
                    onValueChange?.(safeTicks[safeTicks.length - 1]);
                }
            } else {
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    e.preventDefault();
                    onValueChange?.(Math.max(min, committedValue - step));
                } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    e.preventDefault();
                    onValueChange?.(Math.min(max, committedValue + step));
                }
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex w-full touch-none select-none items-center py-1 cursor-pointer",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                    className
                )}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="slider"
                aria-valuemin={hasTicks && safeTicks ? safeTicks[0] : min}
                aria-valuemax={hasTicks && safeTicks ? safeTicks[safeTicks.length - 1] : max}
                aria-valuenow={committedValue}
                {...props}
            >
                {/* Interactive Track Area */}
                <div
                    ref={trackRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    className="relative w-full h-4 flex items-center"
                >
                    {/* Background Bar */}
                    <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-700">
                        {/* Progress Fill */}
                        <div
                            ref={fillRef}
                            className={cn(
                                "absolute h-full bg-emerald-600 rounded-full",
                                !isDraggingState && "transition-all duration-150 ease-out"
                            )}
                            style={{ width: `${committedPercent}%` }}
                        />
                    </div>

                    {/* Tick Mark Dots */}
                    {showTicks && hasTicks && safeTicks && safeTicks.length > 1 && (
                        <div className="absolute inset-x-0 h-1.5 pointer-events-none flex items-center justify-between px-0.5">
                            {safeTicks.map((_, i) => {
                                const tickPct = (i / (safeTicks.length - 1)) * 100;
                                const isPassed = tickPct <= committedPercent;
                                return (
                                    <div
                                        key={i}
                                        style={{ left: `${tickPct}%` }}
                                        className={cn(
                                            "absolute -translate-x-1/2 size-2 rounded-full border border-white shadow-2xs transition-colors",
                                            isPassed ? "bg-emerald-600" : "bg-slate-300"
                                        )}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Smooth Dragging Thumb */}
                    <div
                        ref={thumbRef}
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3.5 rounded-full border-2 border-emerald-600 bg-white shadow-md transition-shadow hover:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 cursor-grab active:cursor-grabbing",
                            isDraggingState && "scale-120 shadow-lg border-emerald-700 ring-2 ring-emerald-400/40",
                            !isDraggingState && "transition-all duration-150 ease-out"
                        )}
                        style={{ left: `${committedPercent}%` }}
                    />
                </div>
            </div>
        );
    }
);
Slider.displayName = "Slider";
