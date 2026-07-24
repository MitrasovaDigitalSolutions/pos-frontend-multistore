import { create } from "zustand";
import { settingsApi, type AppSetting } from "@/features/settings/api/settings-api";

import { useActiveStoreStore } from "@/stores/active-store-store";

const SETTINGS_CACHE_KEY = "pos_settings_cache";

function getCacheKey(): string {
    const storeUid = useActiveStoreStore.getState().activeStoreUid;
    return storeUid ? `${SETTINGS_CACHE_KEY}_${storeUid}` : SETTINGS_CACHE_KEY;
}

function loadCachedSettings(): Record<string, string | null> {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(getCacheKey());
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveCachedSettings(settings: Record<string, string | null>) {
    try {
        localStorage.setItem(getCacheKey(), JSON.stringify(settings));
    } catch {
        // localStorage might be full — non-critical
    }
}

interface SettingsState {
    settings: Record<string, string | null>;
    settingsMeta: Record<string, AppSetting>;
    isLoading: boolean;
    error: Error | null;
    fetchSettings: () => Promise<void>;
    getSetting: (key: string, defaultValue?: string) => string;
    getSettingMeta: (key: string) => AppSetting | undefined;
    getTaxRate: () => number;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: loadCachedSettings(),
    settingsMeta: {},
    isLoading: true,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await settingsApi.getAll();
            const settingsMap: Record<string, string | null> = {};
            const metaMap: Record<string, AppSetting> = {};
            data.forEach((setting) => {
                settingsMap[setting.key] = setting.value;
                metaMap[setting.key] = setting;
            });
            saveCachedSettings(settingsMap);
            set({ settings: settingsMap, settingsMeta: metaMap, isLoading: false });
        } catch (error) {
            // If API fails and we have no settings in memory, restore from cache
            const current = get().settings;
            if (Object.keys(current).length === 0) {
                const cached = loadCachedSettings();
                set({ settings: cached, error: error as Error, isLoading: false });
            } else {
                set({ error: error as Error, isLoading: false });
            }
        }
    },

    getSetting: (key: string, defaultValue = "") => {
        const value = get().settings[key];
        return value !== undefined && value !== null ? value : defaultValue;
    },

    getSettingMeta: (key: string) => {
        return get().settingsMeta[key];
    },

    getTaxRate: () => {
        const value = get().settings["tax_rate_ppn"];
        if (value) {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }
}));

