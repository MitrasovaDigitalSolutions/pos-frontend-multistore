import { Skeleton } from "@/components/ui/skeleton";

export function ConsignmentDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header / Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-60 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Summary Card Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <div className="space-y-3 pt-1">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Content Panel Skeleton */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          {/* Segmented Pill Tab Header */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-2.5 sm:p-3">
            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
              <Skeleton className="h-9 w-44 rounded-lg" />
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          </div>

          {/* Tab Content Body (Table Skeleton) */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-48 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
