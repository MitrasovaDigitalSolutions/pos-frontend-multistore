import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * ─── Centralized Cache Invalidation Helpers ────────────────────────────────────
 * Event-Driven Cache Invalidation to keep all interconnected features
 * synchronized without polling or continuous background network load.
 */

/**
 * Invalidate all queries related to Stock & Inventory changes
 * (Adjustment, Stock Opname, Stock Transfer, Request Transfer, Checkout, Receiving, Return)
 */
export function invalidateStockQueries(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.productStores.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.purchase.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
}

/**
 * Invalidate all queries related to Supplier changes
 */
export function invalidateSupplierQueries(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.purchase.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.supplierSales.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
}

/**
 * Invalidate all queries related to Product Master changes
 */
export function invalidateProductMasterQueries(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.productStores.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.productCatalog.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.supplierSales.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
}

/**
 * Invalidate all queries related to Store / Branch changes
 */
export function invalidateStoreQueries(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.productStores.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
}

/**
 * Invalidate all queries related to Finance, Expenses, Cash, and Accounts
 */
export function invalidateFinanceQueries(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.chartOfAccounts.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.manualJournals.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
}

/**
 * Invalidate all queries related to Member changes
 */
export function invalidateMemberQueries(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
}

/**
 * Invalidate all queries related to Category & Brand changes
 */
export function invalidateCategoryBrandQueries(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.parentCategories.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
}
