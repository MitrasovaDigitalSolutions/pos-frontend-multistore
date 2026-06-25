import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetList, apiPost, apiPut, apiDelete, apiGet } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Expense, ExpenseCategory, UpcomingDue } from "../types";
import type { ExpenseCategoryInput, ExpenseInput } from "../schemas/expense-schema";

// ─── Expense Categories ──────────────────────────────────────────────────────

export function useExpenseCategories() {
    return useQuery<ExpenseCategory[]>({
        queryKey: queryKeys.expenses.categories(),
        queryFn: async () => {
            const res = await apiGet<{ data: ExpenseCategory[] }>("/v1/expense-categories");
            return res.data;
        },
    });
}

export function useCreateExpenseCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ExpenseCategory>, Error, ExpenseCategoryInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ExpenseCategory>, ExpenseCategoryInput>("/v1/expense-categories", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categories() });
        },
    });
}

export function useUpdateExpenseCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ExpenseCategory>, Error, { uid: string; data: ExpenseCategoryInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<ExpenseCategory>, ExpenseCategoryInput>(`/v1/expense-categories/${uid}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categories() });
        },
    });
}

export function useDeleteExpenseCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/expense-categories/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categories() });
        },
    });
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export function useExpenses(params?: PaginationParams & {
    date_start?: string;
    date_end?: string;
    expense_category_uid?: string;
    cash_account_uid?: string;
    search?: string;
}) {
    return useQuery<PaginatedResponse<Expense>>({
        queryKey: [...queryKeys.expenses.list(), params],
        queryFn: () => apiGetList<Expense>("/v1/expenses", params),
    });
}

export function useUpcomingExpenses() {
    return useQuery<UpcomingDue[]>({
        queryKey: queryKeys.expenses.upcoming(),
        queryFn: async () => {
            const res = await apiGet<{ data: UpcomingDue[] }>("/v1/expenses/upcoming-dues");
            return res.data;
        },
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Expense>, Error, ExpenseInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Expense>, ExpenseInput>("/v1/expenses", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() });
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.upcoming() });
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
        },
    });
}

export function useUpdateExpense() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Expense>, Error, { uid: string; data: ExpenseInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<Expense>, ExpenseInput>(`/v1/expenses/${uid}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() });
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.upcoming() });
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
        },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/expenses/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list() });
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.upcoming() });
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
        },
    });
}
