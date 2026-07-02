import type { AppSetting } from "./settings-api";

export async function getSettingsOnServer(): Promise<AppSetting[]> {
    try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
        const res = await fetch(`${apiUrl}/api/v1/settings`, {
            cache: "no-store"
        });
        if (!res.ok) {
            console.error("Failed to fetch settings from server, status:", res.status);
            return [];
        }
        const response = await res.json() as { data: AppSetting[] };
        return response.data || [];
    } catch (e) {
        console.error("Error fetching settings on server:", e);
        return [];
    }
}

export async function getSettingOnServer(key: string, defaultValue = ""): Promise<string> {
    const settings = await getSettingsOnServer();
    const setting = settings.find((s) => s.key === key);
    return setting && setting.value !== null && setting.value !== undefined ? setting.value : defaultValue;
}
