"use client";

import { useEffect, useState } from "react";

export interface CountdownTime {
    hours: string;
    minutes: string;
    seconds: string;
    totalSecondsRemaining: number;
    isCountdownFinished: boolean;
}

function calculateCountdown(expiresAt: string | null | undefined): CountdownTime {
    if (!expiresAt) {
        return {
            hours: "00",
            minutes: "00",
            seconds: "00",
            totalSecondsRemaining: 0,
            isCountdownFinished: true,
        };
    }

    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffMs = expiryTime - now;

    if (diffMs <= 0 || Number.isNaN(diffMs)) {
        return {
            hours: "00",
            minutes: "00",
            seconds: "00",
            totalSecondsRemaining: 0,
            isCountdownFinished: true,
        };
    }

    const totalSecondsRemaining = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecondsRemaining / 3600);
    const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
    const seconds = totalSecondsRemaining % 60;

    return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        totalSecondsRemaining,
        isCountdownFinished: false,
    };
}

/**
 * Custom hook untuk menghitung waktu mundur (countdown) secara realtime
 * setiap detik menuju waktu kedaluwarsa `expiresAt`.
 */
export function useLicenseCountdown(expiresAt: string | null | undefined): CountdownTime {
    const [countdown, setCountdown] = useState<CountdownTime>(() => calculateCountdown(expiresAt));

    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const next = calculateCountdown(expiresAt);
            setCountdown(next);
            if (next.isCountdownFinished) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    return countdown;
}
