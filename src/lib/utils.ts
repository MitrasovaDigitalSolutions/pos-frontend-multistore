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
