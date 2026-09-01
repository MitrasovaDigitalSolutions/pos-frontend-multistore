import { Suspense } from "react";
import { ProductionCreatePage } from "@/features/production/components/create/production-create-page";
import { Skeleton } from "@/components/ui/skeleton";

function ProductionCreateSkeleton() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-3.5">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-48 rounded-lg" />
                        <Skeleton className="h-3 w-64 rounded-md" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs space-y-4">
                        <Skeleton className="h-4 w-36 rounded-md" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs space-y-4">
                        <Skeleton className="h-4 w-40 rounded-md" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                    </div>
                </div>
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs space-y-4">
                    <Skeleton className="h-5 w-32 rounded-md" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export default function AdminProductionCreatePage() {
    return (
        <Suspense fallback={<ProductionCreateSkeleton />}>
            <ProductionCreatePage />
        </Suspense>
    );
}
