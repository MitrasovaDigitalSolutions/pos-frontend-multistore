"use client";

import { Card } from "@/components/ui/card";
import { IconBuildingStore } from "@tabler/icons-react";
import { CentralStoresComparisonTable } from "./central-stores-comparison-table";
import type { CentralStoresComparisonData } from "../../types/central-reports-types";

interface CentralStoresComparisonTabProps {
    data?: CentralStoresComparisonData;
    isLoading: boolean;
}

export function CentralStoresComparisonTab({
    data,
    isLoading,
}: CentralStoresComparisonTabProps) {
    return (
        <Card className="bg-white border-slate-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <IconBuildingStore size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Perbandingan Kinerja Antar Cabang Toko
                        </h3>
                        <p className="text-[11px] text-slate-400">
                            Matriks KPI Penjualan, Laba Rugi, dan Valuasi Stok per Cabang
                        </p>
                    </div>
                </div>
            </div>

            <CentralStoresComparisonTable
                stores={data?.stores || []}
                totals={data?.totals}
                isLoading={isLoading}
            />
        </Card>
    );
}
