import { Suspense } from "react";
import { Users } from "@/features/users/users";
import { Skeleton } from "@/components/ui/skeleton";

function UsersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-3 border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Filters Form Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-60 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex justify-between py-2 border-b border-slate-50 last:border-0 dark:border-slate-800">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <Users />
    </Suspense>
  );
}
