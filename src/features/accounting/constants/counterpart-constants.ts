import type { ChartOfAccountType } from "../types";

export interface AccountTypeBadgeConfig {
    label: string;
    bg: string;
    text: string;
    border: string;
}

export const ACCOUNT_TYPE_CONFIG: Record<ChartOfAccountType, AccountTypeBadgeConfig> = {
    asset: {
        label: "Aset",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800",
    },
    liability: {
        label: "Kewajiban",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-800",
    },
    equity: {
        label: "Ekuitas",
        bg: "bg-indigo-50 dark:bg-indigo-950/40",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-200 dark:border-indigo-800",
    },
    revenue: {
        label: "Pendapatan",
        bg: "bg-teal-50 dark:bg-teal-950/40",
        text: "text-teal-700 dark:text-teal-300",
        border: "border-teal-200 dark:border-teal-800",
    },
    expense: {
        label: "Beban",
        bg: "bg-rose-50 dark:bg-rose-950/40",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200 dark:border-rose-800",
    },
};
