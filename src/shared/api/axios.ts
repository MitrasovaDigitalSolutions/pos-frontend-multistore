import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ApiError, NetworkError } from "@/shared/errors/api-error";
import { signOut } from "next-auth/react";

// Guard to prevent multiple concurrent signOut calls when several
// requests simultaneously receive a 401 response.
let isSigningOut = false;

// ─── Axios Instance ─────────────────────────────────────────────────────────
// All requests go through the Next.js API proxy route handler.
// The proxy attaches the Bearer token from the server-side session.

const apiClient = axios.create({
    baseURL: "/api/proxy",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 30000,
});

// ─── Request Interceptor ────────────────────────────────────────────────────

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add correlation ID for request tracing
        config.headers.set(
            "X-Correlation-ID",
            `pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        );

        // If the payload is FormData, delete the Content-Type header to allow Axios and the browser
        // to dynamically set the Content-Type with the correct boundary parameter.
        if (config.data instanceof FormData) {
            config.headers.delete("Content-Type");
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor ───────────────────────────────────────────────────

apiClient.interceptors.response.use(
    (response) => response,
    async (
        error: AxiosError<{
            message?: string;
            errors?: Record<string, string[]>;
        }>,
    ) => {
        // Network error (no response)
        if (!error.response) {
            return Promise.reject(new NetworkError());
        }

        const { status, data } = error.response;

        // Unauthorized — session expired, force re-login
        if (status === 401) {
            if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login" &&
                !isSigningOut
            ) {
                isSigningOut = true;
                await signOut({ callbackUrl: "/login" });
                // isSigningOut intentionally stays true until page reload.
            }
        }

        return Promise.reject(
            ApiError.fromResponse(status, {
                message: data?.message,
                errors: data?.errors,
            }),
        );
    },
);

export { apiClient };
