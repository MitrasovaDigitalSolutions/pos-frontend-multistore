import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { RemittanceVerifyDashboard } from "@/features/remittance/components/verify/remittance-verify-dashboard";

export const metadata: Metadata = {
  title: "Verifikasi Setoran Cabang | POS Multi-Store",
  description: "Verifikasi mutasi penerimaan dana setoran konsinyasi dari toko cabang ke Gudang Pusat",
};

function RemittanceVerifyLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-52 rounded-lg" />
            <Skeleton className="h-3.5 w-80 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-2">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-7 w-36 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs space-y-4">
        <Skeleton className="h-8 w-60 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function RemittanceVerifyPage() {
  return (
    <Suspense fallback={<RemittanceVerifyLoadingSkeleton />}>
      <RemittanceVerifyDashboard />
    </Suspense>
  );
}
