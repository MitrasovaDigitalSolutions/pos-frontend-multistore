"use client";

import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useAppPreset } from "@/features/license/hooks/use-app-preset";
import { HistoryListTable } from "@/features/pharmacy/components/history/history-list-table";

export default function AdminPharmacyHistoryPage() {
    const { isPharmacy } = useAppPreset();

    if (!isPharmacy) {
        return (
            <AccessDeniedState
                title="Modul Farmasi Tidak Aktif"
                description="Fitur Riwayat Racikan hanya tersedia untuk preset bisnis Apotek / Farmasi."
            />
        );
    }

    return (
        <div className="space-y-4">
            <HistoryListTable />
        </div>
    );
}

