import { useState } from "react";
import {
    IconFileInvoice,
    IconPackage,
    IconShieldCheck,
} from "@tabler/icons-react";
import {
    useLicenseStatusQuery,
    useLicenseCatalogQuery,
    useLicenseInvoicesQuery,
} from "../api/license-api";
import { formatDate } from "@/lib/date-utils";

export const LICENSE_TABS = [
    {
        id: "addons",
        label: "Add-on Aktif",
        icon: IconShieldCheck,
    },
    {
        id: "catalog",
        label: "Katalog & Upgrade",
        icon: IconPackage,
    },
    {
        id: "invoices",
        label: "Riwayat Tagihan",
        icon: IconFileInvoice,
    },
] as const;

export type LicenseTabType = (typeof LICENSE_TABS)[number]["id"];

export function useLicenseManagement() {
    const {
        data: status,
        isLoading: statusLoading,
        isError: statusError,
    } = useLicenseStatusQuery();

    const { data: catalog, isLoading: catalogLoading } = useLicenseCatalogQuery();
    const { data: invoices, isLoading: invoicesLoading } = useLicenseInvoicesQuery();

    const [activeTab, setActiveTab] = useState<string>("addons");

    const formattedSync = status?.last_synced_at
        ? formatDate(status.last_synced_at, "d MMM yyyy, HH:mm")
        : null;

    return {
        status,
        catalog: catalog ?? [],
        invoices: invoices ?? [],
        statusLoading,
        catalogLoading,
        invoicesLoading,
        statusError,
        activeTab,
        setActiveTab,
        formattedSync,
        tabs: LICENSE_TABS,
    };
}
