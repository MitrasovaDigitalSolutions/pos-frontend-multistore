import type { ChartOfAccount, ChartOfAccountType, NormalBalance } from "../types";

export interface NormalBalanceConfig {
    label: string;
    description: string;
    bg: string;
    text: string;
    border: string;
}

export const COA_TYPE_OPTIONS: { value: ChartOfAccountType; label: string }[] = [
    { value: "asset", label: "Aset (Asset)" },
    { value: "liability", label: "Kewajiban / Liabilitas (Liability)" },
    { value: "equity", label: "Ekuitas / Modal (Equity)" },
    { value: "revenue", label: "Pendapatan / Omset (Revenue)" },
    { value: "expense", label: "Beban / Pengeluaran (Expense)" },
];

/**
 * Otomatis menentukan Saldo Normal berdasarkan kaidah akuntansi standar:
 * - Aset & Beban => Debit
 * - Kewajiban, Ekuitas, & Pendapatan => Kredit
 */
export function getNormalBalanceByType(type: ChartOfAccountType): NormalBalance {
    if (type === "asset" || type === "expense") {
        return "debit";
    }
    return "kredit";
}

export const NORMAL_BALANCE_CONFIG: Record<NormalBalance, NormalBalanceConfig> = {
    debit: {
        label: "Debit",
        description: "Bertambah di Debit",
        bg: "bg-blue-50 dark:bg-blue-950/40",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200/80 dark:border-blue-800/60",
    },
    kredit: {
        label: "Kredit",
        description: "Bertambah di Kredit",
        bg: "bg-purple-50 dark:bg-purple-950/40",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200/80 dark:border-purple-800/60",
    },
};

/**
 * Normalisasi satu node CoA untuk memastikan compatibility antara
 * `children_recursive` (response BE terbaru) dan `children` (legacy frontend format).
 */
export function normalizeCoaNode(node: ChartOfAccount): ChartOfAccount {
    const rawChildren = node.children_recursive ?? node.children ?? [];
    const normalizedChildren = Array.isArray(rawChildren)
        ? rawChildren.map(normalizeCoaNode)
        : [];

    return {
        ...node,
        is_postable:
            node.is_postable !== undefined
                ? Boolean(node.is_postable)
                : normalizedChildren.length === 0,
        saldo_normal: node.saldo_normal || getNormalBalanceByType(node.tipe),
        children: normalizedChildren,
        children_recursive: normalizedChildren,
    };
}

/**
 * Normalisasi seluruh hierarki pohon CoA
 */
export function normalizeCoaTree(nodes: ChartOfAccount[]): ChartOfAccount[] {
    if (!Array.isArray(nodes)) return [];
    return nodes.map(normalizeCoaNode);
}

/**
 * Meratakan struktur hierarki pohon CoA menjadi flat list
 */
export function flattenCoaTree(nodes: ChartOfAccount[]): ChartOfAccount[] {
    const result: ChartOfAccount[] = [];
    const traverse = (items: ChartOfAccount[]) => {
        for (const item of items) {
            result.push(item);
            const children = item.children_recursive ?? item.children;
            if (children && children.length > 0) {
                traverse(children);
            }
        }
    };
    traverse(nodes);
    return result;
}
