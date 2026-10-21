import type { ComponentType } from "react";
import type { StoreSettingsInput } from "../schemas/settings-schema";

export type SettingsTabId =
    | "profile"
    | "branch_policy"
    | "consignment"
    | "finance"
    | "inventory"
    | "cash"
    | "printer";

export type SettingsCategoryGroup = "store" | "central";

export interface SettingsTabItem {
    id: SettingsTabId;
    label: string;
    description: string;
    icon: ComponentType<{ size?: number; className?: string }>;
    category: SettingsCategoryGroup;
    fields: readonly (keyof StoreSettingsInput)[];
    adminOnly: boolean;
    centralOnly: boolean;
}
