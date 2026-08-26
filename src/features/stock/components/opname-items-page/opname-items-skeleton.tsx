import { Skeleton } from "@/components/ui/skeleton";
import { IconLoader2, IconPackage } from "@tabler/icons-react";

interface OpnameItemsSkeletonProps {
    message?: string;
}

export function OpnameItemsSkeleton({ message }: OpnameItemsSkeletonProps) {
    return (
        <div className="space-y-4 pb-20 animate-in fade-in duration-300">
            {/* Header Area Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-xl" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-8 w-24 rounded-xl" />
                    <Skeleton className="h-8 w-24 rounded-xl" />
                    <Skeleton className="h-8 w-28 rounded-xl" />
                    <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
            </div>

            {/* Informative Progress Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                        <IconLoader2 size={22} className="animate-spin text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                                {message || "Sedang Memuat Seluruh Data Item Opname..."}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-full animate-pulse">
                                Memproses
                            </span>
                        </div>
                        <p className="text-[11px] text-emerald-700/90 leading-relaxed max-w-xl">
                            Sistem sedang mengambil seluruh katalog produk dan kalkulasi stok sistem dari server backend. Mohon tunggu beberapa detik, tabel akan otomatis tampil setelah seluruh data selesai dimuat.
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                        <div className="space-y-1.5">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-14" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* Scanner Skeleton */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-44" />
                    <Skeleton className="h-3 w-28 hidden sm:block" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Table Skeleton */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <IconPackage size={16} className="text-slate-400" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-8 w-48 rounded-xl" />
                </div>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="flex justify-between bg-slate-50/70 p-3 border-b border-slate-100">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0">
                            <div className="space-y-1">
                                <Skeleton className="h-3.5 w-48" />
                                <Skeleton className="h-2.5 w-24" />
                            </div>
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-3.5 w-12" />
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-7 w-7 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
