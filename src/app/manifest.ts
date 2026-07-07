import type { MetadataRoute } from "next/dist/lib/metadata/types/metadata-interface";
import { getSettingOnServer } from "@/features/settings/api/settings-server";
import { getImageUrl } from "@/lib/utils";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const appName = await getSettingOnServer("app_name", "Mitrasova POS");
    const appDescription = await getSettingOnServer(
        "app_description",
        `Sistem Point of Sale Modern untuk ${appName}`
    );

    // Create short name from appName
    const shortName = appName.length > 12 ? appName.substring(0, 10) + " POS" : appName;
    const appLogoRaw = await getSettingOnServer("app_logo_url", "/logo/logo.png");
    const appLogo = getImageUrl(appLogoRaw);

    return {
        name: appName + " POS",
        short_name: shortName,
        description: appDescription,
        theme_color: "#0f172a",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/checkout",
        icons: [
            {
                src: appLogo || "/logo/logo.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
            },
        ],
    };
}
