"use client";

import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useAppPreset } from "@/features/license/hooks/use-app-preset";
import { TemplateListTable } from "@/features/pharmacy/components/templates/template-list-table";

export default function AdminPharmacyTemplatesPage() {
    const { isPharmacy } = useAppPreset();

    if (!isPharmacy) {
        return (
            <AccessDeniedState
                title="Modul Farmasi Tidak Aktif"
                description="Fitur Template Racikan hanya tersedia untuk preset bisnis Apotek / Farmasi."
            />
        );
    }

    return (
        <div className="space-y-4">
            <TemplateListTable />
        </div>
    );
}

