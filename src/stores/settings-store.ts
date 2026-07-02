import { create } from "zustand";
import { settingsApi } from "@/features/settings/api/settings-api";

const SETTINGS_CACHE_KEY = "pos_settings_cache";

function loadCachedSettings(): Record<string, string | null> {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveCachedSettings(settings: Record<string, string | null>) {
    try {
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
    } catch {
        // localStorage might be full — non-critical
    }
}

interface SettingsState {
    settings: Record<string, string | null>;
    isLoading: boolean;
    error: Error | null;
    fetchSettings: () => Promise<void>;
    getSetting: (key: string, defaultValue?: string) => string;
    getTaxRate: () => number;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: loadCachedSettings(),
    isLoading: true,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await settingsApi.getAll();
            const settingsMap: Record<string, string | null> = {};
            data.forEach((setting) => {
                settingsMap[setting.key] = setting.value;
            });
            saveCachedSettings(settingsMap);
            set({ settings: settingsMap, isLoading: false });
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

    getTaxRate: () => {
        const value = get().settings["tax_rate_ppn"];
        if (value) {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }
}));

