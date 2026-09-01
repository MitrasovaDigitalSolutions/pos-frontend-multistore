import { Suspense } from "react";
import { ProductionPage } from "@/features/production/production";
import { Skeleton } from "@/components/ui/skeleton";

function ProductionPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48 rounded-lg" />
                        <Skeleton className="h-3.5 w-72 rounded-md" />
                    </div>
                </div>
                <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
    );
}

export default function AdminProductionPage() {
    return (
        <Suspense fallback={<ProductionPageSkeleton />}>
            <ProductionPage />
        </Suspense>
    );
}
