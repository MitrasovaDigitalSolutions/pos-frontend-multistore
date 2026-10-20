import { Store, Wallet, ShieldCheck, Boxes } from "lucide-react";
import { IconAdjustments, IconPrinter, IconReceiptTax } from "@tabler/icons-react";
import type { SettingsTabItem } from "../types/settings";
import type { StoreSettingsInput } from "../schemas/settings-schema";

export const SETTINGS_TABS: readonly SettingsTabItem[] = [
    // Operasional Toko (Lokal)
    {
        id: "profile",
        label: "Identitas Toko",
        description: "Profil dan logo resmi toko",
        icon: Store,
        category: "store",
        fields: ["app_name", "app_phone", "app_address", "app_logo_url"] as const,
        adminOnly: false,
        centralOnly: false,
    },
    {
        id: "cash",
        label: "Kas & Laci Kasir",
        description: "Pemetaan kasir, kas utama, & bank",
        icon: Wallet,
        category: "store",
        fields: [
            "cash_account_register_uid",
            "cash_account_main_uid",
            "cash_account_bank_uid",
            "cash_in_out_enabled",
        ] as const,
        adminOnly: true,
        centralOnly: false,
    },
    {
        id: "printer",
        label: "Perangkat Printer",
        description: "Pengaturan printer struk kasir",
        icon: IconPrinter,
        category: "store",
        fields: ["printer_id"] as const,
        adminOnly: false,
        centralOnly: false,
    },

    // Kebijakan & Konfigurasi Organisasi (Pusat)
    {
        id: "branch_policy",
        label: "Kebijakan Cabang",
        description: "Hak operasional toko cabang",
        icon: ShieldCheck,
        category: "central",
        fields: [
            "branch_can_create_product",
            "branch_can_edit_product_price",
            "branch_can_edit_master_data",
            "branch_can_manual_stock_adjustment",
            "branch_can_stock_opname",
            "branch_can_direct_purchase",
            "branch_can_transfer_to_other_branch",
            "branch_can_apply_manual_discount",
        ] as const,
        adminOnly: true,
        centralOnly: true,
    },
    {
        id: "consignment",
        label: "Konsinyasi Cabang",
        description: "Perhitungan komisi cabang",
        icon: IconReceiptTax,
        category: "central",
        fields: ["consignment_commission_mode"] as const,
        adminOnly: true,
        centralOnly: true,
    },
    {
        id: "finance",
        label: "Keuangan & Pajak",
        description: "Tarif PPN dan poin loyalitas",
        icon: IconAdjustments,
        category: "central",
        fields: ["tax_rate_ppn", "point_rate", "point_system_enabled"] as const,
        adminOnly: true,
        centralOnly: true,
    },
    {
        id: "inventory",
        label: "Inventori & HPP",
        description: "Metode kalkulasi HPP produk",
        icon: Boxes,
        category: "central",
        fields: ["hpp_adjustment_method"] as const,
        adminOnly: true,
        centralOnly: true,
    },
];

/** Fields strictly restricted to Central Admin */
export const CENTRAL_ONLY_FIELDS: readonly (keyof StoreSettingsInput)[] = [
    "tax_rate_ppn",
    "point_rate",
    "point_system_enabled",
    "hpp_adjustment_method",
    "branch_can_create_product",
    "branch_can_edit_product_price",
    "branch_can_edit_master_data",
    "branch_can_manual_stock_adjustment",
    "branch_can_stock_opname",
    "branch_can_direct_purchase",
    "branch_can_transfer_to_other_branch",
    "branch_can_apply_manual_discount",
    "consignment_commission_mode",
];

/** Fields restricted to Store Admin (whether branch or central) */
export const STORE_ADMIN_ONLY_FIELDS: readonly (keyof StoreSettingsInput)[] = [
    "cash_account_register_uid",
    "cash_account_main_uid",
    "cash_account_bank_uid",
    "cash_in_out_enabled",
];

export const SETTINGS_CATEGORY_LABELS: Record<string, { title: string; subtitle: string }> = {
    store: {
        title: "Toko & Operasional",
        subtitle: "Konfigurasi lokal toko aktif",
    },
    central: {
        title: "Kebijakan & Sistem Pusat",
        subtitle: "Aturan global seluruh cabang",
    },
};
