import { apiClient } from "./axios";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { AxiosRequestConfig } from "axios";

// ─── Typed API Client ───────────────────────────────────────────────────────
// Thin wrapper around axios for type-safe API calls.

export async function apiGet<T>(
    url: string,
    config?: AxiosRequestConfig,
): Promise<T> {
    const { data } = await apiClient.get<T>(url, config);
    return data;
}

export async function apiPost<T, D = unknown>(
    url: string,
    payload?: D,
): Promise<T> {
    const { data } = await apiClient.post<T>(url, payload);
    return data;
}

export async function apiPut<T, D = unknown>(
    url: string,
    payload?: D,
): Promise<T> {
    const { data } = await apiClient.put<T>(url, payload);
    return data;
}

export async function apiPatch<T, D = unknown>(
    url: string,
    payload?: D,
): Promise<T> {
    const { data } = await apiClient.patch<T>(url, payload);
    return data;
}

export async function apiDelete<T>(url: string): Promise<T> {
    const { data } = await apiClient.delete<T>(url);
    return data;
}

// ─── Convenience: Unwrap ApiResponse ────────────────────────────────────────

export async function apiGetData<T>(
    url: string,
    config?: AxiosRequestConfig,
): Promise<T> {
    const response = await apiGet<ApiResponse<T>>(url, config);
    return response.data;
}

export async function apiPostData<T, D = unknown>(
    url: string,
    payload?: D,
): Promise<T> {
    const response = await apiPost<ApiResponse<T>, D>(url, payload);
    return response.data;
}

export async function apiGetList<T>(
    url: string,
    params?: PaginationParams,
): Promise<PaginatedResponse<T>> {
    return apiGet<PaginatedResponse<T>>(url, { params });
}

