import { useMemo, useCallback } from "react";
import { useSettingsQuery } from "@/features/settings/api/settings-api";

export interface CashMappingDetail {
    key: string;
    label: string;
    description?: string;
}

export interface AccountMappingInfo {
    isMapped: boolean;
    primaryLabel: string;
    roles: CashMappingDetail[];
    allLabels: string[];
    keys: string[];
}

const DEFAULT_CASH_ROLES: Record<string, { label: string; description: string }> = {
    cash_account_register_uid: {
        label: "Kas Kasir",
        description: "Akun kas default untuk transaksi penjualan tunai dan split kasir.",
    },
    cash_account_main_uid: {
        label: "Kas Utama",
        description: "Akun kas utama penampungan saldo internal dan operasional toko.",
    },
    cash_account_bank_uid: {
        label: "Kas Bank",
        description: "Akun bank default untuk transaksi transfer dan pencatatan perbankan.",
    },
};

export function useCashMapping() {
    const {
        data: settings = [],
        isLoading: isSettingsLoading,
        isFetching: isSettingsFetching,
        refetch: refetchSettings,
    } = useSettingsQuery();

    // Map account UID -> AccountMappingInfo
    const mappingMap = useMemo(() => {
        const map = new Map<string, AccountMappingInfo>();

        settings.forEach((setting) => {
            const key = setting.key || "";
            const isCashKey =
                key in DEFAULT_CASH_ROLES ||
                key.startsWith("cash_account_") ||
                setting.group_name === "cash";

            const accountUid = setting.value;

            if (isCashKey && accountUid && typeof accountUid === "string" && accountUid.trim() !== "") {
                const uid = accountUid.trim();
                const defaultRole = DEFAULT_CASH_ROLES[key];
                const label = setting.label || defaultRole?.label || "Kas Transaksi";
                const description = setting.description || defaultRole?.description || "Akun kas dipakai dalam transaksi toko.";

                const existing = map.get(uid) || {
                    isMapped: true,
                    primaryLabel: label,
                    roles: [],
                    allLabels: [],
                    keys: [],
                };

                existing.roles.push({
                    key,
                    label,
                    description,
                });

                if (!existing.allLabels.includes(label)) {
                    existing.allLabels.push(label);
                }

                if (!existing.keys.includes(key)) {
                    existing.keys.push(key);
                }

                // If it matches a prominent default role, prioritize it as primaryLabel
                if (key === "cash_account_register_uid") {
                    existing.primaryLabel = label;
                } else if (key === "cash_account_main_uid" && existing.primaryLabel === "Kas Transaksi") {
                    existing.primaryLabel = label;
                }

                map.set(uid, existing);
            }
        });

        return map;
    }, [settings]);

    const isAccountMapped = useCallback(
        (accountUid?: string | null): boolean => {
            if (!accountUid) return false;
            return mappingMap.has(accountUid);
        },
        [mappingMap]
    );

    const getAccountMapping = useCallback(
        (accountUid?: string | null): AccountMappingInfo => {
            if (!accountUid || !mappingMap.has(accountUid)) {
                return {
                    isMapped: false,
                    primaryLabel: "",
                    roles: [],
                    allLabels: [],
                    keys: [],
                };
            }
            return mappingMap.get(accountUid)!;
        },
        [mappingMap]
    );

    const mappedAccountsCount = mappingMap.size;

    return {
        settings,
        isSettingsLoading,
        isSettingsFetching,
        refetchSettings,
        isAccountMapped,
        getAccountMapping,
        mappedAccountsCount,
        mappingMap,
    };
}
