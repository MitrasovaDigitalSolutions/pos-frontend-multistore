// ─── API Error Classes ──────────────────────────────────────────────────────

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public errors?: Record<string, string[]>,
    ) {
        super(message);
        this.name = "ApiError";
    }

    static fromResponse(
        status: number,
        data: { message?: string; errors?: Record<string, string[]> },
    ): ApiError {
        return new ApiError(
            data.message || `Request failed with status ${status}`,
            status,
            data.errors,
        );
    }

    get isUnauthorized(): boolean {
        return this.statusCode === 401;
    }

    get isForbidden(): boolean {
        return this.statusCode === 403;
    }

    get isNotFound(): boolean {
        return this.statusCode === 404;
    }

    get isValidationError(): boolean {
        return this.statusCode === 422;
    }

    get isServerError(): boolean {
        return this.statusCode >= 500;
    }
}

export class NetworkError extends Error {
    constructor(message = "Koneksi ke server gagal. Pastikan backend aktif.") {
        super(message);
        this.name = "NetworkError";
    }
}

// ─── Error Message Helpers ──────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof NetworkError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Terjadi kesalahan yang tidak diketahui.";
}
