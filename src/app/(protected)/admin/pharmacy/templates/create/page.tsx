"use client";

import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useAppPreset } from "@/features/license/hooks/use-app-preset";
import { TemplateCreatePageView } from "@/features/pharmacy/components/templates/template-create-page-view";

export default function AdminPharmacyTemplatesCreatePage() {
    const { isPharmacy } = useAppPreset();

    if (!isPharmacy) {
        return (
            <AccessDeniedState
                title="Modul Farmasi Tidak Aktif"
                description="Fitur Template Racikan hanya tersedia untuk preset bisnis Apotek / Farmasi."
            />
        );
    }

    return <TemplateCreatePageView />;
}
