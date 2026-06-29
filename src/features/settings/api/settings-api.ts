import { api } from "@/lib/api";

export interface AppSetting {
    uid: string;
    key: string;
    value: string | null;
    label: string;
    description: string;
    group_name: string;
    value_type: string;
}

export const settingsApi = {
    getAll: async () => {
        const response = await api.get<{ data: AppSetting[] }>("/v1/settings");
        return response.data;
    },

    getByKey: async (key: string) => {
        const response = await api.get<{ data: AppSetting }>(`/v1/settings/${key}`);
        return response.data;
    },

    update: async (key: string, value: string | null) => {
        const response = await api.put<{ data: AppSetting }>(`/v1/settings/${key}`, { value });
        return response.data;
    }
};
