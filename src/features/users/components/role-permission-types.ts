import { Permission } from "../types";

export interface PermissionCategoryType {
    id: string;
    label: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    colorClass: string;
    permissions: string[];
    items: Permission[];
}
