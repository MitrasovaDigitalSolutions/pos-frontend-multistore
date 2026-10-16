import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null | undefined): string {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
        return path;
    }
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    if (cleanPath.startsWith("/logo/") || cleanPath.startsWith("/favicon")) {
        return cleanPath;
    }
    
    if (cleanPath.startsWith("/storage/")) {
        return `${baseUrl}${cleanPath}`;
    }
    
    return `${baseUrl}/storage${cleanPath}`;
}

/**
 * Safely extracts an array from various API response shapes:
 * - Direct array: [...]
 * - Standard paginated: { data: [...] }
 * - Nested Laravel paginated: { data: { data: [...] } }
 * - Items array: { items: [...] }
 * Returns [] if response is null, undefined, or not containing an array.
 */
export function extractDataList<T>(res: unknown): T[] {
    if (Array.isArray(res)) return res as T[];
    if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as T[];
        if (obj.data && typeof obj.data === "object") {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as T[];
        }
        if (Array.isArray(obj.items)) return obj.items as T[];
    }
    return [];
}
