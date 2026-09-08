import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
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
        const response = await apiGet<{ data: AppSetting[] }>(ENDPOINTS.SETTINGS.LIST);
        return response.data;
    },

    getByKey: async (key: string) => {
        const response = await apiGet<{ data: AppSetting }>(ENDPOINTS.SETTINGS.DETAIL(key));
        return response.data;
    },

    update: async (key: string, value: string | File | null) => {
        if (value instanceof File) {
            const formData = new FormData();
            formData.append("value", value);
            const response = await apiPost<{ data: AppSetting }>(ENDPOINTS.SETTINGS.UPDATE(key), formData);
            return response.data;
        }

        const response = await apiPost<{ data: AppSetting }>(ENDPOINTS.SETTINGS.UPDATE(key), { value });
        return response.data;
    }
};

export function useSettingsQuery() {
    return useQuery<AppSetting[]>({
        queryKey: queryKeys.settings.all,
        queryFn: () => settingsApi.getAll(),
        staleTime: 1000 * 60 * 5, // 5 minutes fresh
    });
}

