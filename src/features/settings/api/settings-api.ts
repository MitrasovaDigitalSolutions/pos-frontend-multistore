import { apiGet, apiPost } from "@/shared/api/api-client";

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

    update: async (key: string, value: string | File | null) => {
        if (value instanceof File) {
            const formData = new FormData();
            formData.append("value", value);
            const response = await apiPost<{ data: AppSetting }>(`/v1/settings/${key}`, formData);
            return response.data;
        }

        const response = await apiPost<{ data: AppSetting }>(`/v1/settings/${key}`, { value });
        return response.data;
    }
};
