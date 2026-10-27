import { Skeleton } from "@/components/ui/skeleton";

export function POPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-72" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    {/* Header card skeleton */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 rounded-xl" />
                            <Skeleton className="h-10 rounded-xl" />
                        </div>
                        <Skeleton className="h-10 rounded-xl" />
                    </div>

                    {/* Scanner skeleton */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5">
                        <Skeleton className="h-10 rounded-xl" />
                    </div>

                    {/* Table skeleton */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-44 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
