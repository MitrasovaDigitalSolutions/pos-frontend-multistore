import { Suspense } from "react";
import { CashDrawerSessions } from "@/features/cash-drawer-sessions/cash-drawer-sessions";
import { Skeleton } from "@/components/ui/skeleton";

function CashDrawerSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-3.5 w-80" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-28 rounded-xl" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
            </div>

            {/* Content summary grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-6 w-36" />
                    </div>
                ))}
            </div>

            {/* List table */}
            <div className="space-y-4">
                <div className="flex justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-slate-50 last:border-0 dark:border-slate-800">
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminCashDrawerPage() {
    return (
        <Suspense fallback={<CashDrawerSkeleton />}>
            <CashDrawerSessions />
        </Suspense>
    );
}
