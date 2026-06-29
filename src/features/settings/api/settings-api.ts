import { apiGet, apiPut } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";

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
        const response = await apiGet<{ data: AppSetting[] }>("/v1/settings");
        return response.data;
    },

    getByKey: async (key: string) => {
        const response = await apiGet<{ data: AppSetting }>(`/v1/settings/${key}`);
        return response.data;
    },

    update: async (key: string, value: string | null) => {
        const response = await apiPut<{ data: AppSetting }>(`/v1/settings/${key}`, { value });
        return response.data;
    }
};
