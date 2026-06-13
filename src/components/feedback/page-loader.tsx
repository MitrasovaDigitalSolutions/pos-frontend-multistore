/**
 * Reusable loading spinner — supporting "full" and "compact" variants.
 * Adapts beautifully to dark mode and removes any hardcoded slate backgrounds.
 */
interface PageLoaderProps {
    message?: string;
    variant?: "full" | "compact";
}

export function PageLoader({ message = "Memuat...", variant = "full" }: PageLoaderProps) {
    if (variant === "compact") {
        return (
            <div className="w-full py-6 flex flex-col items-center justify-center text-center bg-transparent">
                <div className="relative flex items-center justify-center w-8 h-8 mb-2">
                    {/* Ring track */}
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 dark:border-emerald-500/20" />
                    {/* Spin indicator */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-600 dark:border-t-emerald-400 border-r-emerald-600/40 dark:border-r-emerald-400/40 animate-spin" />
                </div>
                <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wide animate-pulse">{message}</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-transparent relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

            <div className="relative flex items-center justify-center w-12 h-12 mb-3">
                {/* Ring track */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 dark:border-emerald-500/20" />
                {/* Spin indicator */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-600 dark:border-t-emerald-400 border-r-emerald-600/40 dark:border-r-emerald-400/40 animate-spin" />
                {/* Center Pulse */}
                <div className="w-2.5 h-2.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300 tracking-wide mt-1 animate-pulse">{message}</p>
        </div>
    );
}
