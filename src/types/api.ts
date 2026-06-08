// ─── Generic API Response Types ─────────────────────────────────────────────

export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

// ─── Request Types ──────────────────────────────────────────────────────────

export interface PaginationParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

// ─── Mutation Result ────────────────────────────────────────────────────────

export interface MutationResult<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}
