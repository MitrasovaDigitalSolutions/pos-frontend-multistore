import { create } from "zustand";
import { settingsApi } from "@/features/settings/api/settings-api";

interface SettingsState {
    settings: Record<string, string | null>;
    isLoading: boolean;
    error: Error | null;
    fetchSettings: () => Promise<void>;
    getSetting: (key: string, defaultValue?: string) => string;
    getTaxRate: () => number;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: {},
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
            set({ settings: settingsMap, isLoading: false });
        } catch (error) {
            set({ error: error as Error, isLoading: false });
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
            return isNaN(parsed) ? 11 : parsed;
        }
        return 11;
    }
}));
