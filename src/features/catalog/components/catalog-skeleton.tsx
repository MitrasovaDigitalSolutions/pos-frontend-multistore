import { Skeleton } from "@/components/ui/skeleton";

export function CatalogSkeleton() {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-56 rounded-lg" />
                    <Skeleton className="h-3.5 w-80 rounded-md" />
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Table Skeleton */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {/* Table Header */}
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between gap-4">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                </div>

                {/* Table Rows */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-3.5 flex items-center justify-between gap-4">
                        <Skeleton className="h-4 w-24 rounded" />
                        <div className="space-y-1.5 flex-1 max-w-xs">
                            <Skeleton className="h-4 w-3/4 rounded" />
                            <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                        <Skeleton className="h-4 w-20 rounded" />
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-36 rounded" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-xl" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
