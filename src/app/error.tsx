"use client";

import { useEffect } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        const isChunkError =
            error.message &&
            (error.message.toLowerCase().includes("chunk") ||
                error.message.toLowerCase().includes("loading"));

        if (isChunkError) {
            window.location.reload();
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center space-y-4 max-w-md">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <IconAlertTriangle size={28} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                    Terjadi Kesalahan
                </h2>
                <p className="text-xs text-slate-500">
                    {error.message ||
                        "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi."}
                </p>
                <Button
                    onClick={reset}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl cursor-pointer"
                >
                    Coba Lagi
                </Button>
            </div>
        </div>
    );
}
