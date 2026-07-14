import { Suspense } from "react";
import { ReceivingItemsPage } from "@/features/purchase/components/receiving/receiving-items-page";
import { Skeleton } from "@/components/ui/skeleton";

function ReceivingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Area Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-3.5 w-80" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* Input Bar / Document Details */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Item scanner and table layout */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4 bg-slate-50/10">
                    <div className="flex justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="flex justify-between pt-1">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminReceivingNewPage() {
    return (
        <Suspense fallback={<ReceivingSkeleton />}>
            <ReceivingItemsPage receivingId="new" />
        </Suspense>
    );
}
