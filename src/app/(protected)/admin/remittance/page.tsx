import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { AddonGuard } from "@/features/license/components/addon-guard";
import { RemittanceDashboard } from "@/features/remittance/components/remittance-dashboard";

export const metadata: Metadata = {
  title: "Setoran ke Pusat | POS Multi-Store",
  description: "Manajemen setoran nilai pokok penjualan barang titipan konsinyasi ke Gudang Pusat",
};

function RemittanceLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs space-y-3">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-8 w-44 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs space-y-4">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function RemittancePage() {
  return (
    <AddonGuard addon="multi_store">
      <Suspense fallback={<RemittanceLoadingSkeleton />}>
        <RemittanceDashboard />
      </Suspense>
    </AddonGuard>
  );
}
